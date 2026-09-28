import { NextRequest, NextResponse } from 'next/server';
import { getOrders } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    // Strict Owner check: Staff cannot view or export financial reports
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized. Owner access required.' }, { status: 403 });
    }

    const orders = await getOrders();

    // Generate CSV string
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Fulfillment',
      'Delivery Zone',
      'Subtotal (GHS)',
      'Delivery Fee (GHS)',
      'Total Amount (GHS)',
      'Payment Status',
      'Payment Method',
      'Paystack Reference',
      'Order Status',
      'Items Summary',
    ];

    const rows = orders.map((o) => {
      const itemsSummary = o.items
        .map((i) => `${i.productName} (${i.volume}) x${i.quantity}`)
        .join('; ');

      return [
        `"${o.orderNumber}"`,
        `"${new Date(o.createdAt).toLocaleString()}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${o.customerEmail}"`,
        `"${o.customerPhone}"`,
        `"${o.fulfillmentType}"`,
        `"${o.deliveryDetails?.zone || 'N/A'}"`,
        o.subtotal.toFixed(2),
        o.deliveryFee.toFixed(2),
        o.totalAmount.toFixed(2),
        `"${o.paymentStatus}"`,
        `"${o.paymentMethod || 'N/A'}"`,
        `"${o.paystackReference || 'N/A'}"`,
        `"${o.orderStatus}"`,
        `"${itemsSummary.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="diamond_jay_sales_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to export CSV' }, { status: 500 });
  }
}
