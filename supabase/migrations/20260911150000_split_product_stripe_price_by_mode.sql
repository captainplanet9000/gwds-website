-- Same root cause as 20260911140000 (hosting_plans), found while testing the product checkout
-- flow end to end on pilot: products.stripe_price_id held live-mode price ids -- confirmed via
-- stripe.prices.retrieve() under pilot's test-mode key: "No such price ...; a similar object
-- exists in live mode, but a test mode key was used." The checkout route's own price-verification
-- step didn't catch this before this migration, because retrieve() itself throws (the price
-- doesn't exist under this key at all) rather than returning a price whose livemode field
-- mismatches -- an unhandled exception, logged only as the generic 'UNEXPECTED' checkout-failure
-- code with no product/price detail.
--
-- Splits into stripe_price_id_test/stripe_price_id_live for the same reason as hosting_plans: this
-- table is shared between pilot (test-mode key) and production (live-mode key). stripe_price_id_live
-- is backfilled from the existing column since those values are confirmed live-mode. Pilot's nine
-- currently-active products (three editions, six agents) get freshly created test-mode Stripe
-- Products+Prices in stripe_price_id_test -- new test-mode Products, not attached to the existing
-- live-mode ones, since test and live are separate Stripe environments and a live Price's Product
-- can't be read back under a test key either. The eighteen inactive/legacy products are left with
-- stripe_price_id_test NULL; none of them are purchasable through the current storefront UI
-- (filtered out by is_active), so there is nothing to test-checkout for them yet.

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stripe_price_id_test text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stripe_price_id_live text;

UPDATE public.products
SET stripe_price_id_live = stripe_price_id
WHERE stripe_price_id_live IS NULL AND stripe_price_id IS NOT NULL;

COMMENT ON COLUMN public.products.stripe_price_id_test IS
  'Stripe test-mode price id for this product. Read by the checkout route when STRIPE_SECRET_KEY is a test key.';
COMMENT ON COLUMN public.products.stripe_price_id_live IS
  'Stripe live-mode price id for this product. Read by the checkout route when STRIPE_SECRET_KEY is a live key.';
COMMENT ON COLUMN public.products.stripe_price_id IS
  'Deprecated 2026-09-11 in favor of stripe_price_id_test/stripe_price_id_live -- see 20260911140000 for why one column cannot hold both. Drop once no deployed checkout route reads it.';
