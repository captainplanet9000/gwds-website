from __future__ import annotations

from pathlib import Path
from textwrap import wrap

from reportlab.lib.colors import Color, HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(r"C:\GWDS_Site\brand-package\Cival-Systems-Brand-Kit")
OUT = ROOT / "10-guidelines" / "Cival-Systems-Brand-Guidelines.pdf"
W, H = 960, 540

DEEP = HexColor("#08110F")
SURFACE = HexColor("#101D1B")
RAISED = HexColor("#172724")
MINT = HexColor("#4ADE9F")
TEAL = HexColor("#5EB0C9")
INK = HexColor("#EAF5F2")
MUTED = HexColor("#A9BBB6")
LINE = HexColor("#29403B")
LIGHT = HexColor("#F2F7F5")
BLACK = HexColor("#08110F")
WARNING = HexColor("#F3C969")
NEGATIVE = HexColor("#F17C76")

FONT_DIR = ROOT / "04-typography" / "fonts"
pdfmetrics.registerFont(TTFont("InstrumentSerif", str(FONT_DIR / "InstrumentSerif-Regular.ttf")))
pdfmetrics.registerFont(TTFont("InstrumentSans", str(FONT_DIR / "InstrumentSans-Variable.ttf")))
pdfmetrics.registerFont(TTFont("IBMPlexMono", str(FONT_DIR / "IBMPlexMono-Medium.ttf")))


def crop_image(c: canvas.Canvas, path: Path, x: float, y: float, w: float, h: float, alpha: float = 1.0):
    image = ImageReader(str(path))
    iw, ih = image.getSize()
    scale = max(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    c.saveState()
    clip = c.beginPath()
    clip.rect(x, y, w, h)
    c.clipPath(clip, stroke=0, fill=0)
    c.setFillAlpha(alpha)
    c.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, mask="auto")
    c.restoreState()


def contain_image(c: canvas.Canvas, path: Path, x: float, y: float, w: float, h: float):
    image = ImageReader(str(path))
    iw, ih = image.getSize()
    scale = min(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    c.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, mask="auto")


def rect(c, x, y, w, h, fill, radius=0, stroke=None, stroke_width=1):
    c.setFillColor(fill)
    if stroke:
        c.setStrokeColor(stroke)
        c.setLineWidth(stroke_width)
    else:
        c.setStrokeColor(fill)
    if radius:
        c.roundRect(x, y, w, h, radius, fill=1, stroke=1 if stroke else 0)
    else:
        c.rect(x, y, w, h, fill=1, stroke=1 if stroke else 0)


def text(c, value, x, y, font="InstrumentSans", size=14, color=INK, max_width=None, leading=None):
    c.setFont(font, size)
    c.setFillColor(color)
    leading = leading or size * 1.3
    if not max_width:
        c.drawString(x, y, value)
        return y - leading
    words = value.split()
    lines, line = [], ""
    for word in words:
        candidate = f"{line} {word}".strip()
        if not line or pdfmetrics.stringWidth(candidate, font, size) <= max_width:
            line = candidate
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    for item in lines:
        c.drawString(x, y, item)
        y -= leading
    return y


def label(c, value, x, y, color=MINT):
    c.setFont("IBMPlexMono", 8.5)
    c.setFillColor(color)
    c.drawString(x, y, value.upper())


def bullet_list(c, items, x, y, width, color=MUTED, size=11.5, gap=11):
    for item in items:
        c.setFillColor(MINT)
        c.circle(x + 3, y + 3, 2, fill=1, stroke=0)
        y = text(c, item, x + 15, y, "InstrumentSans", size, color, width - 15, size * 1.35)
        y -= gap
    return y


def page_bg(c, page_no, section):
    rect(c, 0, 0, W, H, DEEP)
    c.setStrokeColor(Color(0.16, 0.25, 0.23, alpha=0.35))
    c.setLineWidth(0.5)
    for x in range(48, int(W), 96):
        c.line(x, 36, x, H - 36)
    for y in range(60, int(H), 72):
        c.line(36, y, W - 36, y)
    c.setFillColor(MUTED)
    c.setFont("IBMPlexMono", 7.5)
    c.drawString(42, 22, f"CIVAL SYSTEMS / {section.upper()}")
    c.drawRightString(W - 42, 22, f"{page_no:02d} / 12")


