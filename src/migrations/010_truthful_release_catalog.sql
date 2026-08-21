-- Cival Systems truthful v1 release catalog.
-- All artifacts default to unavailable. Readiness is promoted only after the
-- exact private Storage object is downloaded and its SHA-256 is reverified.

update public.products
set is_active = false,
    artifact_ready = false,
    updated_at = now();

insert into public.products (
  id, name, description, price_cents, category, badge, emoji, features,
  stripe_price_id, download_url, is_active, version, artifact_path,
  artifact_sha256, artifact_size_bytes, artifact_ready, updated_at
)
values
  (
    'trading-dashboard-template', 'Core Edition',
    'The complete Cival TypeScript dashboard source workspace. Release remains paused until clean-build and dependency-security gates pass.',
    9900, 'trading', 'FOUNDER PRICE', 'CORE',
    '["Complete TypeScript dashboard source","Paper and integration workflows","Risk and orchestration interfaces"]'::jsonb,
    'price_1U09vdLLyk0oaesNmjX9ZSDL', 'downloads/ai-trading-dashboard-v1.0.1.zip',
    true, '1.0.1', 'ai-trading-dashboard-v1.0.1.zip',
    'e4658d932f107ae787569b0623c83897a34b8504d4ac451e5b4f8e352c2cf69a', 6161046, false, now()
  ),
  (
    'strategy-pack', 'Seven-Strategy Research Pack',
    'Seven strategies wired into the Cival dispatcher with a reproducible historical-candle harness and evidence dossier including adverse results.',
    14900, 'trading', 'EVIDENCE INCLUDED', '7X',
    '["Seven exact dispatcher strategies","Reproducible evaluation harness","JSON, CSV, and Markdown evidence"]'::jsonb,
    'price_1U6fUeLLyk0oaesN0BYagEvp', 'downloads/strategy-pack-v1.0.0.zip',
    true, '1.0.0', 'strategy-pack-v1.0.0.zip',
    'cde30eb77175f0a64cdc5ecec66a021b6e498a221c1f343c54fb35e8d15591d4', 70357, false, now()
  ),
  (
    'meme-trading-suite', 'Meme Trading Suite',
    'Solana meme-market research workspace and integration source extension.',
    7900, 'trading', 'EXTENSION', 'MEME',
    '["Nine implemented tabs","DexScreener research workflows","Wallet and Solana integration points"]'::jsonb,
    'price_1U09vdLLyk0oaesNetEHtOa0', 'downloads/meme-trading-suite-v1.0.1.zip',
    true, '1.0.1', 'meme-trading-suite-v1.0.1.zip',
    '31773cfde5600174719aa7727a4d1f457fa157f5cf1ffda63424bb204887e3ba', 91229, false, now()
  ),
  (
    'flash-loan-arbitrage', 'Flash Loan Arbitrage Reference',
    'Arbitrum cross-DEX and Aave V3 flash-loan reference source extension.',
    7900, 'trading', 'EXTENSION', 'FLASH',
    '["Four venue adapters","Aave V3 reference flow","Dry-run and gas-aware controls"]'::jsonb,
    'price_1U09vdLLyk0oaesNO6v6K9Ei', 'downloads/flash-loan-arbitrage-v1.1.1.zip',
    true, '1.1.1', 'flash-loan-arbitrage-v1.1.1.zip',
    'efcadb9c7d444eba13a4c47e37411774aa5ce3467889ac3412ed32d2b9c6504e', 89768, false, now()
  ),
  (
    'multi-strat-bundle', 'Trader Edition',
    'Core Edition and the Seven-Strategy Research Pack in one versioned source bundle.',
    19900, 'trading', 'SAVE $49', 'TRADER',
    '["Core Edition","Seven-Strategy Research Pack","Nested release hashes"]'::jsonb,
    'price_1U6fUfLLyk0oaesNXjQHm8mS', 'downloads/trader-edition-v1.0.0.zip',
    true, '1.0.0', 'trader-edition-v1.0.0.zip',
    '2545a06d31b523859bdc0ef0f09c334eef3ab8990516afa0b575c81a9d68edb6', 5822904, false, now()
  ),
  (
    'everything-bundle', 'Desk Edition',
    'Core, seven-strategy research, meme-market workspace, and flash-loan reference source bundle.',
    34900, 'trading', 'COMPLETE DESK', 'DESK',
    '["Everything in Trader Edition","Meme Trading Suite","Flash Loan Arbitrage Reference"]'::jsonb,
    'price_1U6fUgLLyk0oaesNFqt7X8MN', 'downloads/desk-edition-v1.0.0.zip',
    true, '1.0.0', 'desk-edition-v1.0.0.zip',
    '38c4d03063df5b4ea79c60d8db8cb13e905d96a9625b0f47366e6d5909f24345', 5984506, false, now()
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  category = excluded.category,
  badge = excluded.badge,
  emoji = excluded.emoji,
  features = excluded.features,
  stripe_price_id = excluded.stripe_price_id,
  download_url = excluded.download_url,
  is_active = excluded.is_active,
  version = excluded.version,
  artifact_path = excluded.artifact_path,
  artifact_sha256 = excluded.artifact_sha256,
  artifact_size_bytes = excluded.artifact_size_bytes,
  artifact_ready = false,
  updated_at = now();
