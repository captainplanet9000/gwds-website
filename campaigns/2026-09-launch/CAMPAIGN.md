# Cival Systems launch campaign

## Positioning

**Your strategies. Your workspace.** Cival provides a place to explore trading automation, with separate managed-hosting and customizable source-software paths. Lead with what the customer receives, what they must configure, and how they monitor it. Avoid profit forecasts, passive-income language, fabricated performance and claims of universal readiness.

The audience is people evaluating trading automation and technical users who want to understand or customize their software. Hosted customers need a clear connection/setup path; source customers need accurate installation, license and package details. Never present an individual agent as an independent hosted dashboard.

## Deliverables

- `100-tweets.csv`: spreadsheet-ready drafts, gates, relative day/slot, asset, alt text and tracked links.
- `100-tweets.md`: readable review copy.
- `100-tweets.json`: structured export for later approved scheduling.
- `assets/launch-brand.png`: new conceptual brand artwork.
- `assets/workflow-square.png`: new conceptual workflow artwork.
- Existing authentic high-resolution demo captures in `public/images/product-captures` and social profile/header files in `public/images/social`.

There are 100 distinct drafts: 50 education, 10 hosting-review and 40 source-hold. All are below 280 weighted X characters, counting each URL as 23. Rebuild with `python scripts/build-launch-campaign.py`. No publishing integration, automatic schedule or outbound message was created.

## Publication gates

**EDUCATION:** Review the linked page and its current availability before posting. Demo imagery must retain “demo/sample data” context. Educational copy may describe software under validation, but cannot imply it is available for purchase.

**HOSTING_REVIEW:** Hold until signup-to-provisioning acceptance, external alert delivery, recovery verification and available capacity are reviewed. Confirm Solo trial eligibility, payment requirement, renewal amount/date and cancellation behavior. At audit time only two configured host slots were free. Do not buy traffic until capacity can absorb it.

**SOURCE_HOLD:** Do not use for a sales launch until `STORE-RELEASE-ACCEPTANCE.md` is satisfied. Current drafts explicitly acknowledge release validation or point to its notice. After acceptance, re-review the wording and version before changing a hold statement to a purchase CTA. Do not silently remove holds in an imported scheduler.

## Rollout and editorial calendar

The CSV has a 50-day, two-post-per-day starting sequence. These are relative editorial slots, not scheduled dates or claimed optimal times. Pause or reorder by gate; never publish held content simply because its suggested day arrived.

For the first seven days, select from IDs 001–010, 021–025 and 091–100: product introduction, demo, setup and conversations. Use one educational post and one product walkthrough/question each day. Prioritize useful replies over posting volume.

After hosting acceptance, introduce IDs 011–020 across the next week, interleaved with setup, risk and network education. Review admissions every day. Pause conversion posts when capacity is exhausted or an incident affects onboarding.

After source acceptance, introduce Core and Trader (046–055), then one agent family at a time (056–085). Pair every product explanation with setup or research context. Do not run all forty product posts consecutively; rotate with education and genuine customer questions.

Use an initial AM/PM pair appropriate to the audience, then compare two weeks of actual results before choosing times. The campaign does not assume a proven best posting time. Do not pay for followers, automate replies or send unsolicited DMs.

## Creative direction and image use

Brand palette: near-black forest green, mint and off-white. Maintain readable text, restrained composition and generous margins. The new generated images are conceptual artwork, not screenshots. Their text explicitly identifies that distinction.

For product walkthroughs use the original high-resolution captures, not AI-reconstructed UI. Demo charts and balances are sample data. Hosted captures are testnet, and the hosted runtime is broader than current downloadable archives. Never crop away a material network label or publish customer identifiers, wallet details or private account data. Use approved demo captures for public campaign posts by default.

Suggested image rotation: brand hero for introductions; workflow square for setup/risk posts; demo overview for IDs 006–010; existing labelled demo agent captures for later walkthroughs only with an explicit caption explaining that the demo is broader than the source package. Keep a text-only mix so the same image is not repeated on every post. The CSV asset is an option, not a requirement to attach it every time.

Alt text is included in the CSV. Before attaching a screenshot, describe the actual screen and its sample-data status. Do not put performance claims in alt text. Review generated typography at phone size before upload.

## Funnel and landing pages

Awareness → About/demo → hosting or source comparison → requirements → account → checkout → provisioning/download → documented setup → first verified run → support and retention.

Education posts lead to About, Store or setup documentation. Hosting posts lead to `/hosted`; source posts lead to the exact SKU. Every URL carries `utm_source=x`, `utm_medium=organic_social`, `utm_campaign=cival_launch_2026` and a unique `utm_content=post_NNN`. Never add account identifiers or emails to UTMs.

Use existing account and support flows. Do not collect wallet secrets in lead forms. Do not call a checkout click an activated customer. Distinguish subscription created, workspace provisioned, account connected and first verified run.

## Measurement

Weekly review: impressions, link clicks, unique landing visits, verified signups, checkout starts, paid/trial subscriptions by mode, successful provisioning, time to usable workspace, support contacts, cancellations and refunds. Separate test-mode data from live revenue. Conversion rates need their numerator, denominator and date range.

Track activation from actual completed events. Do not infer “first trade” from a running agent or process heartbeat. Compare post topics by qualified visits and successful setup, not likes alone. Set targets after a measured baseline; no invented conversion forecasts are supplied.

Stop promotion for failed checkout/provisioning, broken account access, exhausted capacity, unexplained billing, stale monitoring or unresolved security incidents. Preserve the evidence, publish a factual service update through the appropriate channel, and resume only after verification.

## Support and retention content

Prepare a short welcome checklist linking to setup, network verification, strategy configuration and support. Prepare a first-run review and a trial-expiry explanation using actual Stripe renewal details. Send only through the existing authorized transactional/consented channels; this campaign does not send those messages.

For public support, acknowledge the symptom and move account-specific details into the authenticated support flow. Never request a private key, seed phrase or full payment details. Do not diagnose someone’s financial suitability or promise to recover losses.

## Asset provenance

Built-in image generation was used, with no specific model selector exposed. Brand prompt: premium Cival modular computing sculpture, deep green/mint palette, exact text “Your strategies. Your workspace.” and “Explore automated trading”; footer “Concept artwork • Trading involves risk”; no invented UI/charts/profit claims. Workflow prompt: square editorial composition with three conceptual stations and exact text “Understand the workflow.” / “Configure. Validate. Monitor.”; footer “Concept illustration • Trading involves risk”. Originals are retained in the Codex generated-images directory; selected copies are stored here.
