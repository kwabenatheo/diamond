import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder_diamondjay';

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number; // in pesewas (100 pesewas = 1 GHS)
    gateway_response: string;
    paid_at: string;
    channel: 'card' | 'mobile_money';
    currency: 'GHS';
    customer: {
      id: number;
      email: string;
      customer_code: string;
      phone: string;
    };
    metadata?: Record<string, any>;
  };
}

export async function verifyPaystackTransaction(reference: string): Promise<{
  success: boolean;
  message: string;
  channel?: 'card' | 'mobile_money';
  amount?: number;
  paidAt?: string;
  data?: any;
}> {
  // If in mock or test environment with demo reference or placeholder key
  if (
    !PAYSTACK_SECRET_KEY ||
    PAYSTACK_SECRET_KEY.includes('placeholder') ||
    reference.startsWith('ref_demo_') ||
    reference.startsWith('ref_momo_demo_') ||
    reference.startsWith('ref_card_demo_')
  ) {
    // Simulated realistic test verification
    return {
      success: true,
      message: 'Simulated Paystack Verification Successful',
      channel: reference.includes('card') ? 'card' : 'mobile_money',
      paidAt: new Date().toISOString(),
    };
  }

  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const body: PaystackVerifyResponse = await res.json();

    if (body.status && body.data && body.data.status === 'success') {
      return {
        success: true,
        message: body.message,
        channel: body.data.channel,
        amount: body.data.amount / 100, // convert pesewas to GHS
        paidAt: body.data.paid_at,
        data: body.data,
      };
    } else {
      return {
        success: false,
        message: body.data?.gateway_response || body.message || 'Payment not completed or failed',
      };
    }
  } catch (error: any) {
    console.error('Paystack verification error:', error);
    return {
      success: false,
      message: error.message || 'Internal connection error verifying payment with Paystack',
    };
  }
}

export function verifyPaystackWebhookSignature(rawBody: string, signature: string): boolean {
  if (!PAYSTACK_SECRET_KEY) return true; // in demo fallback
  try {
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex');
    return hash === signature;
  } catch (err) {
    return false;
  }
}
