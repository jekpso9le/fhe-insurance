import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useContracts, useUserAddress } from './useContracts';
import { useFHE } from './useFHE';
import { ClaimType } from '../utils/contracts';
import { txPending, txSuccess, txError } from '../lib/txToast';

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
      toast.error('Failed to load claims');
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
        toast.error('Wallet not connected');
        return null;
      }

      let toastId: string | number | undefined;

      try {
        await initFHE();

        const claimsAddress = contracts.claimsManager.target as string;

        const { encryptedAmount, amountProof } = await encryptClaim(
          amount,
          claimsAddress,
          userAddress
        );

        toastId = txPending('Submitting claim...');

        const tx = await contracts.claimsManager.submitClaim(
          policyId,
          claimType,
          encryptedAmount,
          amountProof,
          description
        );

        // Update toast with tx hash
        toast.loading('Waiting for confirmation...', {
          id: toastId,
          description: `Transaction: ${tx.hash.slice(0, 10)}...`,
        });

        const receipt = await tx.wait();
        txSuccess('Claim submitted successfully!', tx.hash, toastId);

        await fetchClaims();
        return receipt;
      } catch (error) {
        console.error('Failed to submit claim:', error);
        txError('Failed to submit claim', error as Error, undefined, toastId);
        return null;
      }
    },
    [contracts, userAddress, initFHE, encryptClaim, fetchClaims]
  );

  const approveClaim = useCallback(
    async (claimId: number, approvedAmount: number) => {
      if (!contracts || !userAddress) {
        toast.error('Wallet not connected');
        return false;
      }

      let toastId: string | number | undefined;

      try {
        await initFHE();

        const claimsAddress = contracts.claimsManager.target as string;

        const { encryptedAmount, amountProof } = await encryptClaim(
          approvedAmount,
          claimsAddress,
          userAddress
        );

        toastId = txPending('Approving claim...');

        const tx = await contracts.claimsManager.approveClaim(
          claimId,
          encryptedAmount,
          amountProof
        );

        toast.loading('Waiting for confirmation...', {
          id: toastId,
          description: `Transaction: ${tx.hash.slice(0, 10)}...`,
        });

        await tx.wait();
        txSuccess('Claim approved successfully!', tx.hash, toastId);

        await fetchClaims();
        return true;
      } catch (error) {
        console.error('Failed to approve claim:', error);
        txError('Failed to approve claim', error as Error, undefined, toastId);
        return false;
      }
    },
    [contracts, userAddress, initFHE, encryptClaim, fetchClaims]
  );

  const rejectClaim = useCallback(
    async (claimId: number) => {
      if (!contracts) {
        toast.error('Wallet not connected');
        return false;
      }

      let toastId: string | number | undefined;

      try {
        toastId = txPending('Rejecting claim...');

        const tx = await contracts.claimsManager.rejectClaim(claimId);

        toast.loading('Waiting for confirmation...', {
          id: toastId,
          description: `Transaction: ${tx.hash.slice(0, 10)}...`,
        });

        await tx.wait();
        txSuccess('Claim rejected', tx.hash, toastId);

        await fetchClaims();
        return true;
      } catch (error) {
        console.error('Failed to reject claim:', error);
        txError('Failed to reject claim', error as Error, undefined, toastId);
        return false;
      }
    },
    [contracts, fetchClaims]
  );

  const markPaid = useCallback(
    async (claimId: number) => {
      if (!contracts) {
        toast.error('Wallet not connected');
        return false;
      }

      let toastId: string | number | undefined;

      try {
        toastId = txPending('Marking claim as paid...');

        const tx = await contracts.claimsManager.markClaimPaid(claimId);

        toast.loading('Waiting for confirmation...', {
          id: toastId,
          description: `Transaction: ${tx.hash.slice(0, 10)}...`,
        });

        await tx.wait();
        txSuccess('Claim marked as paid', tx.hash, toastId);

        await fetchClaims();
        return true;
      } catch (error) {
        console.error('Failed to mark claim as paid:', error);
        txError('Failed to mark claim as paid', error as Error, undefined, toastId);
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