def heading(c, eyebrow, title, subtitle=None):
    label(c, eyebrow, 48, H - 48)
    text(c, title, 48, H - 91, "InstrumentSerif", 38, INK)
    if subtitle:
        text(c, subtitle, 48, H - 119, "InstrumentSans", 11.5, MUTED, 670, 15)


def card(c, x, y, w, h, title_value, body_value, accent=MINT):
    rect(c, x, y, w, h, SURFACE, 14, LINE)
    c.setFillColor(accent)
    c.rect(x, y + h - 3, w, 3, fill=1, stroke=0)
    text(c, title_value, x + 18, y + h - 31, "InstrumentSans", 13, INK)
    text(c, body_value, x + 18, y + h - 55, "InstrumentSans", 10.5, MUTED, w - 36, 14)


def cover(c):
    crop_image(c, ROOT / "05-graphic-language" / "brand-world-desktop-3840x2160.jpg", 0, 0, W, H)
    c.setFillColor(Color(0.03, 0.07, 0.06, alpha=0.58))
    c.rect(0, 0, W, H, fill=1, stroke=0)
    contain_image(c, ROOT / "01-logos" / "png" / "cival-primary-on-dark-1600.png", 48, 445, 290, 48)
    label(c, "Identity system / version 1.0", 49, 400)
    text(c, "Brand Guidelines", 48, 137, "InstrumentSerif", 62, INK)
    text(c, "Build. Test. Orchestrate.", 50, 95, "InstrumentSans", 18, MINT)
    text(c, "Visual and verbal standards / August 2026", 50, 61, "IBMPlexMono", 8.5, MUTED)
    c.showPage()


def foundation(c):
    page_bg(c, 2, "Foundation")
    heading(c, "01 / Foundation", "Systems you can inspect.", "Cival turns a complex agent workflow into a controlled workspace operators can understand, configure, and extend.")
    text(c, "We make powerful systems feel", 48, 337, "InstrumentSerif", 31, INK)
    text(c, "legible—not magical.", 48, 302, "InstrumentSerif", 31, MINT)
    text(c, "The brand earns trust through visible boundaries, disciplined language, and calm operational design.", 48, 264, "InstrumentSans", 12, MUTED, 355, 17)
    card(c, 460, 302, 210, 117, "Purpose", "Give operators an inspectable foundation for coordinated AI trading workflows.")
    card(c, 690, 302, 220, 117, "Promise", "A source-template system customers can configure, test, and own.", TEAL)
    card(c, 460, 153, 135, 112, "Precise", "Name the capability and the boundary.")
    card(c, 610, 153, 135, 112, "Calm", "Signal control, never urgency.", TEAL)
    card(c, 760, 153, 150, 112, "Accountable", "State assumptions and risk plainly.")
    label(c, "Primary tagline", 48, 183)
    text(c, "Build. Test. Orchestrate.", 48, 146, "InstrumentSans", 20, INK)
    c.showPage()


def logo_system(c):
    page_bg(c, 3, "Logo system")
    heading(c, "02 / Identity", "The operating boundary.", "The serif C brings human judgment into a disciplined rounded-square system.")
    rect(c, 48, 204, 520, 190, SURFACE, 16, LINE)
    contain_image(c, ROOT / "01-logos" / "png" / "cival-primary-on-dark-1600.png", 85, 258, 440, 82)
    label(c, "Preferred primary lockup", 71, 227)
    rect(c, 590, 204, 322, 190, LIGHT, 16)
    contain_image(c, ROOT / "01-logos" / "png" / "cival-primary-on-light-1600.png", 620, 258, 260, 82)
    c.setFillColor(BLACK)
    c.setFont("IBMPlexMono", 8.5)
    c.drawString(613, 227, "LIGHT HOST ENVIRONMENTS")
    label(c, "Clear space", 48, 164)
    text(c, "Keep at least ¼ of the mark height clear on every side.", 48, 139, "InstrumentSans", 11, MUTED)
    label(c, "Minimum size", 370, 164)
    text(c, "Mark 24 px / lockup 120 px / tagline 240 px.", 370, 139, "InstrumentSans", 11, MUTED)
    label(c, "Preferred files", 690, 164)
    text(c, "SVG for product, web, print. PNG only when required.", 690, 139, "InstrumentSans", 11, MUTED, 220, 15)
    c.showPage()


