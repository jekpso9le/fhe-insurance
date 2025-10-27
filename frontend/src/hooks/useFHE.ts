import { useCallback, useState } from 'react';
import { initializeFHE, encryptUint64Value, encryptUint32Value, encryptUint8Value } from '../lib/fhe';

export const useFHE = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    if (isInitialized) return;
    setLoading(true);
    setError(null);
    try {
      await initializeFHE();
      setIsInitialized(true);
    } catch (err) {
      setError('Failed to initialize FHE');
      console.error('FHE initialization error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isInitialized]);

  const encryptPolicyData = useCallback(
    async (
      premium: number,
      coverage: number,
      contractAddress: string,
      userAddress?: string | null
    ) => {
      if (!userAddress) {
        throw new Error('Wallet not connected');
      }

      try {
        const [encPremium, encCoverage] = await Promise.all([
          encryptUint64Value(premium, contractAddress, userAddress),
          encryptUint64Value(coverage, contractAddress, userAddress),
        ]);

        return {
          encryptedPremium: encPremium.handle,
          premiumProof: encPremium.proof,
          encryptedCoverage: encCoverage.handle,
          coverageProof: encCoverage.proof,
        };
      } catch (err) {
        console.error('Encryption error:', err);
        throw new Error('Failed to encrypt policy data');
      }
    },
    []
  );

  const encryptClaim = useCallback(
    async (amount: number, contractAddress: string, userAddress?: string | null) => {
      if (!userAddress) {
        throw new Error('Wallet not connected');
      }

      try {
        const encrypted = await encryptUint64Value(amount, contractAddress, userAddress);
        return {
          encryptedAmount: encrypted.handle,
          amountProof: encrypted.proof,
        };
      } catch (err) {
        console.error('Encryption error:', err);
        throw new Error('Failed to encrypt claim amount');
      }
    },
    []
  );

  const encryptRiskProfile = useCallback(
    async (
      age: number,
      healthScore: number,
      creditScore: number,
      contractAddress: string,
      userAddress?: string | null
    ) => {
      if (!userAddress) {
        throw new Error('Wallet not connected');
      }

      try {
        const [encAge, encHealth, encCredit] = await Promise.all([
          encryptUint8Value(age, contractAddress, userAddress),
          encryptUint8Value(healthScore, contractAddress, userAddress),
          encryptUint8Value(creditScore, contractAddress, userAddress),
        ]);

        return {
          encryptedAge: encAge.handle,
          ageProof: encAge.proof,
          encryptedHealthScore: encHealth.handle,
          healthProof: encHealth.proof,
          encryptedCreditScore: encCredit.handle,
          creditProof: encCredit.proof,
        };
      } catch (err) {
        console.error('Encryption error:', err);
        throw new Error('Failed to encrypt risk profile');
      }
    },
    []
  );

  return {
    isInitialized,
    loading,
    error,
    initialize,
    encryptPolicyData,
    encryptClaim,
    encryptRiskProfile,
  };
};
