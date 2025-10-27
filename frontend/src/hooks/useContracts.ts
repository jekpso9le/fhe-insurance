import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';
import { getContracts } from '../utils/contracts';

/**
 * Hook to get contract instances with connected wallet
 */
export const useContracts = () => {
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [contracts, setContracts] = useState<ReturnType<typeof getContracts> | null>(null);

  useEffect(() => {
    const initContracts = async () => {
      if (!isConnected || !walletClient) {
        setContracts(null);
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(walletClient as any);
        const signer = await provider.getSigner();
        const contractsInstance = getContracts(signer);
        setContracts(contractsInstance);
      } catch (error) {
        console.error('Failed to get contracts:', error);
        setContracts(null);
      }
    };

    initContracts();
  }, [isConnected, walletClient]);

  return contracts;
};

/**
 * Hook to get current user address
 */
export const useUserAddress = () => {
  const { address } = useAccount();
  return address || null;
};

/**
 * Hook to check if user is contract owner
 */
export const useIsOwner = () => {
  const { address } = useAccount();

  // In production, this should check against the actual contract owner
  // For now, return false as placeholder
  return false;
};
