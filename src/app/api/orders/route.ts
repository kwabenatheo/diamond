import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder, getProductById, getStoreSettings } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { OrderItem } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const fulfillmentType = searchParams.get('fulfillmentType') || undefined;
    const customerIdParam = searchParams.get('customerId') || undefined;

    if (!user) {
      // If guest trying to query by customerId, allow only if passed or empty
      if (customerIdParam) {
        const orders = await getOrders({ customerId: customerIdParam, status, fulfillmentType });
        return NextResponse.json({ orders });
      }
      return NextResponse.json({ orders: [] });
    }

    if (user.role === 'customer') {
      const orders = await getOrders({ customerId: user.id, status, fulfillmentType });
      return NextResponse.json({ orders });
    }

    // Staff and Owner see all orders
    const orders = await getOrders({ status, fulfillmentType });
    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      fulfillmentType,
      deliveryDetails,
      items,
      ageConfirmed,
    } = body;

    // Strict 18+ age verification requirement
    if (!ageConfirmed) {
      return NextResponse.json(
        { error: 'You must confirm you are 18 years of age or older to purchase alcoholic beverages.' },
        { status: 400 }
      );
    }

    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: 'Please provide customer contact details.' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty. Please select products to order.' }, { status: 400 });
    }

    if (fulfillmentType === 'delivery') {
      if (!deliveryDetails || !deliveryDetails.address) {
        return NextResponse.json(
          { error: 'Delivery address is required for delivery orders.' },
          { status: 400 }
        );
      }
    }

    // Delivery is coordinated by staff with a courier; storefront does not calculate or charge zone pricing.
    const deliveryFee = 0;

    // Validate products and compute exact subtotal
    const validatedItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await getProductById(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product "${item.productId}" not found.` }, { status: 404 });
      }

      if (product.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name}. Only ${product.stockQuantity} available in inventory.`,
          },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        productName: product.name,
        productImage: product.imageUrl,
        volume: product.volume,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
      });
    }

    const totalAmount = subtotal + deliveryFee;

    const newOrder = await createOrder({
      customerId: user ? user.id : undefined,
      customerName,
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      fulfillmentType,
      deliveryDetails: fulfillmentType === 'delivery' ? deliveryDetails : undefined,
      deliveryFee,
      subtotal,
      totalAmount,
      paymentStatus: 'unpaid',
      orderStatus: 'pending',
      ageConfirmed: true,
      items: validatedItems,
    });

    return NextResponse.json({
      success: true,
      order: newOrder,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to place order.' }, { status: 500 });
  }
}
