import { NextRequest, NextResponse } from 'next/server';
import { markOrderPaid } from '@/lib/db';
import { verifyPaystackWebhookSignature } from '@/lib/paystack';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-paystack-signature') || '';
    const rawBody = await req.text();

    const isValid = verifyPaystackWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === 'charge.success') {
      const { reference, channel, metadata } = payload.data;
      const orderId = metadata?.orderId;

      if (orderId && reference) {
        await markOrderPaid(
          orderId,
          reference,
          channel === 'card' ? 'paystack_card' : 'paystack_momo'
        );
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
