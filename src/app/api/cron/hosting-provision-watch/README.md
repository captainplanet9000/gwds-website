# Not scheduled on Vercel — deliberately

This route stays deployable and callable, but it is NOT in vercel.json's `crons`.

A `*/15 * * * *` schedule is rejected outright on Vercel Hobby ("limited to daily cron jobs"),
which failed the whole production deploy — every new route 404'd while the previous build kept
serving, so the failure looked like missing code rather than a rejected config.

It also belongs somewhere else. Detecting a provision that paid but never completed is the host
agent's job: it already polls control.tenant_commands continuously, runs on the operator's box
with no plan limits, and is the only process that can actually do something about a stuck
provision. A cloud cron can only observe.

Call this route manually, or from the host agent, if you want the check on demand.
