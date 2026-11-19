"""Draw the editable example prints used by the Blender mockup generator."""
import argparse
from functools import lru_cache
from math import cos, pi, sin
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
LOGO_PATH = ROOT / 'public/assets/media/2026/06/logo.png'
PAPER = '#f3f0e5'
INK = '#183337'
SPECS = {
    'flat-bottom-pouch': (('Flat-bottom', 'pouch'), 'BOX POUCH', 'Five-panel construction', '#22463d', '#88a084'),
    'flat-pouch': (('Flat', 'pouch'), 'THREE-SIDE SEAL', 'Slim pack profile', '#235764', '#8aaab4'),
    'pinch-bottom-pouches': (('Pinch-bottom', 'pouch'), 'GUSSETED BAG', 'Folded end closure', '#56362e', '#ad896e'),
    'polybag': (('Polybag',), 'FLEXIBLE FILM', 'Gathered top closure', '#305c4f', '#9bbca2'),
    'quad-seal-bag': (('Quad-seal', 'bag'), 'FOUR-CORNER SEAL', 'Gusseted side panels', '#293f62', '#8596ae'),
    'retort-pouch': (('Retort pouch',), 'RETORT PACK FORMAT', 'Wide, flat footprint', '#65443b', '#b19883'),
    'shaped-pouch': (('Shaped', 'pouch'), 'CONTOUR FORMAT', 'Shaped shoulders', '#684044', '#be9391'),
    'spout-pouch': (('Spout', 'pouch'), 'POURABLE PACK FORMAT', 'Resealable screw cap', '#27604d', '#85ab8c'),
    'stand-up-pouch-tap': (('Stand-up pouch', 'with tap'), 'DISPENSING PACK FORMAT', 'Integrated dispensing tap', '#21576a', '#83a8b1'),
    'bag-in-box': (('Bag-in-box',), 'DISPENSING CARTON', 'Carton with integrated tap', '#2b5350', '#89a899'),
    'roll-stock-films': (('Roll stock',), 'PRINTED FILM', 'Continuous print repeat', '#274353', '#93aab0'),
}


@lru_cache(maxsize=None)
def font(face, size):
    return ImageFont.truetype('DejaVu' + face + '.ttf', size)


def tracked(draw, x, y, text, scale, face='Sans-Bold', size=15, color=INK, gap=2.4):
    typeface = font(face, round(size * scale))
    for char in text:
        draw.text((x, y), char, font=typeface, fill=color, anchor='lt')
        x += draw.textlength(char, font=typeface) + gap * scale


