# Cival Systems social media image kit

Palette: Hyperliquid dark green (`#08110f`) with mint (`#4ade9f`), teal
(`#5eb0c9`), and off-white (`#eaf5f2`). The generated masters are retained so
future platform crops can be exported without regenerating the artwork.

## Upload-ready assets

| File | Intended use | Dimensions |
| --- | --- | --- |
| `profile-universal-1024.png` | Universal high-resolution profile image | 1024 × 1024 |
| `x-profile-400.png` | X profile image | 400 × 400 |
| `x-header-1500x500.png` | X header | 1500 × 500 |
| `linkedin-logo-400.png` | LinkedIn Page logo | 400 × 400 |
| `linkedin-page-cover-4200x700.png` | LinkedIn Page cover | 4200 × 700 |
| `linkedin-profile-cover-1584x396.png` | LinkedIn personal profile cover | 1584 × 396 |
| `linkedin-link-share-1200x627.png` | LinkedIn link-preview image | 1200 × 627 |
| `facebook-profile-320.png` | Facebook Page profile image | 320 × 320 |
| `facebook-cover-hires-1702x630.png` | High-resolution Facebook Page cover | 1702 × 630 |
| `facebook-cover-fast-851x315.jpg` | Lightweight Facebook Page cover | 851 × 315 |
| `youtube-profile-800.png` | YouTube channel profile image | 800 × 800 |
| `youtube-channel-art-2560x1440.png` | YouTube channel banner | 2560 × 1440 |
| `discord-profile-512.png` | Discord server/profile image | 512 × 512 |
| `social-link-share-1200x630.png` | Open Graph and general link preview | 1200 × 630 |
| `social-square-1080x1080.png` | Square X, Instagram, LinkedIn, or Discord post | 1080 × 1080 |
| `social-story-1080x1920.png` | Instagram Story, TikTok, or Shorts visual | 1080 × 1920 |

## Generated masters

- `master-avatar.png`
- `master-x-header.png`
- `master-company-banner.png`
- `master-youtube-banner.png`
- `master-link-share.png`
- `master-square-campaign.png`
- `master-vertical-campaign.png`

Run `python scripts/export-social-assets.py` from the repository root to
re-export every upload-ready crop from these masters.
