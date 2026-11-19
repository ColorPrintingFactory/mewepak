"""Regenerate the packaging models in Blender using the example prints.

Run build-packaging-artwork.py first, then pass its output directory after --.
"""
from math import cos, exp, pi, sin
from pathlib import Path
import sys

import bpy
from mathutils import Vector

OUTPUT = Path(__file__).resolve().parents[1] / 'public/assets/3d/formats'
OUTPUT.mkdir(exist_ok=True)
if '--' not in sys.argv or not sys.argv[sys.argv.index('--') + 1:]:
    raise SystemExit('Pass the generated example artwork directory after --')
ARTWORK = Path(sys.argv[sys.argv.index('--') + 1]).resolve()

# Width, height, depth, profile and laminate color. Blender front faces -Y.
POUCHES = {
    'flat-bottom-pouch': (1.02, 1.43, .46, 'box', (.13, .24, .19)),
    'flat-pouch': (.84, 1.18, .12, 'flat', (.12, .26, .30)),
    'pinch-bottom-pouches': (.98, 1.65, .41, 'pinch', (.27, .14, .10)),
    'polybag': (.95, 1.24, .30, 'tied', (.20, .36, .28)),
    'quad-seal-bag': (.88, 1.51, .52, 'quad', (.16, .22, .36)),
    'retort-pouch': (1.22, 1.00, .16, 'retort', (.34, .24, .20)),
    'shaped-pouch': (.94, 1.29, .26, 'shaped', (.32, .18, .20)),
    'spout-pouch': (.93, 1.35, .31, 'spout', (.15, .34, .24)),
    'stand-up-pouch-tap': (1.00, 1.35, .38, 'tap', (.14, .31, .38)),
}


def mix(a, b, amount):
    return a + (b - a) * amount


def profile(value, points):
    for (start, low), (end, high) in zip(points, points[1:]):
        if value <= end:
            amount = (value - start) / (end - start)
            amount = amount * amount * (3 - 2 * amount)
            return mix(low, high, amount)
    return points[-1][1]


