'use client';

import { useCallback } from 'react';
import { useConnection, useSwitchChain } from 'wagmi';

/** Wallets sign and send only on their active chain, so switch to the workspace's chain first. */
export function useEnsureChain() {
  const connection = useConnection();
  const { mutateAsync: switchChainAsync } = useSwitchChain();
  return useCallback(async (chainId: number) => {
    if (connection.chainId === chainId) return;
    await switchChainAsync({ chainId });
  }, [connection.chainId, switchChainAsync]);
}