def logo_rules(c):
    page_bg(c, 4, "Logo rules")
    heading(c, "03 / Logo use", "Protect recognition.", "Consistency matters more than novelty. The supplied artwork is the source of truth.")
    label(c, "Approved", 48, 394)
    card(c, 48, 232, 260, 135, "Dark-first", "Mint mark with off-white wordmark on deep green-black.")
    card(c, 324, 232, 260, 135, "Light fallback", "Deep mark and wordmark on an off-white host surface.", TEAL)
    card(c, 600, 232, 312, 135, "One-color production", "Use supplied black or white artwork when a single ink is required.")
    label(c, "Never", 48, 194, NEGATIVE)
    bullet_list(c, [
        "Change the letterform, corner radius, proportions, or lockup spacing.",
        "Add glow, bevel, shadow, gradient, outline, or motion to the logo.",
        "Place the mint mark over a busy mint or teal region.",
        "Redraw the mark with a generic serif C or put it inside another container.",
    ], 48, 164, 840, MUTED, 11, 7)
    c.showPage()


def color_page(c):
    page_bg(c, 5, "Color")
    heading(c, "04 / Color", "Dark field. Live signal.", "Deep green-black carries the environment. Mint marks the moments that matter.")
    swatches = [
        ("DEEP", "#08110F", DEEP, INK),
        ("SURFACE", "#101D1B", SURFACE, INK),
        ("RAISED", "#172724", RAISED, INK),
        ("MINT", "#4ADE9F", MINT, DEEP),
        ("TEAL", "#5EB0C9", TEAL, DEEP),
        ("OFF-WHITE", "#EAF5F2", INK, DEEP),
        ("MIST", "#A9BBB6", MUTED, DEEP),
        ("LINE", "#29403B", LINE, INK),
    ]
    x0, y0, sw, sh, gap = 48, 270, 101, 116, 9
    for i, (name, value, fill, fg) in enumerate(swatches):
        x = x0 + i * (sw + gap)
        rect(c, x, y0, sw, sh, fill, 10, LINE if i < 3 else None)
        c.setFillColor(fg)
        c.setFont("IBMPlexMono", 7.5)
        c.drawString(x + 10, y0 + 28, name)
        c.drawString(x + 10, y0 + 13, value)
    label(c, "Usage ratio", 48, 225)
    rect(c, 48, 186, 610, 20, DEEP, 10, LINE)
    rect(c, 48, 186, 458, 20, SURFACE, 10)
    rect(c, 506, 186, 110, 20, INK)
    rect(c, 616, 186, 42, 20, MINT, 10)
    text(c, "75% field / 18% neutral / ≤7% signal", 48, 160, "IBMPlexMono", 8.5, MUTED)
    bullet_list(c, [
        "Use off-white for body copy; reserve mint for short labels, focus, and key action.",
        "Do not make white pages the dominant Cival experience.",
        "Never communicate a trading state with color alone.",
    ], 695, 224, 218, MUTED, 10.5, 6)
    c.showPage()


def typography(c):
    page_bg(c, 6, "Typography")
    heading(c, "05 / Typography", "Editorial authority. Operational clarity.")
    label(c, "Instrument Serif / display", 48, 392)
    text(c, "Build. Test.", 48, 330, "InstrumentSerif", 54, INK)
    text(c, "Orchestrate.", 48, 274, "InstrumentSerif", 54, MINT)
    label(c, "Instrument Sans / interface + body", 502, 392)
    text(c, "A coordinated workspace for agents, models, data, and decisions.", 502, 356, "InstrumentSans", 17, INK, 380, 23)
    text(c, "Use direct sentences, useful labels, and comfortable reading measures. Sentence case is the default.", 502, 286, "InstrumentSans", 11.5, MUTED, 370, 17)
    label(c, "IBM Plex Mono / data + metadata", 502, 210)
    text(c, "BTC-PERP   63,482.10   +2.4%", 502, 180, "IBMPlexMono", 13, MINT)
    text(c, "SYSTEM / RISK-CHECK / 14:32:08 UTC", 502, 151, "IBMPlexMono", 9, TEAL)
    label(c, "Hierarchy", 48, 198)
    text(c, "Display 80/76 · H1 44/48 · H2 32/37", 48, 169, "IBMPlexMono", 9, MUTED)
    text(c, "Body 16/25 · Label 13/17 · Data 13/19", 48, 144, "IBMPlexMono", 9, MUTED)
    c.showPage()


