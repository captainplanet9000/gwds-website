# Cival Systems Twitch Stream Kit v1

Complete static broadcast package for showing Cival Systems in action without obscuring the product. The visual system uses Cival Black (`#06110e`), Deep System Green (`#0b1f19`), Hyperliquid Green (`#4ade9f`), Signal Mint (`#7fffc8`), and the approved Cival monogram.

## Start here

Use a 1920 x 1080 canvas at 60 FPS in OBS. Add the image for each scene as the top-most image source, except full-screen scene cards, which replace the rest of the scene.

Recommended scene collection:

1. `00 — Starting Soon`
2. `01 — Cival Product / Clean`
3. `02 — Cival Product / Camera`
4. `03 — Cival Product / Chat`
5. `04 — Systems Deep Dive`
6. `05 — Intermission`
7. `06 — Be Right Back`
8. `07 — Technical Recovery`
9. `08 — Scene Transition`
10. `09 — Stream Ending`

## OBS source order

### Cival Product / Clean

1. `overlays/product-clean-1920x1080.png` — Image, top layer
2. Cival browser/window capture — fit to canvas
3. Desktop audio
4. Microphone

### Cival Product / Camera

1. `overlays/product-webcam-1920x1080.png` — Image, top layer
2. Camera — crop into x 1452, y 744, width 408, height 236
3. Cival browser/window capture — fit to canvas
4. Desktop audio
5. Microphone

### Cival Product / Chat

1. `overlays/product-chat-1920x1080.png` — Image, top layer
2. Chat browser source — x 1488, y 126, width 372, height 786
3. Cival browser/window capture — x 40, y 126, width 1418, height 786
4. Desktop audio
5. Microphone

### Systems Deep Dive

1. `overlays/just-chatting-1920x1080.png` — Image, top layer
2. Camera or screen share — x 62, y 132, width 1216, height 792
3. Desktop audio
4. Microphone

## Scene cards

- `scenes/01-starting-soon.png`
- `scenes/02-be-right-back.png`
- `scenes/03-stream-ending.png`
- `scenes/04-offline.png`
- `scenes/05-technical-difficulties.png`
- `scenes/06-intermission.png`
- `scenes/07-scene-transition.png`

The technical-recovery card deliberately says no live execution is active. Do not use it if the stream is demonstrating a real-money environment.

## Frames and lower thirds

The `frames/` directory includes landscape, square, portrait, and chat frames. The `lower-thirds/` directory includes host, topic, paper-mode, website CTA, and disclaimer cards. Each PNG has a matching editable SVG in `editable-svg/`.

To personalize a lower third, edit its SVG text and export at the original dimensions. Keep names under 28 characters where possible.

## Alerts

Alert cards are 740 x 180 transparent PNGs. In StreamElements, Streamlabs, or Twitch alerts:

- Keep the image at its native size.
- Put the dynamic display name around x 146, y 102 on the final image canvas.
- Use Arial/Helvetica Bold, 20–24 px, color `#effff7`.
- Use the event label already baked into the card; do not repeat it in the dynamic text.

Included: follow, subscriber, raid, support, and member alerts.

## Twitch channel graphics

- Profile banner: `profile/twitch-profile-banner-1200x480.png`
- Profile images: `profile/twitch-profile-picture-256.png` and `-512.png`
- Panels: twelve 320 x 100 PNGs in `panels/`
- Emotes: five concepts at 28, 56, and 112 px plus 512 px masters
- Subscriber badges: five tiers at 18, 36, and 72 px
- Channel-points icon: 28, 56, and 112 px

Use the 256 px profile image for Twitch. The 512 px version is retained as a reusable master.

## Social launch assets

- `social/going-live-1600x900.png`
- `social/vertical-story-1080x1920.png`
- `social/vod-thumbnail-1280x720.png`
- `social/schedule-card-1080x1350.png`

Add episode-specific text to the editable SVG overlay before exporting the VOD thumbnail. Keep the template’s paper-mode language unless the underlying demo changes.

## Broadcast guardrails

- Default to the product’s paper/demo environment.
- Keep the disclosure rail visible while charts, simulated balances, or strategy output are on screen.
- Never describe historical simulation as a guaranteed or expected return.
- Hide exchange keys, wallet addresses, webhook secrets, Stripe data, admin pages, terminal secrets, and `.env` files before capture.
- Use Window Capture instead of Display Capture when practical.
- Turn off browser password-manager prompts and desktop notifications.

## Package map

- `alerts/` — event alert cards
- `channel-points/` — loyalty icon exports
- `editable-svg/` — exact editable vector sources
- `emotes/` — emote masters and Twitch sizes
- `frames/` — camera and chat frames
- `lower-thirds/` — topic, host, CTA, and disclosure cards
- `masters/` — generated creative masters
- `overlays/` — 1920 x 1080 transparent OBS overlays
- `panels/` — Twitch About-page buttons
- `previews/` — contact sheet and product-overlay preview
- `profile/` — Twitch profile artwork
- `scenes/` — full-screen scene cards
- `social/` — going-live, story, and VOD art
- `manifest.json` — machine-readable asset inventory

## Regenerate

From the repository root:

```powershell
node scripts/generate-twitch-kit.mjs
```

The generator only writes within `streaming/cival-twitch-kit-v1/`.
