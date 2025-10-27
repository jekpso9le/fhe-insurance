import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { useContracts, useUserAddress } from './useContracts';
import { useFHE } from './useFHE';
import { ClaimType } from '../utils/contracts';

export interface Claim {
  id: number;
  policyId: number;
  claimant: string;
  claimType: number;
  status: number;
  submittedAt: number;
  description: string;
}

/**
 * Hook to manage claims
 */
export const useClaims = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const contracts = useContracts();
  const userAddress = useUserAddress();
  const { initialize: initFHE, encryptClaim } = useFHE();

  const fetchClaims = useCallback(async () => {
    if (!contracts || !userAddress) return;

    setLoading(true);
    try {
      const claimIds = await contracts.claimsManager.getUserClaims(userAddress);

      const claimsData = await Promise.all(
        claimIds.map(async (id: bigint) => {
          const claim = await contracts.claimsManager.getClaimDetails(id);
          return {
            id: Number(id),
            policyId: Number(claim.policyId),
            claimant: claim.claimant,
            claimType: Number(claim.claimType),
            status: Number(claim.status),
            submittedAt: Number(claim.submittedAt),
            description: claim.description,
          };
        })
      );

      setClaims(claimsData);
    } catch (error) {
      console.error('Failed to fetch claims:', error);
      message.error('Failed to load claims');
    } finally {
      setLoading(false);
    }
  }, [contracts, userAddress]);

  const submitClaim = useCallback(
    async (
      policyId: number,
      claimType: ClaimType,
      amount: number,
      description: string
    ) => {
      if (!contracts || !userAddress) {
        message.error('Wallet not connected');
        return null;
      }

      try {
        await initFHE();

        const claimsAddress = contracts.claimsManager.target as string;

        const { encryptedAmount, amountProof } = await encryptClaim(
          amount,
          claimsAddress,
          userAddress
        );

        const tx = await contracts.claimsManager.submitClaim(
          policyId,
          claimType,
          encryptedAmount,
          amountProof,
          description
        );

        message.loading('Submitting claim...', 0);
        const receipt = await tx.wait();
        message.destroy();
        message.success('Claim submitted successfully!');

        await fetchClaims();
        return receipt;
      } catch (error) {
        console.error('Failed to submit claim:', error);
        message.error('Failed to submit claim');
        return null;
      }
    },
    [contracts, initFHE, encryptClaim, fetchClaims]
  );

  const approveClaim = useCallback(
    async (claimId: number, approvedAmount: number) => {
      if (!contracts || !userAddress) {
        message.error('Wallet not connected');
        return false;
      }

      try {
        await initFHE();

        const claimsAddress = contracts.claimsManager.target as string;

        const { encryptedAmount, amountProof } = await encryptClaim(
          approvedAmount,
          claimsAddress,
          userAddress
        );

        const tx = await contracts.claimsManager.approveClaim(
          claimId,
          encryptedAmount,
          amountProof
        );

        message.loading('Approving claim...', 0);
        await tx.wait();
        message.destroy();
        message.success('Claim approved successfully!');

        await fetchClaims();
        return true;
      } catch (error) {
        console.error('Failed to approve claim:', error);
        message.error('Failed to approve claim');
        return false;
      }
    },
    [contracts, initFHE, encryptClaim, fetchClaims]
  );

  const rejectClaim = useCallback(
    async (claimId: number) => {
      if (!contracts) {
        message.error('Wallet not connected');
        return false;
      }

      try {
        const tx = await contracts.claimsManager.rejectClaim(claimId);

        message.loading('Rejecting claim...', 0);
        await tx.wait();
        message.destroy();
        message.success('Claim rejected');

        await fetchClaims();
        return true;
      } catch (error) {
        console.error('Failed to reject claim:', error);
        message.error('Failed to reject claim');
        return false;
      }
    },
    [contracts, fetchClaims]
  );

  const markPaid = useCallback(
    async (claimId: number) => {
      if (!contracts) {
        message.error('Wallet not connected');
        return false;
      }

      try {
        const tx = await contracts.claimsManager.markClaimPaid(claimId);

        message.loading('Marking claim as paid...', 0);
        await tx.wait();
        message.destroy();
        message.success('Claim marked as paid');

        await fetchClaims();
        return true;
      } catch (error) {
        console.error('Failed to mark claim as paid:', error);
        message.error('Failed to mark claim as paid');
        return false;
      }
    },
    [contracts, fetchClaims]
  );

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  return {
    claims,
    loading,
    submitClaim,
    approveClaim,
    rejectClaim,
    markPaid,
    refetch: fetchClaims,
  };
};
