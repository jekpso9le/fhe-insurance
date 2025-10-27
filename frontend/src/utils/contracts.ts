import { ethers } from 'ethers';
import PolicyRegistryABI from '../contracts/PolicyRegistry.json';
import ClaimsManagerABI from '../contracts/ClaimsManager.json';
import RiskAssessmentABI from '../contracts/RiskAssessment.json';

export const POLICY_REGISTRY_ADDRESS = import.meta.env.VITE_POLICY_REGISTRY_ADDRESS;
export const CLAIMS_MANAGER_ADDRESS = import.meta.env.VITE_CLAIMS_MANAGER_ADDRESS;
export const RISK_ASSESSMENT_ADDRESS = import.meta.env.VITE_RISK_ASSESSMENT_ADDRESS;

/**
 * Get contract instances with signer
 */
export const getContracts = (signer: ethers.Signer) => {
  const policyRegistry = new ethers.Contract(
    POLICY_REGISTRY_ADDRESS,
    PolicyRegistryABI.abi,
    signer
  );

  const claimsManager = new ethers.Contract(
    CLAIMS_MANAGER_ADDRESS,
    ClaimsManagerABI.abi,
    signer
  );

  const riskAssessment = new ethers.Contract(
    RISK_ASSESSMENT_ADDRESS,
    RiskAssessmentABI.abi,
    signer
  );

  return {
    policyRegistry,
    claimsManager,
    riskAssessment,
  };
};

/**
 * Policy types enum
 */
export enum PolicyType {
  Health = 0,
  Property = 1,
  Life = 2,
  Cyber = 3,
}

/**
 * Policy status enum
 */
export enum PolicyStatus {
  Active = 0,
  Suspended = 1,
  Cancelled = 2,
  Expired = 3,
}

/**
 * Claim types enum
 */
export enum ClaimType {
  Medical = 0,
  Accident = 1,
  Property = 2,
  Cyber = 3,
}

/**
 * Claim status enum
 */
export enum ClaimStatus {
  Pending = 0,
  UnderReview = 1,
  Approved = 2,
  Rejected = 3,
  Paid = 4,
}

/**
 * Format policy type to readable string
 */
export function formatPolicyType(type: number): string {
  const types = ['Health', 'Property', 'Life', 'Cyber'];
  return types[type] || 'Unknown';
}

/**
 * Format policy status to readable string
 */
export function formatPolicyStatus(status: number): string {
  const statuses = ['Active', 'Suspended', 'Cancelled', 'Expired'];
  return statuses[status] || 'Unknown';
}

/**
 * Format claim type to readable string
 */
export function formatClaimType(type: number): string {
  const types = ['Medical', 'Accident', 'Property', 'Cyber'];
  return types[type] || 'Unknown';
}

/**
 * Format claim status to readable string
 */
export function formatClaimStatus(status: number): string {
  const statuses = ['Pending', 'Under Review', 'Approved', 'Rejected', 'Paid'];
  return statuses[status] || 'Unknown';
}

// Re-export from formatters
export { formatDate, formatDateTime } from './formatters';
