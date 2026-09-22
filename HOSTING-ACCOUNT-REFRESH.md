# Hosting account refresh — September 19, 2026

The account hosting page previously presented an operator-review form with region choices, a saved simulated/live environment, requested agents, risk fields and notes. Those fields did not reflect the current self-service workspace controls. The form has been removed from the page; the legacy endpoint is retained for compatibility.

The replacement shows billing and trial details, checkout recovery, the actual provisioning queue, authenticated dashboard access, wallet/key verification, dashboard funding access, the current strategy loadout and workspace control links. Runtime process, health, entry pause, scheduler, heartbeat and recent-cycle timestamps come from the customer-scoped instance API. Unavailable data is not shown as healthy or zero usage. Provisioning and runtime refresh automatically; manual refresh and retry are available.

Dashboard opening now navigates in the current tab after obtaining the signed link, avoiding popup blocking after an asynchronous request. Provisioning failures point to support instead of asking a customer to re-approve a wallet unnecessarily. Billing issues show recovery guidance, and canceled accounts retain access to past invoices.

Live verification found a billing-mode defect: the existing pilot subscription is Stripe test-mode, but its portal was created with the production live key. The portal now selects a server-configured key using the authenticated owner's stored subscription mode. Client-supplied customer IDs/modes are ignored. Unknown modes fail closed. The UI labels test billing separately from the trading network.

Verification: 110 tests pass; production build and TypeScript pass; targeted lint passes. Browser checks confirm dashboard authentication and opening, wallet status/balances, agent configuration destination and mobile width without horizontal overflow. No orders, key approvals, transfers, cancellation or payment updates were submitted during verification.

Browser billing verification: the customer's button opens the correct Stripe test-mode portal with subscription, payment method, invoices and cancellation controls. Returned to the hosting page without modifying billing. Configure agents reaches the loadout section; Open dashboard completes authenticated navigation. Mobile width 390px reports document width 382px. Scoped typography and primary-link contrast were corrected during visual review.

Changes are on `fix/store-release-customer-flow`, PR #8. Deployment `dpl_85Ux1bqG4RxJoTVh85KaeGiYMDWs` is promoted on www.civalsystems.com. Final browser verification confirms the replacement page, test billing label, current runtime state, and readable primary action text (RGB 7/19/14 on 74/222/159). Screenshot: `release-assets/verification/hosting-account-refreshed.jpg`.
