"""Regenerate the representative packaging GLBs and thumbnails with Blender."""
from math import cos, exp, pi, sin
from pathlib import Path

import bpy
from mathutils import Vector

OUTPUT = Path(__file__).resolve().parents[1] / 'public/assets/3d/formats'
OUTPUT.mkdir(exist_ok=True)

# Width, height, depth, profile and laminate color. Blender front faces -Y.
POUCHES = {
    'flat-bottom-pouch': (1.02, 1.43, .46, 'box', (.62, .46, .25)),
    'flat-pouch': (.84, 1.18, .12, 'flat', (.30, .54, .49)),
    'pinch-bottom-pouches': (.98, 1.65, .41, 'pinch', (.68, .44, .26)),
    'polybag': (.95, 1.24, .30, 'tied', (.60, .76, .72)),
    'quad-seal-bag': (.88, 1.51, .52, 'quad', (.23, .40, .56)),
    'retort-pouch': (1.22, 1.00, .16, 'retort', (.55, .58, .59)),
    'shaped-pouch': (.94, 1.29, .26, 'shaped', (.66, .32, .24)),
    'spout-pouch': (.93, 1.35, .31, 'spout', (.44, .70, .54)),
    'stand-up-pouch-tap': (1.00, 1.35, .38, 'tap', (.37, .58, .67)),
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


def surface(name, columns, rows, point, mat, reverse=False, mirror=False):
    verts = [point(x / columns, y / rows) for y in range(rows + 1) for x in range(columns + 1)]
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
        uvs.data[loop.index].uv = (1 - u if mirror else u, (index // stride) / rows)
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


def make_tap(x, y, z, dark):
    cylinder('Tap mounting flange', .098, .068, (x, y, z), dark, 'Y')
    cylinder('Tap stem', .062, .156, (x, y - .082, z), dark, 'Y')
    cylinder('Flow outlet', .037, .105, (x, y - .139, z - .038), dark)
    handle = cylinder('Tap lever', .076, .033, (x, y - .115, z + .064), dark)
    handle.scale.y = .66


def make_pouch(w, h, d, kind, color):
    finish = material('Printable laminate', color, .46, .18 if kind == 'retort' else .03)
    folds = material('Laminate edge', tuple(c * .72 for c in color), .54)
    dark = material('Closure', (.055, .105, .11), .38)
    hardware = material('Soft ivory cap', (.82, .77, .58), .37)
    expanded = kind in ('box', 'pinch', 'quad')
    ns, nt = 24, 46

    def point(u, v, side):
        p = 2 * u - 1
        height = h * v
        width = profile(v, [(0, .91), (.07, 1), (.27, 1), (.83, .96), (1, .91)])
        depth = profile(v, [(0, .45), (.12, .86), (.36, 1), (.68, .83), (.89, .22), (.99, .025), (1, .025)])
        outline = sin(pi * u) ** .73
        edge = min(u, 1 - u)
        soft = .007 * sin(19 * u + 13 * v + side) * sin(pi * v) ** 2 * sin(pi * u)
        if expanded:
            width = profile(v, [(0, .94), (.08, 1), (.76, .98), (.92, .91), (1, .89)])
            depth = profile(v, [(0, .93 if kind != 'pinch' else .10), (.15, 1), (.75, .95), (1, .025)])
            outline = .78 + .20 * sin(pi * u)
            if kind == 'pinch':
                height += .048 * p + .028 * p * p * (1 - v) ** 4
        elif kind in ('flat', 'retort'):
            width = profile(v, [(0, .94), (.08, 1), (.91, 1), (1, .94)])
            depth = sin(pi * v) ** .8
            soft *= .42
            if kind == 'retort':
                height += .022 * p * p * (1 - 2 * v)
        elif kind == 'shaped':
            width = profile(v, [(0, .72), (.09, .90), (.29, 1), (.55, .94), (.76, .63), (.92, .52), (1, .59)])
        elif kind == 'spout':
            height -= .195 * (1 - u) * v ** 5
        elif kind == 'tied':
            width = profile(v, [(0, .85), (.09, .97), (.45, 1), (.68, .88), (.82, .18), (.88, .17), (1, .45)])
            depth = profile(v, [(0, .28), (.12, .85), (.41, 1), (.65, .78), (.83, .19), (1, .21)])
            soft *= 2.2
        ridge = 0
        if kind != 'tied':
            ridge = (.007 * exp(-((v - .932) / .012) ** 2) + .004 * exp(-((v - .968) / .010) ** 2))
            if not expanded:
                ridge += .006 * exp(-((edge - .035) / .024) ** 2) * sin(pi * v)
            if kind == 'quad':
                ridge += .013 * exp(-((edge - .025) / .022) ** 2) * sin(pi * v) ** .4
        return (w * p * width / 2, side * (.003 + d * depth * outline / 2 + soft + ridge), height)

    panels = [
        surface('Front', ns, nt, lambda u, v: point(u, v, -1), finish),
        surface('Back', ns, nt, lambda u, v: point(u, v, 1), finish, reverse=True, mirror=True),
    ]

    def join(u, v, s):
        return tuple(mix(a, b, s) for a, b in zip(point(u, v, -1), point(u, v, 1)))

    for u, name in [(0, 'Left gusset'), (1, 'Right gusset')]:
        def gusset(s, v, u=u):
            x, y, z = join(u, v, s)
            fold = (.068 if kind in ('pinch', 'quad') else .018) * sin(pi * s) * sin(pi * v) ** .5
            return x + (1 - 2 * u) * fold, y, z
        surface(name, 10, nt, gusset, folds, reverse=(u == 0))
    surface('Top seal', ns, 6, lambda u, s: join(u, 1, s), folds)
    surface('Bottom seam', ns, 10, lambda u, s: join(u, 0, s), folds, reverse=True)

    if kind == 'spout':
        x = w * .32
        cylinder('Spout collar', .083, .095, (x, 0, h - .022), hardware)
        cylinder('Spout cap', .072, .107, (x, 0, h + .063), hardware)
        for i in range(18):
            a = 2 * pi * i / 18
            cylinder('Grip rib', .0055, .071, (x + .071 * cos(a), .071 * sin(a), h + .062), hardware)
    if kind == 'tap':
        make_tap(w * .25, point(.75, .15, -1)[1], h * .19, dark)
    if kind == 'tied':
        cylinder('Closure band', .075, .038, (0, 0, h * .85), dark)

    return panels


def make_box():
    board = material('White carton board', (.78, .71, .57), .65)
    panel = material('Printed carton board', (.65, .74, .63), .61)
    plastic = material('Tap hardware', (.068, .11, .115), .44)
    w, h, d = 1.05, 1.32, .73
    front = surface('Front', 1, 1, lambda u, v: ((u - .5) * w, -d / 2, v * h), panel)
    back = surface('Back', 1, 1, lambda u, v: ((u - .5) * w, d / 2, v * h), panel, reverse=True, mirror=True)
    for side in [-1, 1]:
        surface('Carton side', 1, 1, lambda u, v, side=side: (side * w / 2, (u - .5) * d, v * h), board, reverse=(side < 0))
    for height in [0, h]:
        surface('Carton flap', 1, 1, lambda u, v, height=height: ((u - .5) * w, (v - .5) * d, height), board, reverse=(height == 0))
    make_tap(.03, -d / 2, .21, plastic)
    return [front, back]


def make_roll():
    film = material('Printable roll film', (.32, .49, .55), .37)
    rim = material('Layered film edge', (.67, .70, .67), .62)
    card = material('Kraft core', (.41, .27, .13), .7)
    dark = material('Inside core', (.22, .14, .095), .72)
    radius, inner, half = .46, .18, .61

    def point(u, v, r=radius):
        angle = u * 2 * pi
        return (r * cos(angle), r * sin(angle), v * 2 * half)

    printed = surface('Front Film', 80, 4, point, film)
    for side in [0, 1]:
        def annulus(u, s, side=side):
            return point(u, side, mix(inner, radius, s))
        surface('Wound laminate', 80, 5, annulus, rim, reverse=(side == 1))
        def core_end(u, s, side=side):
            x, y, z = point(u, side, mix(inner - .024, inner + .016, s))
            return x, y, z + (.014 if side else -.014)
        surface('Carton core rim', 80, 3, core_end, card, reverse=(side == 1))
    surface('Hollow inner core', 80, 3, lambda u, v: point(u, v, inner - .024), dark, reverse=True)
    return [printed]


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
    scene.cycles.samples = 30
    scene.cycles.use_denoising = False
    scene.render.resolution_x = 320
    scene.render.resolution_y = 270
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
    cam.location = center + Vector((2.25, -4.4, 2 if slug in ('roll-stock-films', 'bag-in-box') else 1.06))
    aim(cam, center)
    data.type = 'ORTHO'
    data.ortho_scale = max(dim.x, dim.y, dim.z * 1.15) * 1.27
    scene.camera = cam
    scene.render.filepath = str(OUTPUT / (slug + '.webp'))
    bpy.ops.render.render(write_still=True)


for slug in (*POUCHES, 'bag-in-box', 'roll-stock-films'):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if slug == 'bag-in-box':
        make_box()
    elif slug == 'roll-stock-films':
        make_roll()
    else:
        make_pouch(*POUCHES[slug])
    bpy.context.view_layer.update()
    models = list(bpy.context.scene.objects)
    bpy.ops.export_scene.gltf(filepath=str(OUTPUT / (slug + '.glb')), export_format='GLB', export_yup=True)
    poster(slug, models)
