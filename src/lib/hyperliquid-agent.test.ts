import { describe, expect, it } from 'vitest';
import { buildApproveAgentRequest } from './hyperliquid-agent';

describe('buildApproveAgentRequest', () => {
  it('keeps the Hyperliquid agent name within the venue limit', () => {
    const { action, typedData } = buildApproveAgentRequest(
      '0x1111111111111111111111111111111111111111',
      'a customer-facing name that is much too long',
    );

    expect(action.agentName).toHaveLength(16);
    expect(typedData.message.agentName).toBe(action.agentName);
  });

  it('uses a valid fallback when the requested name is blank', () => {
    const { action } = buildApproveAgentRequest(
      '0x1111111111111111111111111111111111111111',
      '   ',
    );

    expect(action.agentName).toBe('cival-agent');
  });
});
