import { afterEach, describe, expect, it, vi } from "vitest";

const stubAddresses = () => {
  vi.stubEnv("VITE_POLICY_REGISTRY_ADDRESS", "0x0000000000000000000000000000000000000001");
  vi.stubEnv("VITE_CLAIMS_MANAGER_ADDRESS", "0x0000000000000000000000000000000000000002");
  vi.stubEnv("VITE_RISK_ASSESSMENT_ADDRESS", "0x0000000000000000000000000000000000000003");
};

const loadContractsModule = async () => {
  vi.resetModules();
  stubAddresses();
  return import("../frontend/src/utils/contracts");
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("policy helper formatters", () => {
  it("maps policy types to readable labels", async () => {
    const { formatPolicyType } = await loadContractsModule();
    expect(formatPolicyType(0)).toBe("Health");
    expect(formatPolicyType(1)).toBe("Property");
    expect(formatPolicyType(2)).toBe("Life");
    expect(formatPolicyType(3)).toBe("Cyber");
  });

  it("returns Unknown for unmapped policy types", async () => {
    const { formatPolicyType } = await loadContractsModule();
    expect(formatPolicyType(99)).toBe("Unknown");
  });

  it("maps policy status codes to readable labels", async () => {
    const { formatPolicyStatus } = await loadContractsModule();
    expect(formatPolicyStatus(0)).toBe("Active");
    expect(formatPolicyStatus(1)).toBe("Suspended");
    expect(formatPolicyStatus(2)).toBe("Cancelled");
    expect(formatPolicyStatus(3)).toBe("Expired");
  });
});

describe("claim helper formatters", () => {
  it("maps claim types to readable labels", async () => {
    const { formatClaimType } = await loadContractsModule();
    expect(formatClaimType(0)).toBe("Medical");
    expect(formatClaimType(1)).toBe("Accident");
    expect(formatClaimType(2)).toBe("Property");
    expect(formatClaimType(3)).toBe("Cyber");
  });

  it("maps claim status codes to readable labels", async () => {
    const { formatClaimStatus } = await loadContractsModule();
    expect(formatClaimStatus(0)).toBe("Pending");
    expect(formatClaimStatus(1)).toBe("Under Review");
    expect(formatClaimStatus(2)).toBe("Approved");
    expect(formatClaimStatus(3)).toBe("Rejected");
    expect(formatClaimStatus(4)).toBe("Paid");
  });

  it("returns Unknown for unmapped claim status codes", async () => {
    const { formatClaimStatus } = await loadContractsModule();
    expect(formatClaimStatus(42)).toBe("Unknown");
  });
});

describe("enumeration exports", () => {
  it("exposes enum values for policy and claim constants", async () => {
    const { ClaimStatus, ClaimType, PolicyStatus, PolicyType } = await loadContractsModule();
    expect(PolicyType.Health).toBe(0);
    expect(PolicyType.Cyber).toBe(3);
    expect(PolicyStatus.Active).toBe(0);
    expect(PolicyStatus.Expired).toBe(3);
    expect(ClaimType.Medical).toBe(0);
    expect(ClaimType.Cyber).toBe(3);
    expect(ClaimStatus.Pending).toBe(0);
    expect(ClaimStatus.Paid).toBe(4);
  });
});