def layout_page(c):
    page_bg(c, 7, "Layout")
    heading(c, "06 / Layout", "Quiet center. Structured edges.", "Let system detail accumulate at the perimeter while the core message stays calm and legible.")
    rect(c, 48, 138, 545, 248, SURFACE, 14, LINE)
    for x in [74, 156, 238, 320, 402, 484, 566]:
        c.setStrokeColor(Color(0.29, 0.87, 0.62, alpha=0.18))
        c.line(x, 158, x, 365)
    for y in [174, 226, 278, 330]:
        c.line(68, y, 573, y)
    rect(c, 84, 196, 304, 132, DEEP, 10)
    label(c, "Quiet message region", 107, 298)
    text(c, "One clear idea", 107, 255, "InstrumentSerif", 31, INK)
    text(c, "Support it with measured system detail.", 107, 225, "InstrumentSans", 10.5, MUTED)
    c.setStrokeColor(MINT)
    c.setLineWidth(1.2)
    c.arc(365, 157, 561, 353, 40, 225)
    for px, py in [(485, 320), (536, 260), (466, 186)]:
        c.setFillColor(MINT)
        c.circle(px, py, 3.2, fill=1, stroke=0)
    label(c, "Composition rules", 636, 385)
    bullet_list(c, [
        "Use a consistent outer margin.",
        "Anchor content to a visible grid.",
        "Limit each panel to one primary action.",
        "Keep decorative detail low contrast.",
        "Use mint once as the focal signal.",
        "Preserve the landing-page motion choreography.",
    ], 636, 351, 270, MUTED, 11, 8)
    c.showPage()


def graphic_language(c):
    page_bg(c, 8, "Graphic language")
    heading(c, "07 / Graphic language", "An instrument panel—not a casino.")
    crop_image(c, ROOT / "05-graphic-language" / "brand-world-1920x1080.png", 48, 156, 498, 235)
    rect(c, 48, 156, 498, 235, Color(0, 0, 0, alpha=0), 12, LINE)
    crop_image(c, ROOT / "08-press" / "product-hero-2400x1350.jpg", 568, 245, 344, 146)
    rect(c, 568, 245, 344, 146, Color(0, 0, 0, alpha=0), 12, LINE)
    label(c, "Use", 568, 211)
    bullet_list(c, ["Controlled grids and thin signal paths.", "Real screenshots for feature claims.", "Negative space and restrained data detail."], 568, 184, 344, MUTED, 10.5, 5)
    label(c, "Avoid", 48, 125, NEGATIVE)
    text(c, "Robots · coins · rockets · green profit arrows · unreadable dashboards · unverified interface claims", 48, 99, "InstrumentSans", 10.5, MUTED, 830, 15)
    c.showPage()


def voice_page(c):
    page_bg(c, 9, "Voice")
    heading(c, "08 / Voice", "Clarity is the confidence.", "Describe what the system does, what the customer controls, and what remains their responsibility.")
    traits = [("Precise", "Capability + boundary"), ("Direct", "Concrete verbs"), ("Inspectable", "Show the mechanism"), ("Calm", "No manufactured urgency"), ("Accountable", "Name risk and assumptions")]
    for i, (name, desc) in enumerate(traits):
        x = 48 + i * 172
        rect(c, x, 299, 156, 86, SURFACE, 12, LINE)
        text(c, name, x + 14, 350, "InstrumentSans", 12, INK)
        text(c, desc, x + 14, 324, "InstrumentSans", 9.5, MUTED, 128, 13)
    label(c, "Avoid", 48, 252, NEGATIVE)
    text(c, "Guaranteed alpha, automatically", 48, 222, "InstrumentSerif", 22, MUTED)
    label(c, "Prefer", 500, 252)
    text(c, "A configurable workspace for testing", 500, 222, "InstrumentSerif", 22, INK)
    text(c, "agent-assisted trading workflows.", 500, 194, "InstrumentSerif", 22, MINT)
    rect(c, 48, 116, 864, 43, SURFACE, 10, LINE)
    label(c, "One-sentence position", 66, 143)
    text(c, "Inspectable source templates for coordinated AI trading workspaces.", 252, 137, "InstrumentSans", 12, INK)
    c.showPage()


