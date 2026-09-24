import { describe, expect, it } from 'vitest';
import { buildApproveAgentRequest } from './hyperliquid-agent';

describe('buildApproveAgentRequest', () => {
  it('keeps the Hyperliquid agent name within the venue limit', () => {
    const { action, typedData } = buildApproveAgentRequest(
      '0x1111111111111111111111111111111111111111',
      'a customer-facing name that is much too long',
    );

    expect(action.agentName).toMatch(/^[A-Za-z0-9_-]{1,12}$/);
    expect(Buffer.byteLength(action.agentName, 'utf8')).toBeLessThanOrEqual(12);
    expect(typedData.message.agentName).toBe(action.agentName);
  });

  it('uses a valid fallback when the requested name is blank', () => {
    const { action } = buildApproveAgentRequest(
      '0x1111111111111111111111111111111111111111',
      '   ',
    );

    expect(action.agentName).toBe('CivalAgent');
  });

  it('removes multibyte punctuation from a provisioned customer display name', () => {
    const { action } = buildApproveAgentRequest(
      '0x1111111111111111111111111111111111111111',
      'solo — lee.anthony1089@gmail.com',
    );
    expect(action.agentName).toBe('sololeeantho');
    expect(Buffer.byteLength(action.agentName, 'utf8')).toBe(12);
  });
});
