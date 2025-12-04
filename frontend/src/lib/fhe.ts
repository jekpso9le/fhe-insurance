import { hexlify, getAddress } from "ethers";

declare global {
  interface Window {
    relayerSDK?: {
      initSDK: () => Promise<void>;
      createInstance: (config: Record<string, unknown>) => Promise<any>;
      SepoliaConfig: Record<string, unknown>;
    };
    ethereum?: any;
    okxwallet?: any;
    coinbaseWalletExtension?: any;
  }
}

let fheInstance: any = null;
let sdkPromise: Promise<any> | null = null;

const SDK_URL = "https://cdn.zama.org/relayer-sdk-js/0.3.0-5/relayer-sdk-js.umd.cjs";

const loadSdk = async (): Promise<any> => {
  if (typeof window === "undefined") {
    throw new Error("FHE SDK requires browser environment");
  }

  if (window.relayerSDK) {
    return window.relayerSDK;
  }

  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${SDK_URL}"]`) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener("load", () => resolve(window.relayerSDK));
        existing.addEventListener("error", () => reject(new Error("Failed to load FHE SDK")));
        return;
      }

      const script = document.createElement("script");
      script.src = SDK_URL;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        if (window.relayerSDK) {
          resolve(window.relayerSDK);
        } else {
          reject(new Error("relayerSDK unavailable after load"));
        }
      };
      script.onerror = () => reject(new Error("Failed to load FHE SDK"));
      document.body.appendChild(script);
    });
  }

  return sdkPromise;
};

export const initializeFHE = async (provider?: any): Promise<any> => {
  if (fheInstance) {
    return fheInstance;
  }

  if (typeof window === "undefined") {
    throw new Error("FHE SDK requires browser environment");
  }

  const ethereumProvider =
    provider ||
    window.ethereum ||
    window.okxwallet?.provider ||
    window.okxwallet ||
    window.coinbaseWalletExtension;

  if (!ethereumProvider) {
    throw new Error("Ethereum provider not found. Please connect your wallet.");
  }

  const sdk = await loadSdk();
  if (!sdk) {
    throw new Error("FHE SDK not available");
  }

  await sdk.initSDK();

  const config = {
    ...sdk.SepoliaConfig,
    network: ethereumProvider,
  };

  fheInstance = await sdk.createInstance(config);
  return fheInstance;
};

const ensureHandlePayload = (result: any) => {
  const handles = result?.handles ?? (result?.handle ? [result.handle] : undefined);
  const proof = result?.inputProof ?? result?.proof;

  if (!handles?.length || !proof) {
    throw new Error("FHE encryption failed: missing handles or proof");
  }

  return { handles, proof };
};

export const encryptUint64Value = async (
  value: number | bigint,
  contractAddress: string,
  userAddress: string
) => {
  const fhe = await initializeFHE();
  const checksumContract = getAddress(contractAddress);
  const checksumUser = getAddress(userAddress);

  const input = fhe.createEncryptedInput(checksumContract, checksumUser);
  input.add64(typeof value === "bigint" ? Number(value) : value);

  const result = await input.encrypt();
  const { handles, proof } = ensureHandlePayload(result);

  return {
    handle: hexlify(handles[0]),
    proof: hexlify(proof),
  };
};

export const encryptUint32Value = async (
  value: number,
  contractAddress: string,
  userAddress: string
) => {
  const fhe = await initializeFHE();
  const checksumContract = getAddress(contractAddress);
  const checksumUser = getAddress(userAddress);

  const input = fhe.createEncryptedInput(checksumContract, checksumUser);
  input.add32(value);

  const result = await input.encrypt();
  const { handles, proof } = ensureHandlePayload(result);

  return {
    handle: hexlify(handles[0]),
    proof: hexlify(proof),
  };
};

export const encryptUint8Value = async (
  value: number,
  contractAddress: string,
  userAddress: string
) => {
  if (value < 0 || value > 255) {
    throw new Error("Value out of range for uint8 encryption");
  }

  const fhe = await initializeFHE();
  const checksumContract = getAddress(contractAddress);
  const checksumUser = getAddress(userAddress);

  const input = fhe.createEncryptedInput(checksumContract, checksumUser);
  input.add8(value);

  const result = await input.encrypt();
  const { handles, proof } = ensureHandlePayload(result);

  return {
    handle: hexlify(handles[0]),
    proof: hexlify(proof),
  };
};