def social_page(c):
    page_bg(c, 10, "Social system")
    heading(c, "09 / Social", "Recognizable at every crop.", "Use the prepared platform exports. Keep the mark simple; let banners carry the system world.")
    crop_image(c, ROOT / "06-social" / "upload-ready" / "social-square-1080x1080.png", 48, 134, 270, 270)
    crop_image(c, ROOT / "06-social" / "upload-ready" / "x-header-1500x500.png", 342, 286, 570, 118)
    contain_image(c, ROOT / "06-social" / "upload-ready" / "profile-universal-1024.png", 342, 134, 128, 128)
    label(c, "Primary tagline", 504, 247)
    text(c, "Build. Test. Orchestrate.", 504, 214, "InstrumentSerif", 25, INK)
    label(c, "Campaign line", 504, 177)
    text(c, "Your own personal AI agent hedge fund.", 504, 150, "InstrumentSans", 13, MINT)
    text(c, "Always pair with: Trading workspace source templates. Not financial advice.", 504, 126, "InstrumentSans", 9.5, MUTED, 390, 13)
    c.showPage()


def compliance(c):
    page_bg(c, 11, "Claims and risk")
    heading(c, "10 / Claims", "Market the product. Never promise the outcome.", "Cival sells software templates and educational material—not returns, custody, execution, or investment advice.")
    rect(c, 48, 182, 408, 197, SURFACE, 14, LINE)
    label(c, "Approved framing", 68, 347)
    bullet_list(c, [
        "Inspectable source-template foundation",
        "Configurable agent roles and workflows",
        "Customer-controlled integrations",
        "Test before deployment",
    ], 68, 315, 356, MUTED, 11, 7)
    rect(c, 478, 182, 434, 197, SURFACE, 14, LINE)
    label(c, "Prohibited or unverified", 498, 347, NEGATIVE)
    bullet_list(c, [
        "Guaranteed returns, alpha, or win rates",
        "Autonomous safety or regulatory compliance",
        "Hedge fund, broker, adviser, custodian, exchange",
        "Paper-mode claims unless verified end to end",
    ], 498, 315, 382, MUTED, 11, 7)
    rect(c, 48, 111, 864, 45, MINT, 11)
    text(c, "Software templates only. Not financial advice. Trading involves risk.", 72, 127, "InstrumentSans", 14, DEEP)
    c.showPage()


def quick_start(c):
    page_bg(c, 12, "Quick start")
    heading(c, "11 / Asset library", "Start here.", "The package is production-ready, platform-sized, and reproducible from the supplied source scripts.")
    rect(c, 48, 135, 470, 255, SURFACE, 14, LINE)
    label(c, "Folder map", 70, 361)
    folders = [
        "01-logos/       SVG + PNG identity assets",
        "02-icons/       favicon, app, and profile icons",
        "03-color/       CSS, JSON, Tailwind tokens",
        "04-typography/  fonts, licenses, type rules",
        "05-graphic-language/  imagery + pattern",
        "06-social/      upload-ready platform kit",
        "07-templates/   presentation, email, card",
        "08-press/       high-resolution hero imagery",
        "09-messaging/   bios, boilerplate, voice",
        "source/         reproducible build scripts",
    ]
    y = 333
    for line in folders:
        text(c, line, 70, y, "IBMPlexMono", 8.5, MUTED)
        y -= 20
    label(c, "Launch checklist", 560, 390)
    bullet_list(c, [
        "Use the dark primary SVG lockup.",
        "Load the approved fonts and tokens.",
        "Use platform assets without resizing.",
        "Check mobile crops before publishing.",
        "Pair campaign language with the qualifier.",
        "Use verified screenshots for product claims.",
    ], 560, 355, 340, MUTED, 11, 8)
    contain_image(c, ROOT / "01-logos" / "png" / "cival-lockup-tagline-dark-1600.png", 560, 112, 320, 86)
    c.showPage()


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=(W, H), pageCompression=1)
    c.setTitle("Cival Systems Brand Guidelines")
    c.setAuthor("Cival Systems")
    c.setSubject("Visual and verbal identity standards")
    cover(c)
    foundation(c)
    logo_system(c)
    logo_rules(c)
    color_page(c)
    typography(c)
    layout_page(c)
    graphic_language(c)
    voice_page(c)
    social_page(c)
    compliance(c)
    quick_start(c)
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
