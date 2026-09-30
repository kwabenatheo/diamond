import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getOrderById } from '@/lib/db';
import { initializePaystackTransaction } from '@/lib/paystack';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Order has already been paid.' }, { status: 400 });
    }

    if (order.paymentStatus !== 'unpaid') {
      return NextResponse.json({ error: 'This order is not awaiting payment.' }, { status: 400 });
    }

    const reference = `DJ_${Date.now()}_${randomUUID().replace(/-/g, '')}`;
    const transaction = await initializePaystackTransaction({
      email: order.customerEmail,
      phone: order.customerPhone,
      amount: Math.round(order.totalAmount * 100),
      reference,
      callbackUrl: `${new URL(req.url).origin}/api/paystack/callback`,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        fulfillmentType: order.fulfillmentType,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        authorizationUrl: transaction.authorization_url,
        reference: transaction.reference,
      },
    });
  } catch (error: any) {
    console.error('Paystack initialization error:', error);
    return NextResponse.json({ error: error.message || 'Payment initialization failed' }, { status: 500 });
  }
}
