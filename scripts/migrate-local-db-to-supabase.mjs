import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const root = process.cwd();
const envPath = resolve(root, '.env.local');

try {
  const envText = readFileSync(envPath, 'utf8').replace(/^\uFEFF/, '');
  for (const line of envText.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || match[1] in process.env) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
} catch {
  throw new Error('Could not read .env.local. Run this migration from the project root.');
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) {
  throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.');
}

const source = JSON.parse(readFileSync(resolve(root, 'data/db.json'), 'utf8'));
const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function upsert(table, rows, label) {
  if (!rows.length) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`${label} import failed: ${error.message}`);
  console.log(`Imported ${rows.length} ${label}.`);
}

await upsert(
  'categories',
  (source.categories || []).map(({ id, name, slug, description, image }) => ({ id, name, slug, description, image })),
  'categories'
);

await upsert(
  'users',
  (source.users || []).map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    password_hash: user.passwordHash,
    role: user.role,
    created_at: user.createdAt,
  })),
  'users'
);

await upsert(
  'products',
  (source.products || []).map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    stock_quantity: product.stockQuantity,
    volume: product.volume,
    alcohol_percentage: product.alcoholPercentage ?? null,
    origin_country: product.originCountry ?? null,
    image_url: product.imageUrl,
    description: product.description,
    is_featured: Boolean(product.isFeatured),
    is_active: product.isActive,
    created_at: product.createdAt,
  })),
  'products'
);

await upsert(
  'orders',
  (source.orders || []).map((order) => ({
    id: order.id,
    order_number: order.orderNumber,
    customer_id: order.customerId || null,
    customer_name: order.customerName,
    customer_email: order.customerEmail,
    customer_phone: order.customerPhone,
    fulfillment_type: order.fulfillmentType,
    delivery_details: order.deliveryDetails || null,
    delivery_fee: order.deliveryFee,
    subtotal: order.subtotal,
    total_amount: order.totalAmount,
    payment_status: order.paymentStatus,
    payment_method: order.paymentMethod || null,
    paystack_reference: order.paystackReference || null,
    paystack_paid_at: order.paystackPaidAt || null,
    order_status: order.orderStatus,
    age_confirmed: order.ageConfirmed,
    cancellation_reason: order.cancellationReason || null,
    refunded_at: order.refundedAt || null,
    refunded_by: order.refundedBy || null,
    items: order.items || [],
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  })),
  'orders'
);

if (source.settings) {
  const settings = source.settings;
  await upsert(
    'store_settings',
    [{
      id: 'primary_store',
      store_name: settings.storeName,
      tagline: settings.tagline,
      address: settings.address,
      city: settings.city,
      country: settings.country,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      email: settings.email,
      min_order_age: settings.minOrderAge,
      business_hours: settings.businessHours || [],
      delivery_zones: settings.deliveryZones || [],
      announcement_banner: settings.announcementBanner || { enabled: false, text: '' },
      paystack_public_key: settings.paystackPublicKey || null,
    }],
    'store settings'
  );
}

console.log('Local JSON data migration to Supabase completed. Re-running this script safely updates the same IDs.');
