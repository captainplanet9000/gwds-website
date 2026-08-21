from __future__ import annotations

from pathlib import Path
from xml.sax.saxutils import escape

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
KIT = ROOT / "brand-package" / "Cival-Systems-Brand-Kit"
FONT_DIR = ROOT / "tmp" / "brand-fonts"
LOGO_SVG = KIT / "01-logos" / "svg"
LOGO_PNG = KIT / "01-logos" / "png"
ICONS = KIT / "02-icons"
GRAPHICS = KIT / "05-graphic-language"
TEMPLATES = KIT / "07-templates"
PRESS = KIT / "08-press"
SOCIAL = ROOT / "public" / "images" / "social"

DEEP = "#08110f"
DEEPER = "#020706"
SURFACE = "#101d1b"
MINT = "#4ade9f"
MINT_DARK = "#155a41"
MINT_LIGHT = "#a6f7d3"
TEAL = "#5eb0c9"
OFF_WHITE = "#eaf5f2"

SERIF_PATH = FONT_DIR / "InstrumentSerif-Regular.ttf"
SANS_PATH = FONT_DIR / "InstrumentSans-Variable.ttf"
MONO_PATH = FONT_DIR / "IBMPlexMono-Medium.ttf"

for directory in (LOGO_SVG, LOGO_PNG, ICONS, GRAPHICS, TEMPLATES, PRESS):
    directory.mkdir(parents=True, exist_ok=True)


def load_outline_fonts() -> tuple[TTFont, TTFont, TTFont]:
    serif = TTFont(SERIF_PATH)
    sans_variable = TTFont(SANS_PATH)
    sans = instantiateVariableFont(
        sans_variable,
        {"wght": 600, "wdth": 100},
        inplace=False,
    )
    mono = TTFont(MONO_PATH)
    return serif, sans, mono


SERIF, SANS, MONO = load_outline_fonts()


def glyph_data(font: TTFont, char: str) -> tuple[str, tuple[float, float, float, float], int]:
    cmap = font.getBestCmap()
    glyph_name = cmap[ord(char)]
    glyph_set = font.getGlyphSet()
    glyph = glyph_set[glyph_name]

    path_pen = SVGPathPen(glyph_set)
    glyph.draw(path_pen)
    path = path_pen.getCommands()

    bounds_pen = BoundsPen(glyph_set)
    glyph.draw(bounds_pen)
    bounds = bounds_pen.bounds or (0, 0, 0, 0)
    advance = font["hmtx"].metrics[glyph_name][0]
    return path, bounds, advance


def outlined_text(
    font: TTFont,
    text: str,
    x: float,
    baseline: float,
    size: float,
    tracking: float,
    fill: str,
) -> tuple[str, float]:
    upem = font["head"].unitsPerEm
    scale = size / upem
    cursor = 0.0
    elements: list[str] = []

    for char in text:
        if char == " ":
            cursor += size * 0.52 + tracking
            continue
        path, _, advance = glyph_data(font, char)
        px = x + cursor
        elements.append(
            f'<path d="{path}" fill="{fill}" '
            f'transform="translate({px:.3f} {baseline:.3f}) scale({scale:.6f} {-scale:.6f})"/>'
        )
        cursor += advance * scale + tracking

    return "\n".join(elements), max(0.0, cursor - tracking)


def centered_text(
    font: TTFont,
    text: str,
    center_x: float,
    baseline: float,
    size: float,
    tracking: float,
    fill: str,
) -> str:
    _, width = outlined_text(font, text, 0, baseline, size, tracking, fill)
    elements, _ = outlined_text(font, text, center_x - width / 2, baseline, size, tracking, fill)
    return elements


def mark_path(fill: str, stroke: str, box: tuple[float, float, float, float]) -> str:
    x, y, width, height = box
    path, bounds, _ = glyph_data(SERIF, "C")
    min_x, min_y, max_x, max_y = bounds
    glyph_height = max_y - min_y
    glyph_width = max_x - min_x
    target_height = height * 0.64
    scale = target_height / glyph_height
    rendered_width = glyph_width * scale
    target_x = x + (width - rendered_width) / 2
    target_y = y + (height - target_height) / 2
    tx = target_x - min_x * scale
    ty = target_y + max_y * scale
    radius = min(width, height) * 0.23
    stroke_width = min(width, height) * 0.025
    return (
        f'<rect x="{x}" y="{y}" width="{width}" height="{height}" rx="{radius}" '
        f'fill="none" stroke="{stroke}" stroke-width="{stroke_width}"/>'
        f'<path d="{path}" fill="{fill}" '
        f'transform="translate({tx:.3f} {ty:.3f}) scale({scale:.6f} {-scale:.6f})"/>'
    )


