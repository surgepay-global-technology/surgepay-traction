import crypto from 'crypto';

if (!process.env.ALCHEMY_SIGNING_KEY) {
  console.warn('ALCHEMY_SIGNING_KEY not set - webhook signature verification disabled');
}

export const ALCHEMY_WEBHOOK_SIGNING_KEY = process.env.ALCHEMY_SIGNING_KEY;

/**
 * Verifies Alchemy webhook signature
 * Alchemy uses HMAC SHA256 for webhook verification
 */
export function verifyAlchemySignature(
  payload: string,
  signature: string | null,
  signingKey?: string
): boolean {
  try {
    const key = signingKey || ALCHEMY_WEBHOOK_SIGNING_KEY;
    
    if (!key) {
      console.warn('No signing key provided - skipping verification');
      return true; // In development, you might want to skip verification
    }

    if (!signature) {
      console.error('No signature provided in request');
      return false;
    }

    // Alchemy sends signature in the 'x-alchemy-signature' header
    const expectedSignature = crypto
      .createHmac('sha256', key)
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

// Alchemy webhook event types
export enum AlchemyWebhookType {
  ADDRESS_ACTIVITY = 'ADDRESS_ACTIVITY',
  DROPPED_TRANSACTION = 'DROPPED_TRANSACTION',
  MINED_TRANSACTION = 'MINED_TRANSACTION',
  NFT_ACTIVITY = 'NFT_ACTIVITY',
  NFT_METADATA_UPDATE = 'NFT_METADATA_UPDATE',
}

export interface AlchemyWebhookEvent {
  webhookId: string;
  id: string;
  createdAt: string;
  type: AlchemyWebhookType;
  event: {
    network: string;
    activity: Activity[];
  };
}

export interface Activity {
  fromAddress: string;
  toAddress: string;
  blockNum: string;
  hash: string;
  value: number;
  asset: string;
  category: string;
  rawContract: {
    rawValue: string;
    address: string;
    decimals: number;
  };
}

export interface AddressActivityEvent {
  network: string;
  activity: Activity[];
}
