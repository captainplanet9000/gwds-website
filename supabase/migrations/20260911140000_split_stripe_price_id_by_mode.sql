-- hosting_plans.stripe_price_id was one column shared by every environment that reads this table.
-- Pilot and production point at the same self-hosted Supabase instance but use different Stripe
-- API keys (test vs live), and a Stripe price object's mode is fixed at creation -- it cannot be
-- edited after the fact. A single shared column can only ever hold one mode's price id at a time,
-- so whichever environment wrote it last silently breaks checkout for the other. Confirmed live on
-- 2026-09-11: this column held pilot's test-mode price ids, which would have failed production's
-- HOSTING_PRICE_MISMATCH check (price.livemode !== live) the moment production's own checkout
-- became reachable.
--
-- Splits into stripe_price_id_test and stripe_price_id_live so each environment's checkout route
-- reads the column matching its own STRIPE_SECRET_KEY mode. stripe_price_id_test is backfilled from
-- the existing column (it already held test-mode ids). stripe_price_id_live starts NULL -- no real
-- live-mode Stripe prices have been created yet, and PLAN_NOT_READY is the correct, safe result of
-- that until they are, not a value to fabricate here.
--
-- The old stripe_price_id column is left in place rather than dropped: both the pilot and
-- production checkout routes still read it until each is redeployed against the new columns, and
-- dropping it now would break whichever deploys second.

ALTER TABLE public.hosting_plans ADD COLUMN IF NOT EXISTS stripe_price_id_test text;
ALTER TABLE public.hosting_plans ADD COLUMN IF NOT EXISTS stripe_price_id_live text;

UPDATE public.hosting_plans
SET stripe_price_id_test = stripe_price_id
WHERE stripe_price_id_test IS NULL;

COMMENT ON COLUMN public.hosting_plans.stripe_price_id_test IS
  'Stripe test-mode price id for this plan. Read by the checkout route when STRIPE_SECRET_KEY is a test key.';
COMMENT ON COLUMN public.hosting_plans.stripe_price_id_live IS
  'Stripe live-mode price id for this plan. Read by the checkout route when STRIPE_SECRET_KEY is a live key. NULL until a real live price is created -- checkout correctly refuses (PLAN_NOT_READY) rather than charging against no configured price.';
COMMENT ON COLUMN public.hosting_plans.stripe_price_id IS
  'Deprecated 2026-09-11 in favor of stripe_price_id_test/stripe_price_id_live (one column cannot hold both a test-mode and a live-mode price id at once). Drop once no deployed checkout route reads it.';
