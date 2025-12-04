import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useContracts, useUserAddress } from './useContracts';
import { useFHE } from './useFHE';
import { PolicyType } from '../utils/contracts';
import { txPending, txSuccess, txError } from '../lib/txToast';

export interface Policy {
  id: number;
  owner: string;
  policyType: number;
  status: number;
  startDate: number;
  endDate: number;
}

/**
 * Hook to manage user policies
 */
export const usePolicies = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);
  const contracts = useContracts();
  const userAddress = useUserAddress();
  const { initialize: initFHE, encryptPolicyData } = useFHE();

  const fetchPolicies = useCallback(async () => {
    if (!contracts || !userAddress) return;

    setLoading(true);
    try {
      const policyIds = await contracts.policyRegistry.getUserPolicies(userAddress);

      const policiesData = await Promise.all(
        policyIds.map(async (id: bigint) => {
          const policyDetails = await contracts.policyRegistry.getPolicyDetails(id);
          return {
            id: Number(id),
            owner: policyDetails.policyholder,
            policyType: Number(policyDetails.policyType),
            status: Number(policyDetails.status),
            startDate: Number(policyDetails.startDate),
            endDate: Number(policyDetails.endDate),
          };
        })
      );

      setPolicies(policiesData);
    } catch (error) {
      console.error('Failed to fetch policies:', error);
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  }, [contracts, userAddress]);

  const createPolicy = useCallback(
    async (
      policyType: PolicyType,
      premium: number,
      coverage: number,
      durationMonths: number
    ) => {
      if (!contracts || !userAddress) {
        toast.error('Wallet not connected');
        return null;
      }

      let toastId: string | number | undefined;

      try {
        await initFHE();

        const policyContractAddress = contracts.policyRegistry.target as string;

        const { encryptedPremium, premiumProof, encryptedCoverage, coverageProof } =
          await encryptPolicyData(premium, coverage, policyContractAddress, userAddress);

        toastId = txPending('Creating policy...');

        const tx = await contracts.policyRegistry.createPolicy(
          policyType,
          encryptedPremium,
          encryptedCoverage,
          premiumProof,
          coverageProof,
          durationMonths
        );

        toast.loading('Waiting for confirmation...', {
          id: toastId,
          description: `Transaction: ${tx.hash.slice(0, 10)}...`,
        });

        const receipt = await tx.wait();
        txSuccess('Policy created successfully!', tx.hash, toastId);

        await fetchPolicies();
        return receipt;
      } catch (error) {
        console.error('Failed to create policy:', error);
        txError('Failed to create policy', error as Error, undefined, toastId);
        return null;
      }
    },
    [contracts, userAddress, initFHE, encryptPolicyData, fetchPolicies]
  );

  const renewPolicy = useCallback(
    async (policyId: number, additionalMonths: number = 12) => {
      if (!contracts) {
        toast.error('Wallet not connected');
        return false;
      }

      let toastId: string | number | undefined;

      try {
        toastId = txPending('Renewing policy...');

        const tx = await contracts.policyRegistry.renewPolicy(policyId, additionalMonths);

        toast.loading('Waiting for confirmation...', {
          id: toastId,
          description: `Transaction: ${tx.hash.slice(0, 10)}...`,
        });

        await tx.wait();
        txSuccess('Policy renewed successfully!', tx.hash, toastId);

        await fetchPolicies();
        return true;
      } catch (error) {
        console.error('Failed to renew policy:', error);
        txError('Failed to renew policy', error as Error, undefined, toastId);
        return false;
      }
    },
    [contracts, fetchPolicies]
  );

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  return {
    policies,
    loading,
    createPolicy,
    renewPolicy,
    refetch: fetchPolicies,
  };
};
