import { describe, expect, it, vi } from "vitest";

import * as fheLib from "../frontend/src/lib/fhe";

const ADDRESS_A = "0x0000000000000000000000000000000000000001";
const ADDRESS_B = "0x0000000000000000000000000000000000000002";

describe("encryptUint8Value", () => {
  it("rejects values outside the uint8 range without touching the SDK", async () => {
    const sdkSpy = vi.spyOn(fheLib, "initializeFHE");

    await expect(
      fheLib.encryptUint8Value(-1, ADDRESS_A, ADDRESS_B)
    ).rejects.toThrow("Value out of range for uint8 encryption");

    await expect(
      fheLib.encryptUint8Value(300, ADDRESS_A, ADDRESS_B)
    ).rejects.toThrow("Value out of range for uint8 encryption");

    expect(sdkSpy).not.toHaveBeenCalled();
    sdkSpy.mockRestore();
  });
});
