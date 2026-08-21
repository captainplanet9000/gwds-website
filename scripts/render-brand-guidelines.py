from pathlib import Path

import pypdfium2 as pdfium
from PIL import Image, ImageDraw


PDF = Path(r"C:\GWDS_Site\brand-package\Cival-Systems-Brand-Kit\10-guidelines\Cival-Systems-Brand-Guidelines.pdf")
OUT = Path(r"C:\GWDS_Site\tmp\pdfs\cival-brand-guide")
OUT.mkdir(parents=True, exist_ok=True)

doc = pdfium.PdfDocument(str(PDF))
rendered = []
for index in range(len(doc)):
    page = doc[index]
    bitmap = page.render(scale=2)
    image = bitmap.to_pil().convert("RGB")
    path = OUT / f"page-{index + 1:02d}.png"
    image.save(path, quality=95)
    rendered.append(image)

thumb_w = 480
thumb_h = 270
gap = 18
sheet = Image.new("RGB", (thumb_w * 3 + gap * 4, thumb_h * 2 + gap * 3 + 28), "#050a09")
draw = ImageDraw.Draw(sheet)
for sheet_index in range(2):
    for slot in range(6):
        image_index = sheet_index * 6 + slot
        thumb = rendered[image_index].resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        x = gap + (slot % 3) * (thumb_w + gap)
        y = gap + (slot // 3) * (thumb_h + gap)
        sheet.paste(thumb, (x, y))
        draw.text((x + 8, y + 8), f"{image_index + 1:02d}", fill="#4ade9f")
    contact = OUT / f"contact-sheet-{sheet_index + 1}.jpg"
    sheet.save(contact, quality=90)

print(f"Rendered {len(rendered)} pages to {OUT}")
