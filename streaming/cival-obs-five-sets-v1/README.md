# Cival OBS — Five Transparent Overlay Sets

Five genuinely different Cival Systems broadcast systems, each delivered for desktop and mobile. Every PNG has an alpha channel and a matching editable SVG.

## Included sets

1. **System Grid** — precise corner rails, status capsules, and operational grid details.
2. **Agent Mesh** — chamfered hexagonal geometry and connected-agent visual language.
3. **Terminal Ops** — sharp terminal brackets, command-line labels, and blue-green secondary signals.
4. **Signal Glass** — rounded glass frames, soft signal arcs, and teal/mint highlights.
5. **Source Minimal** — restrained editorial lines, asymmetry, and minimal UI chrome.

## Each set contains

### Desktop — 1920 x 1080

- Clean broadcast overlay
- Product plus webcam
- Product plus chat
- Product plus webcam and chat
- Just-chatting/deep-dive layout

### Mobile — 1080 x 1920

- Clean vertical overlay
- Product plus camera
- Product plus chat
- Product plus camera and chat
- Vertical just-chatting layout

### Modules

- Blank themed lower third
- Blank themed alert card

## Using the PNGs in OBS

1. Set the OBS canvas to the image dimensions.
2. Add your screen, camera, or chat sources.
3. Add the chosen overlay as an Image source above those sources.
4. Keep the PNG at its native size.
5. Fit the sources inside the outlined capture regions.

The checkerboard in `previews/five-set-contact-sheet.png` demonstrates transparency and is not baked into the overlays.

## Editing

Matching source files are under `editable-svg/`, preserving the same set and layout folder structure. Change labels, line weights, opacity, or color in Figma, Illustrator, or Inkscape, then export at the original size.

Primary Cival accent: `#4ade9f`. Keep the overall field transparent; use the dark fills only for small readable UI panels.

## Streaming safety

Keep the demo/paper-mode disclosure visible while simulated balances, performance, or order activity is shown. Do not capture `.env` files, API keys, exchange credentials, Stripe data, wallet secrets, or admin pages.
