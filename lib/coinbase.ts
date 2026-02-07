import crypto from 'crypto';

// Coinbase Configuration
export const COINBASE_API_KEY_ID = process.env.COINBASE_API_KEY_ID;
export const COINBASE_SECRET_KEY = process.env.COINBASE_SECRET_KEY;
export const COINBASE_AUTH_TOKEN = process.env.COINBASE_AUTH_TOKEN;
export const COINBASE_SERVER_WALLET = process.env.COINBASE_SERVER_WALLET;
export const COINBASE_WEBHOOK_SIGNING_KEY = process.env.COINBASE_WEBHOOK_SIGNING_KEY;

if (!COINBASE_AUTH_TOKEN) {
  console.warn('COINBASE_AUTH_TOKEN not set - Coinbase operations may be limited');
}

export interface CoinbaseConfig {
  authToken: string;
  apiKeyId?: string;
  secretKey?: string;
  serverWallet?: string;
  apiUrl: string;
}

export const coinbaseConfig: CoinbaseConfig = {
  authToken: COINBASE_AUTH_TOKEN || '',
  apiKeyId: COINBASE_API_KEY_ID,
  secretKey: COINBASE_SECRET_KEY,
  serverWallet: COINBASE_SERVER_WALLET,
  apiUrl: 'https://api.coinbase.com/v2',
};

// Helper function to generate JWT for Coinbase API calls (if using API keys)
function generateJWT(): string | null {
  if (!COINBASE_API_KEY_ID || !COINBASE_SECRET_KEY) {
    return null;
  }

  // Create JWT token for Coinbase API authentication
  // Note: You may need to install 'jsonwebtoken' package for production
  const header = Buffer.from(JSON.stringify({ alg: 'ES256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: COINBASE_API_KEY_ID,
      iss: 'coinbase-cloud',
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 120,
    })
  ).toString('base64url');

  // In production, properly sign with COINBASE_SECRET_KEY
  return `${header}.${payload}`;
}

// Helper function to make Coinbase API calls
export async function coinbaseApiCall(endpoint: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Use Bearer token if available
  if (COINBASE_AUTH_TOKEN) {
    headers['Authorization'] = `Bearer ${COINBASE_AUTH_TOKEN}`;
  }

  const response = await fetch(`${coinbaseConfig.apiUrl}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Coinbase API error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Verify Coinbase webhook signature
export function verifyCoinbaseWebhookSignature(
  payload: string,
  signature: string | null
): boolean {
  try {
    if (!COINBASE_WEBHOOK_SIGNING_KEY || !signature) {
      console.warn('Missing signing key or signature');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', COINBASE_WEBHOOK_SIGNING_KEY)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return false;
  }
}