def design(slug, side, width, height, logo):
    names, family, feature, dark, tint = SPECS[slug]
    image = Image.new('RGB', (width, height), PAPER)
    draw = ImageDraw.Draw(image)
    scale = width / 720
    x = round(width * .13)

    # The contour bands suggest the fold and flow of laminate while preserving the logo and wording.
    base = .68 if side == 'front' else .78
    proto = list(SPECS).index(slug)

    def face_wave(u):
        return .075 * sin((u + .09) * pi * 1.48) + .025 * cos(pi * (u + proto * .085))

    def band_height(u):
        if slug == 'roll-stock-films':
            # The two ends of each repeat must have the same color at the join.
            return base + .056 * sin(2 * pi * (u + .17)) + .018 * cos(4 * pi * u)
        if side == 'back' and slug in ('flat-bottom-pouch', 'pinch-bottom-pouches', 'quad-seal-bag'):
            # Back and front edges meet at the same height across the printed gusset.
            return .68 + face_wave(1 - u) + .056 * max(0, sin(pi * u)) ** 1.4
        if side == 'right':
            return (.68 + face_wave(1)) * (1 - u) + (.78 + face_wave(0)) * u
        if side == 'left':
            return (.78 + face_wave(1)) * (1 - u) + (.68 + face_wave(0)) * u
        return base + face_wave(u)
    for offset, color in [(0, '#e1e8dc'), (.064, tint), (.12, dark)]:
        points = [(n, (offset + band_height(n / width)) * height) for n in range(0, width + 8, 7)]
        draw.polygon([*points, (width + 8, height), (0, height)], fill=color)
    for offset, color, line in [(.124, '#eff0db', 1.1), (.165, tint, 1.4), (.192, tint, 1)]:
        points = [(n, (offset + band_height(n / width)) * height) for n in range(0, width + 8, 7)]
        draw.line(points, fill=color, width=max(1, round(line * scale)))

    if side in ('left', 'right'):
        tracked(draw, x, height * .27, 'MEWEPAK', scale, size=19)
        draw.line((x, height * .35, width * .8, height * .35), fill=tint, width=max(1, round(scale)))
        tracked(draw, x, height * .39, 'FLEXIBLE', scale, size=14, gap=1.3)
        tracked(draw, x, height * .44, 'PACKAGING', scale, size=14, gap=1.3)
        return image

    compact = slug == 'retort-pouch'
    logo_y = .115 if compact else .195 if slug in ('polybag', 'shaped-pouch') else .16
    brand = logo.resize((round(width * .28), round(width * .28 * logo.height / logo.width)), Image.Resampling.LANCZOS)
    image.paste(brand, (x, round(height * logo_y)), brand)
    if side == 'front':
        tracked(draw, x, height * (.31 if compact or slug in ('polybag', 'shaped-pouch') else .295),
                family, scale, size=15, color=dark)
        max_line = width * .75
        size = 64
        while any(draw.textlength(name, font=font('Serif', round(size * scale))) > max_line for name in names):
            size -= 1
        typeface = font('Serif', round(size * scale))
        y = height * (.40 if compact else .39)
        for name in names:
            draw.text((x, y), name, font=typeface, fill=INK, anchor='lt')
            y += size * scale * 1.19
        y += max(height * .022, 7)
        draw.line((x, y, x + width * .13, y), fill=dark, width=max(1, round(scale)))
        tracked(draw, x, y + height * .024, feature.upper(), scale, size=13, color=dark, gap=1.2)
    else:
        tracked(draw, x, height * .35, 'PACKAGING DETAILS', scale, size=16, color=dark)
        typeface = font('Serif', round(33 * scale))
        draw.text((x, height * .425), feature, font=typeface, fill=INK, anchor='lt')
        draw.line((x, height * .50, width * .85, height * .50), fill=tint, width=max(1, round(scale)))
        body = font('Sans', round(18 * scale))
        for index, line in enumerate(('Custom print • Materials • Finishes', 'Artwork shown for preview.', 'mewepak.com')):
            draw.text((x, height * (.54 + index * .052)), line, font=body, fill=INK, anchor='lt')
    return image


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    logo = Image.open(LOGO_PATH).convert('RGBA')
    logo = logo.crop(logo.getchannel('A').getbbox())
    for slug in SPECS:
        dimensions = (720, 610) if slug == 'retort-pouch' else (720, 900) if slug in (
            'bag-in-box', 'roll-stock-films',
        ) else (720, 1020) if slug not in ('pinch-bottom-pouches', 'quad-seal-bag') else (660, 1020)
        front = design(slug, 'front', *dimensions, logo)
        if slug == 'roll-stock-films':
            repeat = front.resize((560, 820), Image.Resampling.LANCZOS)
            film = Image.new('RGB', (repeat.width * 3, repeat.height), PAPER)
            for i in range(3):
                film.paste(repeat, (i * repeat.width, 0))
            film.save(args.output / f'{slug}-front.jpg', quality=88, optimize=True)
            continue
        front.save(args.output / f'{slug}-front.jpg', quality=89, optimize=True)
        design(slug, 'back', *dimensions, logo).save(args.output / f'{slug}-back.jpg', quality=88, optimize=True)
        if slug == 'bag-in-box':
            for side in ('left', 'right'):
                design(slug, side, 420, 840, logo).save(args.output / f'{slug}-{side}.jpg', quality=88, optimize=True)


if __name__ == '__main__':
    main()
