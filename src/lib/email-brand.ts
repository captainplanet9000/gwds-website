/** Keep the verified sender mailbox but never inherit a legacy display name. */
export function civalEmailSender(configured = process.env.RESEND_FROM_EMAIL): string | undefined {
  if (!configured) return undefined;
  const mailbox = (configured.match(/<([^<>]+)>/)?.[1] ?? configured).trim();
  if (!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(mailbox)) {
    throw new Error('Transactional email sender address is invalid');
  }
  return `Cival Systems <${mailbox}>`;
}
