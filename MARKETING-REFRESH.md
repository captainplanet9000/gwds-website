# Marketing and mobile refresh — 2026-09-19

- Hosted onboarding now uses explicit 21px card headings and a 4/2/1 responsive grid.
- Signed-in customers see Open hosting account instead of trial/plan signup buttons. Account eligibility and checkout rules remain authoritative.
- Docs retain release-specific installation and safety status while adding readable typography, responsive navigation and new Cival concept artwork.
- About explains product mission, automation visibility and source/hosting choices; founder biography removed.
- Homepage copy refreshed below the unchanged Hero. Unsubstantiated performance/community figures and instant-operation promises removed.
- Footer no longer inherits a viewport-height minimum. Phone footer links use two columns.

## Verification
- 110 tests passed; production build passed; targeted ESLint passed without warnings after replacing legacy homepage img elements.
- Browser checked at 390px and 1440px: no page horizontal overflow; hosted step headings 21px; desktop footer 459px.
- Production dpl_2agfCK4vMupaNM4yRzyViywk6H9V promoted successfully. Signed-in /hosted has zero trial buttons; account link reaches active Solo hosting with healthy runtime. Live Docs artwork loaded, About founder copy absent, all eight refreshed homepage section headings verified at 390px without horizontal overflow.
- Screenshot: release-assets/verification/docs-mobile-refreshed.jpg.

## Image provenance
Built-in image generation, stylized-concept mode. Original generated PNG: exec-e064fff2-6570-4940-aa60-09e23a8a01b4.png. Published WebP at original dimensions at public/images/guides/cival-systems-v2.webp (1672 x 941, quality 92 encoding). Conceptual artwork, not a product screenshot.

Prompt: Create a premium wide landscape editorial brand artwork for Cival Systems trading software documentation, 16:9, highest available resolution. Deep almost-black forest green studio environment with luminous mint green edge lighting, elegant modular dark glass and brushed metal structures representing a central trading dashboard connected to six autonomous strategy modules, orderly precise paths and subtle market waveform lines etched into glass. Calm, sophisticated, approachable financial technology. Product-focused conceptual illustration, not a screenshot. No fake UI, no performance numbers, no money, no coins, no people, no text or logos. Rich detail, restrained glow, spacious composition, cohesive deep green and mint palette.

This release does not resolve the separate source archive/compiler acceptance blockers or certify trading performance.