def svg_document(width: int, height: int, content: str, background: str | None = None) -> str:
    background_rect = f'<rect width="100%" height="100%" fill="{background}"/>' if background else ""
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
        f'width="{width}" height="{height}" role="img" aria-label="Cival Systems">\n'
        f'{background_rect}\n{content}\n</svg>\n'
    )


def write_svg(name: str, content: str) -> None:
    (LOGO_SVG / name).write_text(content, encoding="utf-8")


def build_svg_logos() -> None:
    write_svg(
        "cival-mark-mint.svg",
        svg_document(512, 512, mark_path(MINT, MINT_DARK, (28, 28, 456, 456))),
    )
    write_svg(
        "cival-mark-deep.svg",
        svg_document(512, 512, mark_path(DEEP, MINT_DARK, (28, 28, 456, 456))),
    )

    variants = {
        "cival-primary-on-dark.svg": (MINT, MINT_DARK, OFF_WHITE),
        "cival-primary-on-light.svg": (MINT_DARK, MINT_DARK, DEEP),
        "cival-primary-mono-black.svg": (DEEP, DEEP, DEEP),
        "cival-primary-mono-white.svg": ("#ffffff", "#ffffff", "#ffffff"),
    }
    for filename, (mark_fill, mark_stroke, word_fill) in variants.items():
        wordmark, _ = outlined_text(SANS, "CIVAL SYSTEMS", 430, 246, 116, 24, word_fill)
        content = mark_path(mark_fill, mark_stroke, (40, 40, 320, 320)) + wordmark
        write_svg(filename, svg_document(1600, 400, content))

    wordmark = centered_text(SANS, "CIVAL SYSTEMS", 600, 148, 118, 26, MINT)
    write_svg("cival-wordmark-mint.svg", svg_document(1200, 220, wordmark))

    wordmark, _ = outlined_text(SANS, "CIVAL SYSTEMS", 430, 220, 116, 24, OFF_WHITE)
    tagline, _ = outlined_text(MONO, "BUILD. TEST. ORCHESTRATE.", 435, 315, 37, 10, MINT)
    lockup = mark_path(MINT, MINT_DARK, (40, 60, 320, 320)) + wordmark + tagline
    write_svg("cival-lockup-tagline-on-dark.svg", svg_document(1600, 440, lockup))


def tracked_width(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, tracking: int) -> int:
    return round(sum(draw.textlength(char, font=font) for char in text) + tracking * max(0, len(text) - 1))


def draw_tracked(
    draw: ImageDraw.ImageDraw,
    text: str,
    xy: tuple[int, int],
    font: ImageFont.FreeTypeFont,
    fill: str,
    tracking: int,
) -> None:
    x, y = xy
    for char in text:
        draw.text((x, y), char, font=font, fill=fill, anchor="la")
        x += round(draw.textlength(char, font=font)) + tracking


def draw_mark(
    image: Image.Image,
    box: tuple[int, int, int, int],
    mark_fill: str,
    stroke: str,
) -> None:
    draw = ImageDraw.Draw(image)
    left, top, right, bottom = box
    size = min(right - left, bottom - top)
    stroke_width = max(2, round(size * 0.025))
    radius = round(size * 0.23)
    draw.rounded_rectangle(box, radius=radius, outline=stroke, width=stroke_width)
    font = ImageFont.truetype(str(SERIF_PATH), round(size * 0.66))
    draw.text(((left + right) / 2, (top + bottom) / 2 - size * 0.01), "C", font=font, fill=mark_fill, anchor="mm")


