import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus, refundOrder } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Role check: customer can only view their own order
    const user = await getAuthenticatedUser(req);
    if (user && user.role === 'customer' && order.customerId && order.customerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to view this order' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching order' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || (user.role !== 'staff' && user.role !== 'owner')) {
      return NextResponse.json({ error: 'Unauthorized. Staff or owner access required.' }, { status: 403 });
    }

    const { id } = await params;
    const { orderStatus, cancellationReason } = await req.json();

    // Staff cannot cancel or issue refunds (Owner only)
    if (orderStatus === 'cancelled' && user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Staff members cannot cancel orders. Please flag this order for the Shop Owner.' },
        { status: 403 }
      );
    }

    const validStatuses = ['pending', 'confirmed', 'out_for_delivery', 'ready_for_pickup', 'completed', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return NextResponse.json({ error: 'Invalid order status specified.' }, { status: 400 });
    }

    const updated = await updateOrderStatus(id, orderStatus, cancellationReason);
    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating order' }, { status: 500 });
  }
}

// POST for Owner-only Refund
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Access denied. Only the Shop Owner can issue refunds and cancellations.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { reason } = await req.json();

    const refunded = await refundOrder(id, reason || 'Customer requested refund', user.id);
    if (!refunded) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Order refunded and inventory restocked successfully.',
      order: refunded,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error processing refund' }, { status: 500 });
  }
}
