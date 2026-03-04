export function formatCurrency(amount: number, currency: string): string {
  if (currency === 'NGN') {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`;
}

export function parseEther(value: string, decimals: number = 18): string {
  const num = parseFloat(value) / Math.pow(10, decimals);
  return num.toFixed(4);
}

/**
 * Safe fetch wrapper that handles non-JSON responses gracefully.
 * Prevents "Unexpected token '<'" errors when the server returns HTML error pages.
 */
export async function safeFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string }> {
  const response = await fetch(url, options);

  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const text = await response.text();
    const preview = text.substring(0, 120);
    if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
      throw new Error(
        `Server returned an HTML error page (status ${response.status}). ` +
        `The API route may not exist or the server encountered an error.`
      );
    }
    throw new Error(`Unexpected response (status ${response.status}): ${preview}`);
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || `Request failed with status ${response.status}`);
  }

  return result;
}
