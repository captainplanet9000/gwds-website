-- Solo ($19/mo) previously named included_product_id = 'trading-dashboard-template', which grants
-- the dashboard itself but expands to zero real trading-agent products in public.product_includes
-- -- see services/host-agent/src/loadout.ts's own header comment, which documents this exact case
-- ("solo naming 'trading-dashboard-template'") as the demonstration that plan-inclusion correctly
-- refuses when the named product grants nothing.
--
-- That was correct behavior for an unintentional gap, not the intended final shape: the onboarding
-- form at /account/hosting lets a customer choose from the same HOSTING_AGENT_IDS list every tier
-- sees, which only makes sense if Solo actually grants access to a real agent. Pointing Solo at
-- 'everything-bundle' (already used by Desk/Fund) grants entitlement to all six real strategy
-- products; agent_limit is what keeps each tier capped at how many of those it may actually
-- install -- Solo gets exactly one, of the customer's choosing.
UPDATE public.hosting_plans
   SET included_product_id = 'everything-bundle',
       agent_limit = 1
 WHERE id = 'solo';
