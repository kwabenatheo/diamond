import crypto from 'crypto';

function getPaystackSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key || !/^sk_(test|live)_/.test(key)) {
    throw new Error('Paystack is not configured. Set PAYSTACK_SECRET_KEY to your Paystack test or live secret key.');
  }
  return key;
}

interface PaystackTransaction {
  id: number;
  status: 'success' | 'failed' | 'abandoned';
  reference: string;
  amount: number;
  gateway_response: string;
  paid_at: string;
  channel: string;
  currency: string;
  customer: {
    id: number;
    email: string;
    customer_code: string;
    phone: string;
  };
  metadata?: Record<string, unknown>;
}

interface PaystackApiResponse<T> {
  status: boolean;
  message: string;
  data?: T;
}

export async function initializePaystackTransaction(input: {
  email: string;
  amount: number;
  phone: string;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}) {
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getPaystackSecretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amount,
      currency: 'GHS',
      reference: input.reference,
      callback_url: input.callbackUrl,
      channels: ['card', 'mobile_money'],
      metadata: input.metadata,
      ...(input.phone ? { phone: input.phone } : {}),
    }),
    cache: 'no-store',
  });
  const result = (await response.json()) as PaystackApiResponse<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }>;

  if (!response.ok || !result.status || !result.data?.authorization_url) {
    throw new Error(result.message || 'Paystack could not initialize this transaction.');
  }
  return result.data;
}

export async function verifyPaystackTransaction(reference: string): Promise<{
  success: boolean;
  message: string;
  channel?: string;
  amount?: number;
  currency?: string;
  paidAt?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
}> {
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getPaystackSecretKey()}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );
    const result = (await response.json()) as PaystackApiResponse<PaystackTransaction>;
    const transaction = result.data;

    if (!response.ok || !result.status || !transaction) {
      return { success: false, message: result.message || 'Paystack could not verify this transaction.' };
    }
    if (transaction.status !== 'success') {
      return {
        success: false,
        message: transaction.gateway_response || `Payment status: ${transaction.status}`,
      };
    }

    return {
      success: true,
      message: result.message,
      channel: transaction.channel,
      amount: transaction.amount,
      currency: transaction.currency,
      paidAt: transaction.paid_at,
      reference: transaction.reference,
      metadata: transaction.metadata,
    };
  } catch (error) {
    console.error('Paystack verification error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Internal connection error verifying payment with Paystack.',
    };
  }
}

export function verifyPaystackWebhookSignature(rawBody: string, signature: string): boolean {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key || !signature) return false;
  try {
    const expected = crypto.createHmac('sha512', key).update(rawBody).digest('hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    const signatureBuffer = Buffer.from(signature, 'hex');
    return expectedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch {
    return false;
  }
}
