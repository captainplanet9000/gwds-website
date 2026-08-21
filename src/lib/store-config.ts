// A customer-visible launch switch only. The checkout API separately verifies
// authentication, database readiness, exact Stripe prices, and signed Storage
// access on every request, so changing this flag cannot bypass server controls.
export const STORE_SALES_ENABLED = process.env.NEXT_PUBLIC_STORE_SALES_ENABLED === 'true';