def save_logo_png(
    filename: str,
    mark_fill: str,
    stroke: str,
    word_fill: str,
    background: str | None = None,
    tagline: bool = False,
) -> None:
    height = 440 if tagline else 400
    image = Image.new("RGBA", (1600, height), background or (0, 0, 0, 0))
    draw_mark(image, (40, 40, 360, 360), mark_fill, stroke)
    draw = ImageDraw.Draw(image)
    word_font = ImageFont.truetype(str(SANS_PATH), 116)
    draw_tracked(draw, "CIVAL SYSTEMS", (430, 134), word_font, word_fill, 20)
    if tagline:
        mono_font = ImageFont.truetype(str(MONO_PATH), 37)
        draw_tracked(draw, "BUILD. TEST. ORCHESTRATE.", (435, 286), mono_font, MINT, 7)
    image.save(LOGO_PNG / filename, optimize=True)


def build_png_logos() -> None:
    mark = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    draw_mark(mark, (64, 64, 960, 960), MINT, MINT_DARK)
    mark.save(LOGO_PNG / "cival-mark-mint-1024.png", optimize=True)

    save_logo_png("cival-primary-on-dark-1600.png", MINT, MINT_DARK, OFF_WHITE)
    save_logo_png("cival-primary-on-light-1600.png", MINT_DARK, MINT_DARK, DEEP)
    save_logo_png("cival-primary-mono-black-1600.png", DEEP, DEEP, DEEP)
    save_logo_png("cival-primary-mono-white-1600.png", "#ffffff", "#ffffff", "#ffffff")
    save_logo_png(
        "cival-lockup-tagline-dark-1600.png",
        MINT,
        MINT_DARK,
        OFF_WHITE,
        background=DEEP,
        tagline=True,
    )


def build_icons() -> None:
    with Image.open(SOCIAL / "master-avatar.png") as source:
        source = source.convert("RGB")
        for size in (16, 32, 48, 64, 128, 180, 192, 256, 512, 1024):
            source.resize((size, size), Image.Resampling.LANCZOS).save(
                ICONS / f"cival-icon-{size}.png",
                format="PNG",
                optimize=True,
            )
        source.resize((256, 256), Image.Resampling.LANCZOS).save(
            ICONS / "cival-favicon.ico",
            format="ICO",
            sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
        )


