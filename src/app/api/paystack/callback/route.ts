import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, markOrderPaid } from '@/lib/db';
import { verifyPaystackTransaction } from '@/lib/paystack';

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get('reference');
  const failureUrl = new URL('/checkout?payment=failed', req.url);

  if (!reference) return NextResponse.redirect(failureUrl);

  try {
    const verification = await verifyPaystackTransaction(reference);
    if (!verification.success || verification.reference !== reference || verification.currency !== 'GHS') {
      return NextResponse.redirect(failureUrl);
    }

    const orderId = verification.metadata?.orderId;
    if (typeof orderId !== 'string' || !orderId) return NextResponse.redirect(failureUrl);

    const order = await getOrderById(orderId);
    if (!order || Math.round(order.totalAmount * 100) !== verification.amount) {
      return NextResponse.redirect(failureUrl);
    }

    const paymentMethod = verification.channel === 'card' ? 'paystack_card' : 'paystack_momo';
    const paidOrder = await markOrderPaid(order.id, reference, paymentMethod);
    if (!paidOrder) return NextResponse.redirect(failureUrl);

    return NextResponse.redirect(new URL(`/order-confirmation/${paidOrder.id}`, req.url));
  } catch (error) {
    console.error('Paystack callback processing failed:', error);
    return NextResponse.redirect(failureUrl);
  }
}
