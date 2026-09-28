import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || (user.role !== 'staff' && user.role !== 'owner')) {
      return NextResponse.json({ error: 'Unauthorized. Staff or owner access required.' }, { status: 403 });
    }

    const { id } = await params;
    const updates = await req.json();

    const updated = await updateProduct(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(req);
    // Only the Shop Owner can permanently delete products from inventory
    if (!user || user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Unauthorized. Only the Shop Owner can permanently delete products from inventory.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const deleted = await deleteProduct(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Product removed' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting product' }, { status: 500 });
  }
}
