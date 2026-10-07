import { describe, expect, it } from 'vitest';
import { civalEmailSender } from './email-brand';
describe('Cival email sender', () => {
  it('replaces legacy display names while preserving the verified address', () => {
    expect(civalEmailSender('GWDS Store <store@example.com>')).toBe('Cival Systems <store@example.com>');
    expect(civalEmailSender('store@example.com')).toBe('Cival Systems <store@example.com>');
  });
  it('rejects malformed sender configuration', () => {
    expect(() => civalEmailSender('bad\naddress')).toThrow();
    expect(civalEmailSender('')).toBeUndefined();
  });
});
