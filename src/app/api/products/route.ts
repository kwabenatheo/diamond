import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const onlyActive = searchParams.get('all') === 'true' ? false : true;

    const products = await getProducts({
      category,
      search,
      minPrice,
      maxPrice,
      onlyActive,
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized. Only the Shop Owner can create products.' }, { status: 403 });
    }

    const body = await req.json();
    const { name, category, price, stockQuantity, volume, imageUrl, description, isFeatured, isActive } = body;

    if (!name || !category || price === undefined || stockQuantity === undefined) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
    }

    const newProduct = await createProduct({
      name,
      category,
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      volume: volume || '750ml',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=800&q=80',
      description: description || '',
      isFeatured: Boolean(isFeatured),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
