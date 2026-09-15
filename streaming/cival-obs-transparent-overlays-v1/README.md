# Cival OBS Transparent Overlays

These are actual alpha-channel overlays for OBS. They contain no generated scene background. Place a PNG above your camera, screen capture, or chat source. Matched desktop and mobile sets are included.

## Fast setup

1. In OBS, set the canvas to 1920 x 1080.
2. Add your Cival window or browser capture.
3. Add an Image source above it.
4. Choose a PNG from `full-canvas/`.
5. Leave the image at its native 1920 x 1080 size.

The checkerboards shown in `previews/alpha-proof-webcam-chat.png` and `previews/desktop-mobile-alpha-pair.png` are only transparency proofs. They are not included in any overlay.

## Desktop overlays

Use the files in `desktop/` with a 1920 x 1080 OBS canvas. The set includes minimal, status/footer, product + webcam, product + chat, product + webcam + chat, branded-clean, and just-chatting layouts.

## Mobile overlays

Use the files in `mobile/` with a 1080 x 1920 portrait canvas. The mobile set includes:

- Minimal corner rails
- Status and disclosure footer
- Product capture plus camera
- Product capture plus chat
- Product capture plus camera and chat
- Full-height just-chatting layout
- Large clean portrait capture frame

For vertical simulcasting or recording, create a separate OBS scene collection with a 1080 x 1920 canvas so sources do not need to be repositioned every time.

## Original full-canvas choices

- `01-minimal-corners` — four mint corner rails only
- `02-status-footer` — status pill and disclosure footer
- `03-product-webcam` — product capture plus lower-right 16:9 camera
- `04-product-chat` — product capture and right-side chat
- `05-product-webcam-chat` — product, chat, and camera layout
- `06-brand-clean` — restrained Cival brand bug, status, and footer
- `07-just-chatting` — large camera/content frame plus session rail
- `08-vertical-camera` — 1080 x 1920 vertical stream layout

## Customizable modules

Use `modules/`, `frames/`, `lower-thirds/`, and `alerts/` to build a completely custom layout. Blank status, footer, lower-third, and alert assets are included so you can add native OBS text sources.

Every PNG has a matching SVG in `editable-svg/`. Edit the SVG in Figma, Illustrator, Inkscape, or a text editor and export it at its original dimensions.

## Browser-source overlay

`browser-source/cival-overlay.html` is transparent and accepts URL options:

```text
file:///C:/GWDS_Site/streaming/cival-obs-transparent-overlays-v1/browser-source/cival-overlay.html?mode=camera&status=PAPER%20MODE%20%2F%20LIVE&accent=%234ade9f
```

Available modes: `clean`, `camera`, `chat-mode`, and `camera-chat`.

Supported parameters:

- `mode` — overlay layout
- `status` — top-right status text
- `accent` — hex accent color, URL encoded
- `left` — footer-left text
- `right` — footer-right text

In OBS, use a 1920 x 1080 Browser source with the background color left transparent.

## Product capture areas

- Webcam layout camera: x 1434, y 738, width 426, height 240
- Chat layout screen: x 40, y 126, width 1400, height 790
- Chat layout chat: x 1470, y 126, width 390, height 790
- Camera/chat chat: x 1470, y 126, width 390, height 470
- Camera/chat camera: x 1470, y 622, width 390, height 219

Keep the paper/demo disclosure visible whenever simulated balances, performance, or order activity appears on screen.
