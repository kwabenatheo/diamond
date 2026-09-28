import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, getStoreSettings } from '@/lib/db';

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

    const settings = await getStoreSettings();
    const reference = `DJ_${Date.now()}_${order.orderNumber.replace(/[^a-zA-Z0-9]/g, '')}`;

    return NextResponse.json({
      success: true,
      data: {
        reference,
        amount: Math.round(order.totalAmount * 100), // in pesewas (100 pesewas = 1 GHS)
        currency: 'GHS',
        email: order.customerEmail,
        phone: order.customerPhone,
        publicKey: settings.paystackPublicKey || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder_diamondjay',
        channels: ['card', 'mobile_money'],
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          fulfillmentType: order.fulfillmentType,
        },
      },
    });
  } catch (error: any) {
    console.error('Paystack initialization error:', error);
    return NextResponse.json({ error: error.message || 'Payment initialization failed' }, { status: 500 });
  }
}
