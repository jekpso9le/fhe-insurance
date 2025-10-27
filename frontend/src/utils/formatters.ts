/**
 * Format date to readable string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date with time
 */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format amount to USD
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Format address to short version
 */
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Calculate months between dates
 */
export const monthsBetween = (start: number, end: number): number => {
  const startDate = new Date(start * 1000);
  const endDate = new Date(end * 1000);
  return (
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth())
  );
};

/**
 * Get status color for badges
 */
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    Active: 'success',
    Pending: 'processing',
    'Under Review': 'processing',
    Approved: 'success',
    Rejected: 'error',
    Paid: 'success',
    Suspended: 'warning',
    Cancelled: 'default',
    Expired: 'default',
  };
  return statusColors[status] || 'default';
};
