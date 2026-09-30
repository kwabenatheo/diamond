import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, markOrderPaid } from '@/lib/db';
import { verifyPaystackTransaction } from '@/lib/paystack';

export async function POST(req: NextRequest) {
  try {
    const { reference, orderId } = await req.json();

    if (!reference || !orderId) {
      return NextResponse.json({ error: 'Payment reference and Order ID are required.' }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Server-side verification with Paystack API
    const verifyResult = await verifyPaystackTransaction(reference);

    if (!verifyResult.success) {
      return NextResponse.json(
        {
          error: verifyResult.message || 'Payment verification failed at Paystack. Order has not been marked as paid.',
        },
        { status: 400 }
      );
    }

    if (
      verifyResult.reference !== reference ||
      verifyResult.metadata?.orderId !== order.id ||
      verifyResult.currency !== 'GHS' ||
      verifyResult.amount !== Math.round(order.totalAmount * 100)
    ) {
      return NextResponse.json(
        { error: 'The verified Paystack payment does not match this order amount, currency, or reference.' },
        { status: 400 }
      );
    }

    // Mark order as paid, update orderStatus to 'confirmed', and deduct stock
    const updatedOrder = await markOrderPaid(
      order.id,
      reference,
      verifyResult.channel === 'card' ? 'paystack_card' : 'paystack_momo'
    );

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully. Order confirmed!',
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Paystack verification handler error:', error);
    return NextResponse.json({ error: error.message || 'Internal error during payment verification.' }, { status: 500 });
  }
}