def material(name, color, roughness=.48, metal=0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Metallic'].default_value = metal
    mat.diffuse_color = (*color, 1)
    return mat


def printed_material(slug, side, roughness=.44, metallic=0):
    mat = material(f'{side.capitalize()} print', (1, 1, 1), roughness, metallic)
    shader = mat.node_tree.nodes.get('Principled BSDF')
    texture = mat.node_tree.nodes.new('ShaderNodeTexImage')
    texture.image = bpy.data.images.load(str(ARTWORK / f'{slug}-{side}.jpg'))
    mat.node_tree.links.new(texture.outputs['Color'], shader.inputs['Base Color'])
    return mat


def surface(name, columns, rows, point, mat, reverse=False, mirror=False, levels=None, u_range=(0, 1)):
    levels = levels or [y / rows for y in range(rows + 1)]
    verts = [point(x / columns, level) for level in levels for x in range(columns + 1)]
    stride = columns + 1
    faces = [
        (i, i + 1, i + stride + 1, i + stride)
        for y in range(rows) for x in range(columns) for i in [x + y * stride]
    ]
    if reverse:
        faces = [face[::-1] for face in faces]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    mesh.materials.append(mat)
    uvs = mesh.uv_layers.new(name='Artwork')
    for poly in mesh.polygons:
        poly.use_smooth = True
    for loop in mesh.loops:
        index = loop.vertex_index
        u = (index % stride) / columns
        uvs.data[loop.index].uv = (mix(*u_range, 1 - u if mirror else u), levels[index // stride])
    return obj


def cylinder(name, radius, depth, loc, mat, axis='Z'):
    bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=radius, depth=depth, location=loc)
    obj = bpy.context.object
    obj.name = name
    if axis == 'Y':
        obj.rotation_euler.x = pi / 2
    obj.data.materials.append(mat)
    for poly in obj.data.polygons:
        poly.use_smooth = len(poly.vertices) == 4
    bevel = obj.modifiers.new('Rounded edges', 'BEVEL')
    bevel.width = min(.012, depth * .2)
    bevel.segments = 2
    obj.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
    return obj


def gauss(position, center, spread):
    return exp(-((position - center) / spread) ** 2)


def ramp(value):
    value = min(1, max(0, value))
    return value * value * (3 - 2 * value)


def torus(name, radius, tube, loc, mat, axis='Z'):
    bpy.ops.mesh.primitive_torus_add(
        major_segments=40, minor_segments=8, major_radius=radius, minor_radius=tube,
        location=loc, rotation=(pi / 2 if axis == 'Y' else 0, 0, 0),
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def make_tap(x, y, z, valve):
    gasket = material('Rubber mounting gasket', (.035, .055, .054), .58)
    inset = material('Outlet interior', (.012, .024, .023), .73)
    cylinder('Tap mounting flange', .098, .061, (x, y - .008, z), valve, 'Y')
    torus('Tap flange gasket', .086, .012, (x, y - .027, z), gasket, 'Y')
    cylinder('Tap stem', .059, .146, (x, y - .087, z), valve, 'Y')
    cylinder('Flow outlet', .039, .095, (x, y - .141, z - .039), valve)
    cylinder('Recessed outlet', .027, .004, (x, y - .141, z - .087), inset)
    torus('Outlet lip', .033, .005, (x, y - .141, z - .086), valve)
    handle = cylinder('Tap paddle', .071, .025, (x, y - .142, z + .062), valve)
    handle.scale = (1.35, .70, 1)


def make_pouch(slug, w, h, d, kind, edge_color):
    matte = {'tied': .40, 'retort': .38, 'flat': .48, 'pinch': .49}.get(kind, .45)
    metal = .12 if kind == 'retort' else 0
    front_print = printed_material(slug, 'front', matte, metal)
    back_print = printed_material(slug, 'back', matte, metal)
    folds = material('Folded laminate', edge_color, .50, metal)
    top_edge = material('Welded top film', (.77, .74, .64), .47, metal)
    dark = material('Molded closure', (.06, .14, .15), .32)
    welded = kind in ('flat', 'retort', 'shaped', 'spout', 'tap')
    spout_u = .82
    gusseted = kind in ('box', 'pinch', 'quad')
    flat = kind in ('flat', 'retort')
    top = .945
    levels = sorted(set([i / 50 for i in range(51)] +
        [.012, .024, .043, .083, .839, .857, .873, .885,
         .91, .922, .931, .942, .951, .958, .965, .974, .981, .988, .995]))
    ns, nt = 26, len(levels) - 1

    def face(u, v, side):
        p = 2 * u - 1
        z = h * v
        width = profile(v, [(0, .89), (.045, .96), (.14, 1), (.38, .987), (.80, .965), (.94, .94), (1, .92)])
        depth = profile(v, [(0, .43), (.10, .89), (.30, 1), (.58, .87), (.75, .55), (.89, .12), (1, .018)])
        outline = sin(pi * u) ** .73
        edge = min(u, 1 - u)
        flex = .008 * sin(19 * u + 13 * v + side) * sin(pi * v) ** 2 * sin(pi * u)
        flex += .012 * sin(30 * u + 18 * v + side) * gauss(v, .105, .064) * sin(pi * u)

        if gusseted:
            width = profile(v, [(0, .96), (.08, 1), (.65, .995), (.82, .974), (.93, .907), (1, .90)])
            depth = profile(v, [(0, .88 if kind != 'pinch' else .075), (.14, 1), (.54, .98), (.74, .86), (.88, .37), (.96, .035), (1, .024)])
            outline = .77 + .23 * sin(pi * u) ** .55
            flex += .009 * sin(46 * u - 19 * v + side) * gauss(v, .77, .115) * sin(pi * u)
            if kind == 'pinch':
                width *= 1 + .038 * gauss(v, .1, .13)
                z += (.020 * p + .033 * p * p) * gauss(v, .028, .127)
            if kind == 'quad':
                width *= 1 - .040 * gauss(v, .78, .09)
        elif flat:
            width = profile(v, [(0, .928), (.038, .981), (.085, 1), (.92, 1), (.965, .982), (1, .937)])
            depth = ramp((v - .051) / .19) * ramp((.948 - v) / .19) * (1 - .12 * gauss(v, .76, .15))
            flex *= .30
            z += (.026 if kind == 'retort' else .014) * p ** 6 * (gauss(v, 0, .067) - gauss(v, 1, .067))
        elif kind == 'spout':
            width *= profile(v, [(0, 1), (.62, 1), (.87, .91), (1, .84)])
            # A level seat at the neck blends into the sloped shoulders at both sides.
            drop = .23 * (1 - u) + .092 * ramp((u - .89) / .11)
            seat = 1 - ramp(abs(u - spout_u) / .105)
            z -= mix(drop, .042, seat) * v ** 5
        elif kind == 'shaped':
            width = profile(v, [(0, .68), (.075, .87), (.33, 1), (.49, .91), (.61, .68), (.77, .54), (.92, .60), (1, .57)])
        elif kind == 'tied':
            width = profile(v, [(0, .84), (.09, .96), (.43, 1), (.65, .91), (.82, .14), (.875, .145), (1, .48)])
            depth = profile(v, [(0, .30), (.15, .84), (.40, 1), (.63, .83), (.82, .19), (1, .23)])
            flex += .024 * sin(35 * u + side + 5 * v) * gauss(v, .77, .19) * sin(pi * u)
            z += .015 * sin(17 * u + side) * gauss(v, 1, .12)

        crimp = 0
        if kind != 'tied':
            top_heat = ramp((v - .898) / .034)
            crimp = .0048 * gauss(v, top, .008) + .0046 * gauss(v, .973, .009)
            crimp += .00125 * (1 + sin(464 * v)) * top_heat
            if welded:
                # Embossing diminishes before the outer cut edge of the laminate.
                crimp *= ramp(edge / .09)
            if not gusseted:
                # Tight welded margins stay flat as the center of the laminate expands.
                outline *= .17 + .83 * ramp(edge / .095)
                crimp += .0052 * gauss(edge, .041, .016) * sin(pi * v) ** .5
            if flat:
                crimp += ramp(edge / .09) * (
                    .0048 * gauss(v, .050, .012) + .0011 * gauss(v, .030, .034) * (1 + sin(410 * v))
                )
            if kind in ('box', 'quad'):
                crimp += .012 * gauss(edge, .024, .012) * ramp((v - .02) / .080) * ramp((.97 - v) / .09)
            if kind in ('box', 'shaped', 'tap'):
                crimp += .0069 * gauss(v, .874, .010) * ramp(edge / .075)
        return (w * p * width / 2, side * (.004 + d * depth * outline / 2 + flex + crimp), z)

    surface('Front', ns, nt, lambda u, v: face(u, v, -1), front_print, levels=levels)
    surface('Back', ns, nt, lambda u, v: face(u, v, 1), back_print, reverse=True, mirror=True, levels=levels)

    def bridge(u, v, t):
        return tuple(mix(a, b, t) for a, b in zip(face(u, v, -1), face(u, v, 1)))

    for u, edge_name in [(0, 'left'), (1, 'right')]:
        if welded:
            # Each half of the seal takes the adjacent face's edge color, including uploaded artwork.
            for side, offset, print_material, print_u in [
                ('Front', 0, front_print, u), ('Back', .5, back_print, 1 - u),
            ]:
                surface(f'{side} {edge_name} seal', 2, nt,
                        lambda t, v: bridge(u, v, offset + t / 2), print_material,
                        reverse=(u == 0), levels=levels, u_range=(print_u, print_u))
            continue
        def gusset(t, v, u=u):
            x, y, z = bridge(u, v, t)
            if gusseted:
                fold = (.073 if kind in ('pinch', 'quad') else .038) * sin(pi * t) ** .7
                x += (1 - 2 * u) * fold * sin(pi * v) ** .52
            return x, y, z
        surface(f'{edge_name.capitalize()} gusset', 12, nt, gusset, folds, reverse=(u == 0), levels=levels)
    surface('Top heat-sealed edge', ns, 6, lambda u, t: bridge(u, 1, t), top_edge)

    def bottom(u, t):
        x, y, z = bridge(u, 0, t)
        inner_fold = .058 if kind in ('box', 'tap', 'spout', 'shaped') else .021
        return x, y, z + inner_fold * sin(pi * t) ** 1.4 * sin(pi * u) ** .8

    surface('Bottom fold', ns, 12, bottom, folds, reverse=True)

    if kind == 'spout':
        x, _, z = face(spout_u, 1, -1)
        fitment = material('Molded spout fitment', (.35, .46, .38), .43)
        cap_material = material('Warm ivory cap', (.68, .66, .56), .39)

        def weld_neck(u, v):
            angle = 2 * pi * u
            rx = profile(v, [(0, .069), (.30, .088), (.55, .076), (.80, .052), (1, .040)])
            ry = profile(v, [(0, .013), (.35, .015), (.61, .027), (.84, .040), (1, .040)])
            return x + rx * cos(angle), ry * sin(angle), z - .062 + .083 * v

        surface('Welded spout seat', 64, 16, weld_neck, fitment)
        cylinder('Molded neck collar', .050, .023, (x, 0, z + .023), fitment)
        cylinder('Spout neck', .038, .031, (x, 0, z + .043), fitment)
        torus('Tamper-evident cap band', .048, .006, (x, 0, z + .047), cap_material)
        cap_z = z + .053

        def cap(u, v):
            angle = 2 * pi * u
            grip = .0025 * (1 + cos(27 * angle)) * ramp(v / .17) * ramp((1 - v) / .18)
            radius = .053 - .004 * gauss(v, 1, .18) + grip
            return x + radius * cos(angle), radius * sin(angle), cap_z + v * .078

        surface('Fluted screw cap', 108, 12, cap, cap_material)
        cylinder('Sealed cap top', .0495, .010, (x, 0, cap_z + .076), cap_material)
    if kind == 'tap':
        x, y, z = face(.71, .18, -1)
        make_tap(x, y, z, dark)
    if kind == 'tied':
        tie = cylinder('Gathered neck tie', w * .083, .026, (0, 0, h * .847), dark)
        tie.scale.y = .68


def make_box(slug):
    board = material('Carton board', (.76, .70, .55), .55)
    edge = material('Paper score lines', (.44, .44, .36), .64)
    valve = material('Tap hardware', (.070, .14, .14), .35)
    w, h, d = 1.05, 1.32, .73
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, h / 2))
    box = bpy.context.object
    box.name = 'Carton structure'
    box.dimensions = (w, d, h)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    box.data.materials.append(board)
    bevel = box.modifiers.new('Soft paper folds', 'BEVEL')
    bevel.width, bevel.segments = .011, 3
    box.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
    x_edge, z_edge = w * .5 - .011, h - .011

    for side, label in [(-1, 'front'), (1, 'back')]:
        surface(label.capitalize(), 1, 1, lambda u, v, side=side:
            ((2 * u - 1) * x_edge, side * (d / 2 + .0008), mix(.011, z_edge, v)),
            printed_material(slug, label, .57), reverse=(side > 0), mirror=(side > 0))
    for side, label in [(-1, 'left'), (1, 'right')]:
        surface('Printed carton ' + label, 1, 1, lambda u, v, side=side:
            (side * (w / 2 + .0008), (u - .5) * (d - .020), mix(.011, z_edge, v)),
            printed_material(slug, label, .57), reverse=(side < 0), mirror=(side < 0))
    surface('Top carton flap seam', 1, 1, lambda u, v:
        ((2 * u - 1) * x_edge, mix(-.003, .003, v), h + .001), edge)
    make_tap(.03, -d / 2, .206, valve)


def make_roll(slug):
    film = printed_material(slug, 'front', .34)
    rim = material('Wound film layers', (.69, .73, .68), .56)
    core = material('Kraft paper tube', (.39, .25, .11), .66)
    dark = material('Inside paper core', (.30, .19, .10), .76)
    radius, inner, height = .46, .178, 1.19

    def point(u, v, r=radius):
        angle = u * 2 * pi
        return r * cos(angle), r * sin(angle), v * height

    surface('Front roll film', 96, 8, point, film)
    for side in [0, 1]:
        def layers(u, t, side=side):
            x, y, z = point(u, side, mix(inner, radius, t))
            return x, y, z + (1 if side else -1) * .0026 * (1 + cos(t * pi * 46))
        surface('Wound laminate layers', 72, 49, layers, rim, reverse=(side == 1))
        def tube_end(u, t, side=side):
            x, y, z = point(u, side, mix(inner - .025, inner, t))
            return x, y, z + (.013 if side else -.013)
        surface('Kraft core end', 72, 4, tube_end, core, reverse=(side == 1))
        surface('Kraft core outer rim', 72, 1, lambda u, v, side=side:
            point(u, side + (v - 1 + side) * .013 / height, inner), core)
    surface('Hollow paper core', 72, 4, lambda u, v: point(u, mix(-.013, 1.013, v), inner - .025),
            dark, reverse=True)

    # The printable loose edge leaves the roll tangentially and curls gently outward.
    def film_end(u, v):
        t = u * .58
        return t, -radius + .16 * sin(pi * u * .86) * u, height * v + .006 * sin(pi * u)
    surface('Front film leader', 24, 8, film_end, film, u_range=(0, 1 / 3))


def aim(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()


def poster(slug, models):
    scene = bpy.context.scene
    coords = [o.matrix_world @ Vector(corner) for o in models for corner in o.bound_box]
    low = Vector(tuple(min(p[axis] for p in coords) for axis in range(3)))
    high = Vector(tuple(max(p[axis] for p in coords) for axis in range(3)))
    center = (low + high) / 2
    dim = high - low

    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 40
    scene.cycles.use_denoising = False
    scene.render.resolution_x = 480
    scene.render.resolution_y = 400
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'WEBP'
    scene.render.image_settings.quality = 87
    scene.world = bpy.data.worlds.new('Studio world')
    scene.world.use_nodes = True
    scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = .42
    scene.view_settings.view_transform = 'AgX'
    for name, loc, power, size in [
        ('Key', (-3.2, -4, 5.1), 360, 3.7),
        ('Fill', (2.9, -2, 3.2), 150, 2.8),
        ('Rim', (1.0, 3.3, 4.2), 225, 2.9),
    ]:
        lamp = bpy.data.lights.new(name, 'AREA')
        lamp.energy, lamp.size = power, size
        ob = bpy.data.objects.new(name, lamp)
        bpy.context.collection.objects.link(ob)
        ob.location = loc
        aim(ob, center)

    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, low.z - .016))
    bpy.context.object.data.materials.append(material('Studio sweep', (.77, .81, .79), .72))
    data = bpy.data.cameras.new('Product camera')
    cam = bpy.data.objects.new('Product camera', data)
    bpy.context.collection.objects.link(cam)
    portrait = Vector((1.72, -4.5, 1.65 if slug in ('roll-stock-films', 'bag-in-box') else .89))
    if '--back' in sys.argv:
        portrait.x *= -1
        portrait.y *= -1
    cam.location = center + portrait
    aim(cam, center)
    data.type = 'ORTHO'
    data.ortho_scale = max(dim.x, dim.y, dim.z * 1.15) * 1.27
    scene.camera = cam
    # Optional back renders are for offline inspection only.
    if '--back' in sys.argv:
        scene.render.filepath = str(ARTWORK / (slug + '-back.webp'))
    else:
        scene.render.filepath = str(OUTPUT / (slug + '.webp'))
    bpy.ops.render.render(write_still=True)


formats = (*POUCHES, 'bag-in-box', 'roll-stock-films')
selected = [slug for slug in sys.argv[sys.argv.index('--') + 2:] if slug in formats]
for slug in selected or formats:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if slug == 'bag-in-box':
        make_box(slug)
    elif slug == 'roll-stock-films':
        make_roll(slug)
    else:
        make_pouch(slug, *POUCHES[slug])
    bpy.context.view_layer.update()
    models = list(bpy.context.scene.objects)
    if '--back' not in sys.argv:
        bpy.ops.export_scene.gltf(
            filepath=str(OUTPUT / (slug + '.glb')), export_format='GLB',
            export_image_format='JPEG', export_jpeg_quality=87, export_yup=True,
        )
    poster(slug, models)
