from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOCIAL = ROOT / "public" / "images" / "social"
LANCZOS = Image.Resampling.LANCZOS


def center_crop(image: Image.Image, target_ratio: float) -> Image.Image:
    width, height = image.size
    current_ratio = width / height

    if current_ratio > target_ratio:
        crop_width = round(height * target_ratio)
        left = (width - crop_width) // 2
        return image.crop((left, 0, left + crop_width, height))

    crop_height = round(width / target_ratio)
    top = (height - crop_height) // 2
    return image.crop((0, top, width, top + crop_height))


def export_png(source: str, destination: str, size: tuple[int, int]) -> None:
    with Image.open(SOCIAL / source) as image:
        cropped = center_crop(image.convert("RGB"), size[0] / size[1])
        cropped.resize(size, LANCZOS).save(
            SOCIAL / destination,
            format="PNG",
            optimize=True,
        )


def export_jpeg(
    source: str,
    destination: str,
    size: tuple[int, int],
    quality: int = 92,
) -> None:
    with Image.open(SOCIAL / source) as image:
        cropped = center_crop(image.convert("RGB"), size[0] / size[1])
        cropped.resize(size, LANCZOS).save(
            SOCIAL / destination,
            format="JPEG",
            quality=quality,
            optimize=True,
            progressive=True,
        )


PROFILE_EXPORTS = {
    "profile-universal-1024.png": (1024, 1024),
    "x-profile-400.png": (400, 400),
    "linkedin-logo-400.png": (400, 400),
    "facebook-profile-320.png": (320, 320),
    "youtube-profile-800.png": (800, 800),
    "discord-profile-512.png": (512, 512),
}

for filename, size in PROFILE_EXPORTS.items():
    export_png("master-avatar.png", filename, size)

export_png("master-x-header.png", "x-header-1500x500.png", (1500, 500))
export_png(
    "master-company-banner.png",
    "linkedin-page-cover-4200x700.png",
    (4200, 700),
)
export_png(
    "master-company-banner.png",
    "linkedin-profile-cover-1584x396.png",
    (1584, 396),
)
export_png(
    "master-company-banner.png",
    "facebook-cover-hires-1702x630.png",
    (1702, 630),
)
export_jpeg(
    "master-company-banner.png",
    "facebook-cover-fast-851x315.jpg",
    (851, 315),
    quality=90,
)
export_png(
    "master-youtube-banner.png",
    "youtube-channel-art-2560x1440.png",
    (2560, 1440),
)
export_png("master-link-share.png", "social-link-share-1200x630.png", (1200, 630))
export_png("master-link-share.png", "linkedin-link-share-1200x627.png", (1200, 627))
export_png("master-square-campaign.png", "social-square-1080x1080.png", (1080, 1080))
export_png("master-vertical-campaign.png", "social-story-1080x1920.png", (1080, 1920))

print(f"Exported social assets to {SOCIAL}")