def fit_crop(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    target_ratio = size[0] / size[1]
    current_ratio = image.width / image.height
    if current_ratio > target_ratio:
        width = round(image.height * target_ratio)
        left = (image.width - width) // 2
        image = image.crop((left, 0, left + width, image.height))
    else:
        height = round(image.width / target_ratio)
        top = (image.height - height) // 2
        image = image.crop((0, top, image.width, top + height))
    return image.resize(size, Image.Resampling.LANCZOS)


def add_dark_overlay(image: Image.Image, opacity: int = 90) -> Image.Image:
    overlay = Image.new("RGBA", image.size, (2, 7, 6, opacity))
    return Image.alpha_composite(image.convert("RGBA"), overlay)


def build_graphics_and_templates() -> None:
    with Image.open(GRAPHICS / "brand-world-master.png") as source:
        desktop = fit_crop(source.convert("RGB"), (3840, 2160))
        desktop.save(GRAPHICS / "brand-world-desktop-3840x2160.jpg", quality=94, optimize=True)
        fit_crop(source.convert("RGB"), (1920, 1080)).save(
            GRAPHICS / "brand-world-1920x1080.png", optimize=True
        )
        fit_crop(source.convert("RGB"), (1080, 1920)).save(
            GRAPHICS / "brand-world-mobile-1080x1920.png", optimize=True
        )

    pattern_svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">
  <defs>
    <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M80 0H0V80" fill="none" stroke="{MINT_DARK}" stroke-opacity="0.24" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1600" height="900" fill="{DEEP}"/>
  <rect width="1600" height="900" fill="url(#grid)"/>
  <g fill="none" stroke="{MINT}" stroke-width="2" stroke-opacity="0.34">
    <path d="M-100 700C280 180 910 120 1690 560"/>
    <path d="M-90 810C420 300 1010 330 1700 120"/>
    <path d="M120 -80C390 250 620 730 1510 940"/>
  </g>
  <g fill="{MINT}" opacity="0.8">
    <circle cx="275" cy="445" r="6"/><circle cx="705" cy="285" r="7"/>
    <circle cx="1115" cy="395" r="6"/><circle cx="1320" cy="655" r="8"/>
    <circle cx="495" cy="695" r="5"/><circle cx="1480" cy="220" r="5"/>
  </g>
</svg>
'''
    (GRAPHICS / "brand-pattern-dark.svg").write_text(pattern_svg, encoding="utf-8")

    with Image.open(GRAPHICS / "brand-world-1920x1080.png") as world:
        title_slide = add_dark_overlay(world, 38)
        draw = ImageDraw.Draw(title_slide)
        draw_mark(title_slide, (120, 145, 320, 345), MINT, MINT_DARK)
        word_font = ImageFont.truetype(str(SANS_PATH), 72)
        mono_font = ImageFont.truetype(str(MONO_PATH), 30)
        draw_tracked(draw, "CIVAL SYSTEMS", (370, 167), word_font, OFF_WHITE, 14)
        draw_tracked(draw, "BUILD. TEST. ORCHESTRATE.", (375, 270), mono_font, MINT, 6)
        title_slide.convert("RGB").save(TEMPLATES / "presentation-title-1920x1080.png", optimize=True)

        content_slide = add_dark_overlay(world, 125)
        draw = ImageDraw.Draw(content_slide)
        draw_mark(content_slide, (82, 58, 166, 142), MINT, MINT_DARK)
        small_font = ImageFont.truetype(str(SANS_PATH), 34)
        draw_tracked(draw, "CIVAL SYSTEMS", (188, 72), small_font, OFF_WHITE, 7)
        content_slide.convert("RGB").save(TEMPLATES / "presentation-content-1920x1080.png", optimize=True)

        zoom = add_dark_overlay(world, 34)
        draw = ImageDraw.Draw(zoom)
        draw_mark(zoom, (1630, 75, 1810, 255), MINT, MINT_DARK)
        zoom.convert("RGB").save(TEMPLATES / "video-call-background-1920x1080.jpg", quality=94, optimize=True)

    with Image.open(SOCIAL / "master-x-header.png") as header:
        fit_crop(header.convert("RGB"), (1200, 300)).save(
            TEMPLATES / "email-header-1200x300.png", optimize=True
        )

    with Image.open(PRESS / "product-hero-master.png") as product:
        fit_crop(product.convert("RGB"), (2400, 1350)).save(
            PRESS / "product-hero-2400x1350.jpg", quality=95, optimize=True
        )

    card_front = Image.new("RGB", (1050, 600), DEEP)
    draw_mark(card_front, (370, 95, 680, 405), MINT, MINT_DARK)
    draw = ImageDraw.Draw(card_front)
    font = ImageFont.truetype(str(SANS_PATH), 58)
    mono = ImageFont.truetype(str(MONO_PATH), 26)
    word_width = tracked_width(draw, "CIVAL SYSTEMS", font, 10)
    draw_tracked(draw, "CIVAL SYSTEMS", ((1050 - word_width) // 2, 425), font, OFF_WHITE, 10)
    url_width = tracked_width(draw, "civalsystems.com", mono, 4)
    draw_tracked(draw, "civalsystems.com", ((1050 - url_width) // 2, 520), mono, MINT, 4)
    card_front.save(TEMPLATES / "business-card-front-1050x600.png", optimize=True)

    card_back = Image.new("RGB", (1050, 600), SURFACE)
    draw = ImageDraw.Draw(card_back)
    heading = ImageFont.truetype(str(SERIF_PATH), 88)
    draw.text((74, 165), "Build. Test.", font=heading, fill=OFF_WHITE)
    draw.text((74, 255), "Orchestrate.", font=heading, fill=MINT)
    draw.line((74, 392, 976, 392), fill=MINT_DARK, width=2)
    mono = ImageFont.truetype(str(MONO_PATH), 26)
    draw_tracked(draw, "TRADING WORKSPACE SOURCE TEMPLATES", (74, 435), mono, MINT_LIGHT, 3)
    card_back.save(TEMPLATES / "business-card-back-1050x600.png", optimize=True)


def main() -> None:
    build_svg_logos()
    build_png_logos()
    build_icons()
    build_graphics_and_templates()
    print(f"Built Cival brand assets in {KIT}")


if __name__ == "__main__":
    main()
