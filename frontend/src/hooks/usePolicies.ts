import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { useContracts, useUserAddress } from './useContracts';
import { useFHE } from './useFHE';
import { PolicyType } from '../utils/contracts';

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
      message.error('Failed to load policies');
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
        message.error('Wallet not connected');
        return null;
      }

      try {
        await initFHE();

        const policyContractAddress = contracts.policyRegistry.target as string;

        const { encryptedPremium, premiumProof, encryptedCoverage, coverageProof } =
          await encryptPolicyData(premium, coverage, policyContractAddress, userAddress);

        const tx = await contracts.policyRegistry.createPolicy(
          policyType,
          encryptedPremium,
          encryptedCoverage,
          premiumProof,
          coverageProof,
          durationMonths
        );

        message.loading('Creating policy...', 0);
        const receipt = await tx.wait();
        message.destroy();
        message.success('Policy created successfully!');

        await fetchPolicies();
        return receipt;
      } catch (error) {
        console.error('Failed to create policy:', error);
        message.error('Failed to create policy');
        return null;
      }
    },
    [contracts, initFHE, encryptPolicyData, fetchPolicies]
  );

  const renewPolicy = useCallback(
    async (policyId: number) => {
      if (!contracts) {
        message.error('Wallet not connected');
        return false;
      }

      try {
        const tx = await contracts.policyRegistry.renewPolicy(policyId);

        message.loading('Renewing policy...', 0);
        await tx.wait();
        message.destroy();
        message.success('Policy renewed successfully!');

        await fetchPolicies();
        return true;
      } catch (error) {
        console.error('Failed to renew policy:', error);
        message.error('Failed to renew policy');
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
