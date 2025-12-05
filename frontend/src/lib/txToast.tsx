import { toast } from "sonner";
import { ExternalLink, CheckCircle, XCircle, Loader2 } from "lucide-react";

// Sepolia Etherscan explorer URL
const EXPLORER_URL = "https://sepolia.etherscan.io";

/**
 * Get explorer URL for a transaction hash
 */
export const getExplorerTxUrl = (txHash: string): string => {
  return `${EXPLORER_URL}/tx/${txHash}`;
};

/**
 * Truncate transaction hash for display
 */
export const truncateHash = (hash: string): string => {
  if (!hash) return "";
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

/**
 * Show loading toast for pending transaction
 */
export const txPending = (message: string, txHash?: string): string | number => {
  return toast.loading(message, {
    description: txHash ? (
      <a
        href={getExplorerTxUrl(txHash)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-blue-500 hover:text-blue-600 hover:underline mt-1"
        onClick={(e) => e.stopPropagation()}
      >
        <span>Tx: {truncateHash(txHash)}</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    ) : undefined,
    duration: Infinity,
  });
};

/**
 * Show success toast for confirmed transaction
 */
export const txSuccess = (
  message: string,
  txHash: string,
  toastId?: string | number
): void => {
  const content = {
    description: (
      <a
        href={getExplorerTxUrl(txHash)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:underline mt-1"
        onClick={(e) => e.stopPropagation()}
      >
        <CheckCircle className="w-3 h-3" />
        <span>View transaction: {truncateHash(txHash)}</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    ),
    duration: 5000,
  };

  if (toastId) {
    toast.success(message, { id: toastId, ...content });
  } else {
    toast.success(message, content);
  }
};

/**
 * Show error toast for failed transaction
 */
export const txError = (
  message: string,
  error?: Error | string,
  txHash?: string,
  toastId?: string | number
): void => {
  const errorMessage = typeof error === "string" ? error : error?.message;

  const content = {
    description: (
      <div className="mt-1">
        {errorMessage && (
          <p className="text-red-500 text-xs mb-1 line-clamp-2">{errorMessage}</p>
        )}
        {txHash && (
          <a
            href={getExplorerTxUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-red-500 hover:text-red-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <XCircle className="w-3 h-3" />
            <span>View failed tx: {truncateHash(txHash)}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    ),
    duration: 8000,
  };

  if (toastId) {
    toast.error(message, { id: toastId, ...content });
  } else {
    toast.error(message, content);
  }
};

/**
 * Dismiss a toast by ID
 */
export const txDismiss = (toastId?: string | number): void => {
  if (toastId) {
    toast.dismiss(toastId);
  }
};

/**
 * Helper to execute a transaction with automatic toast notifications
 */
export const withTxNotification = async <T,>(
  txPromise: Promise<{ hash: string; wait: () => Promise<T> }>,
  options: {
    pending: string;
    success: string;
    error: string;
  }
): Promise<{ receipt: T; hash: string } | null> => {
  let toastId: string | number | undefined;
  let txHash: string | undefined;

  try {
    // Show pending toast
    toastId = txPending(options.pending);

    // Get transaction
    const tx = await txPromise;
    txHash = tx.hash;

    // Update toast with hash
    toast.loading(options.pending, {
      id: toastId,
      description: (
        <a
          href={getExplorerTxUrl(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-500 hover:text-blue-600 hover:underline mt-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Confirming: {truncateHash(txHash)}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      ),
    });

    // Wait for confirmation
    const receipt = await tx.wait();

    // Show success
    txSuccess(options.success, txHash, toastId);

    return { receipt, hash: txHash };
  } catch (error) {
    // Show error
    txError(options.error, error as Error, txHash, toastId);
    return null;
  }
};
