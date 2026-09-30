import { randomUUID } from 'crypto';
import { Category, Order, Product, Role, StoreSettings, User } from './types';
import { getSupabaseAdmin } from './supabaseAdmin';
import { notifyDispatchRecipients } from './whatsappServer';

type Row = Record<string, any>;

function ensureNoError(error: { message: string } | null, action: string): void {
  if (error) throw new Error(`Supabase ${action} failed: ${error.message}`);
}

function mapProduct(row: Row): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    stockQuantity: Number(row.stock_quantity),
    volume: row.volume,
    alcoholPercentage: row.alcohol_percentage == null ? undefined : Number(row.alcohol_percentage),
    originCountry: row.origin_country || undefined,
    imageUrl: row.image_url,
    description: row.description || '',
    isFeatured: Boolean(row.is_featured),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
  };
}

function mapCategory(row: Row): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    image: row.image || undefined,
  };
}

function mapUser(row: Row): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
  };
}

function mapOrder(row: Row): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id || undefined,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    fulfillmentType: row.fulfillment_type,
    deliveryDetails: row.delivery_details || undefined,
    deliveryFee: Number(row.delivery_fee),
    subtotal: Number(row.subtotal),
    totalAmount: Number(row.total_amount),
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method || undefined,
    paystackReference: row.paystack_reference || undefined,
    paystackPaidAt: row.paystack_paid_at || undefined,
    orderStatus: row.order_status,
    ageConfirmed: Boolean(row.age_confirmed),
    cancellationReason: row.cancellation_reason || undefined,
    refundedAt: row.refunded_at || undefined,
    refundedBy: row.refunded_by || undefined,
    items: row.items || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSettings(row: Row): StoreSettings {
  return {
    storeName: row.store_name,
    tagline: row.tagline || '',
    address: row.address,
    city: row.city,
    country: row.country,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    minOrderAge: Number(row.min_order_age || 18),
    businessHours: row.business_hours || [],
    deliveryZones: row.delivery_zones || [],
    announcementBanner: row.announcement_banner || { enabled: false, text: '' },
    paystackPublicKey: row.paystack_public_key || undefined,
  };
}

function productToRow(product: Omit<Product, 'id' | 'createdAt'> | Product): Row {
  return {
    id: 'id' in product ? product.id : undefined,
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
  };
}

function userToRow(user: Omit<User, 'createdAt'> | User): Row {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    password_hash: user.passwordHash,
    role: user.role,
  };
}

// ---------------- PRODUCTS ----------------
export async function getProducts(options?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  onlyActive?: boolean;
}): Promise<Product[]> {
  let query = getSupabaseAdmin().from('products').select('*').order('created_at', { ascending: false });
  if (options?.onlyActive !== false) query = query.eq('is_active', true);
  if (options?.category && options.category !== 'all') query = query.ilike('category', options.category);
  if (options?.minPrice !== undefined) query = query.gte('price', options.minPrice);
  if (options?.maxPrice !== undefined) query = query.lte('price', options.maxPrice);

  const { data, error } = await query;
  ensureNoError(error, 'product lookup');
  let products = (data || []).map(mapProduct);
  if (options?.search) {
    const term = options.search.toLowerCase();
    products = products.filter((product) =>
      [product.name, product.description, product.category].some((value) => value.toLowerCase().includes(term))
    );
  }
  return products;
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await getSupabaseAdmin().from('products').select('*').eq('id', id).maybeSingle();
  ensureNoError(error, 'product lookup');
  return data ? mapProduct(data) : null;
}

export async function createProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  const row = {
    ...productToRow(productData),
    id: `prod_${randomUUID()}`,
  };
  const { data, error } = await getSupabaseAdmin().from('products').insert(row).select('*').single();
  ensureNoError(error, 'product creation');
  return mapProduct(data);
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const row: Row = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.category !== undefined) row.category = updates.category;
  if (updates.price !== undefined) row.price = updates.price;
  if (updates.stockQuantity !== undefined) row.stock_quantity = updates.stockQuantity;
  if (updates.volume !== undefined) row.volume = updates.volume;
  if (updates.alcoholPercentage !== undefined) row.alcohol_percentage = updates.alcoholPercentage;
  if (updates.originCountry !== undefined) row.origin_country = updates.originCountry;
  if (updates.imageUrl !== undefined) row.image_url = updates.imageUrl;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.isFeatured !== undefined) row.is_featured = updates.isFeatured;
  if (updates.isActive !== undefined) row.is_active = updates.isActive;

  const { data, error } = await getSupabaseAdmin()
    .from('products')
    .update(row)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  ensureNoError(error, 'product update');
  return data ? mapProduct(data) : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin().from('products').delete().eq('id', id).select('id').maybeSingle();
  ensureNoError(error, 'product deletion');
  return Boolean(data);
}

// ---------------- CATEGORIES ----------------
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await getSupabaseAdmin().from('categories').select('*').order('name');
  ensureNoError(error, 'category lookup');
  return (data || []).map(mapCategory);
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  const row: Row = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.slug !== undefined) row.slug = updates.slug;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.image !== undefined) row.image = updates.image;
  const { data, error } = await getSupabaseAdmin()
    .from('categories')
    .update(row)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  ensureNoError(error, 'category update');
  return data ? mapCategory(data) : null;
}

// ---------------- USERS ----------------
export async function getUsers(role?: Role): Promise<Omit<User, 'passwordHash'>[]> {
  let query = getSupabaseAdmin().from('users').select('id, name, email, phone, role, created_at');
  if (role) query = query.eq('role', role);
  const { data, error } = await query.order('created_at', { ascending: true });
  ensureNoError(error, 'user lookup');
  return (data || []).map((row: Row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    createdAt: row.created_at,
  }));
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await getSupabaseAdmin().from('users').select('*').eq('id', id).maybeSingle();
  ensureNoError(error, 'user lookup');
  return data ? mapUser(data) : null;
}

export async function getUserByEmailOrPhone(identifier: string): Promise<User | null> {
  const clean = identifier.trim();
  const isEmail = clean.includes('@');
  if (isEmail) {
    const { data, error } = await getSupabaseAdmin().from('users').select('*').ilike('email', clean).maybeSingle();
    ensureNoError(error, 'user lookup');
    return data ? mapUser(data) : null;
  }

  const digits = clean.replace(/\D/g, '');
  if (digits.length < 7) return null;
  const suffix = digits.length >= 9 ? digits.slice(-9) : digits;
  const { data, error } = await getSupabaseAdmin()
    .from('users')
    .select('*')
    .ilike('phone', `%${suffix}%`)
    .limit(1)
    .maybeSingle();
  ensureNoError(error, 'user lookup');
  return data ? mapUser(data) : null;
}

export async function createUser(userData: {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: Role;
}): Promise<User> {
  if (userData.role === 'owner') {
    const { count, error: countError } = await getSupabaseAdmin()
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'owner');
    ensureNoError(countError, 'owner check');
    if ((count || 0) > 0) throw new Error('Only one Shop Owner account is permitted for Diamond Jay Enterprise.');
  }

  const newUser: User = {
    id: `usr_${userData.role}_${randomUUID()}`,
    ...userData,
    createdAt: new Date().toISOString(),
  };
  const { data, error } = await getSupabaseAdmin().from('users').insert(userToRow(newUser)).select('*').single();
  ensureNoError(error, 'user creation');
  return mapUser(data);
}

export async function updateUser(
  id: string,
  updates: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<User | null> {
  const current = await getUserById(id);
  if (!current) return null;
  if (updates.role === 'owner' && current.role !== 'owner') {
    throw new Error('Cannot assign Shop Owner role. Diamond Jay Enterprise has a single owner account.');
  }
  const row: Row = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.email !== undefined) row.email = updates.email;
  if (updates.phone !== undefined) row.phone = updates.phone;
  if (updates.passwordHash !== undefined) row.password_hash = updates.passwordHash;
  if (updates.role !== undefined) row.role = updates.role;
  const { data, error } = await getSupabaseAdmin()
    .from('users')
    .update(row)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  ensureNoError(error, 'user update');
  return data ? mapUser(data) : null;
}

export async function deleteUser(id: string): Promise<boolean> {
  const target = await getUserById(id);
  if (!target) return false;
  if (target.role === 'owner') throw new Error('The primary Shop Owner account cannot be deleted.');
  const { data, error } = await getSupabaseAdmin().from('users').delete().eq('id', id).select('id').maybeSingle();
  ensureNoError(error, 'user deletion');
  return Boolean(data);
}

// ---------------- ORDERS ----------------
export async function getOrders(options?: {
  customerId?: string;
  status?: string;
  fulfillmentType?: string;
}): Promise<Order[]> {
  let query = getSupabaseAdmin().from('orders').select('*').order('created_at', { ascending: false });
  if (options?.customerId) query = query.eq('customer_id', options.customerId);
  if (options?.status && options.status !== 'all') query = query.eq('order_status', options.status);
  if (options?.fulfillmentType && options.fulfillmentType !== 'all') {
    query = query.eq('fulfillment_type', options.fulfillmentType);
  }
  const { data, error } = await query;
  ensureNoError(error, 'order lookup');
  return (data || []).map(mapOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = getSupabaseAdmin();
  const { data: byId, error: idError } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
  ensureNoError(idError, 'order lookup');
  if (byId) return mapOrder(byId);
  const { data: byNumber, error: numberError } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', id)
    .maybeSingle();
  ensureNoError(numberError, 'order lookup');
  return byNumber ? mapOrder(byNumber) : null;
}

export async function createOrder(
  orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>
): Promise<Order> {
  const now = new Date().toISOString();
  const newOrder: Order = {
    ...orderData,
    id: `ord_${randomUUID()}`,
    orderNumber: `DJ-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
    createdAt: now,
    updatedAt: now,
  };
  const { data, error } = await getSupabaseAdmin()
    .from('orders')
    .insert({
      id: newOrder.id,
      order_number: newOrder.orderNumber,
      customer_id: newOrder.customerId || null,
      customer_name: newOrder.customerName,
      customer_email: newOrder.customerEmail,
      customer_phone: newOrder.customerPhone,
      fulfillment_type: newOrder.fulfillmentType,
      delivery_details: newOrder.deliveryDetails || null,
      delivery_fee: newOrder.deliveryFee,
      subtotal: newOrder.subtotal,
      total_amount: newOrder.totalAmount,
      payment_status: newOrder.paymentStatus,
      payment_method: newOrder.paymentMethod || null,
      order_status: newOrder.orderStatus,
      age_confirmed: newOrder.ageConfirmed,
      items: newOrder.items,
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single();
  ensureNoError(error, 'order creation');
  return mapOrder(data);
}

export async function updateOrderStatus(
  id: string,
  orderStatus: Order['orderStatus'],
  cancellationReason?: string
): Promise<Order | null> {
  const current = await getOrderById(id);
  if (!current) return null;
  const { data, error } = await getSupabaseAdmin()
    .from('orders')
    .update({
      order_status: orderStatus,
      cancellation_reason: cancellationReason ?? current.cancellationReason ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', current.id)
    .select('*')
    .maybeSingle();
  ensureNoError(error, 'order update');
  return data ? mapOrder(data) : null;
}

export async function markOrderPaid(
  idOrRef: string,
  paystackReference: string,
  paymentMethod: Order['paymentMethod'] = 'paystack_momo'
): Promise<Order | null> {
  const { data, error } = await getSupabaseAdmin().rpc('mark_order_paid', {
    p_order_id: idOrRef,
    p_paystack_reference: paystackReference,
    p_payment_method: paymentMethod,
  });
  ensureNoError(error, 'payment confirmation');
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  const order = mapOrder(row);
  await notifyDispatchRecipients(order);
  return order;
}

export async function refundOrder(id: string, reason: string, byUserId: string): Promise<Order | null> {
  const current = await getOrderById(id);
  if (!current) return null;
  const { data, error } = await getSupabaseAdmin().rpc('refund_order', {
    p_order_id: current.id,
    p_reason: reason,
    p_by_user_id: byUserId,
  });
  ensureNoError(error, 'order refund');
  const row = Array.isArray(data) ? data[0] : data;
  return row ? mapOrder(row) : null;
}

// ---------------- STORE SETTINGS ----------------
export async function getStoreSettings(): Promise<StoreSettings> {
  const { data, error } = await getSupabaseAdmin()
    .from('store_settings')
    .select('*')
    .eq('id', 'primary_store')
    .maybeSingle();
  ensureNoError(error, 'store settings lookup');
  if (!data) throw new Error('Store settings are missing in Supabase. Run the Supabase schema/seed SQL.');
  return mapSettings(data);
}

export async function updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getStoreSettings();
  const merged = { ...current, ...updates };
  const { data, error } = await getSupabaseAdmin()
    .from('store_settings')
    .update({
      store_name: merged.storeName,
      tagline: merged.tagline,
      address: merged.address,
      city: merged.city,
      country: merged.country,
      phone: merged.phone,
      whatsapp: merged.whatsapp,
      email: merged.email,
      min_order_age: merged.minOrderAge,
      business_hours: merged.businessHours,
      delivery_zones: merged.deliveryZones,
      announcement_banner: merged.announcementBanner,
      paystack_public_key: merged.paystackPublicKey || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'primary_store')
    .select('*')
    .single();
  ensureNoError(error, 'store settings update');
  return mapSettings(data);
}

// ---------------- OWNER SALES ANALYTICS ----------------
export async function getSalesAnalytics() {
  const [orders, products] = await Promise.all([getOrders(), getProducts({ onlyActive: false })]);
  const paidOrders = orders.filter((order) => order.paymentStatus === 'paid');
  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = paidOrders.length;
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();

  for (const order of paidOrders) {
    for (const item of order.items) {
      const sales = productSales.get(item.productId) || { name: item.productName, quantity: 0, revenue: 0 };
      sales.quantity += item.quantity;
      sales.revenue += item.totalPrice;
      productSales.set(item.productId, sales);
    }
  }

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
    topProducts: Array.from(productSales.entries())
      .map(([id, sales]) => ({ id, ...sales }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
    deliveryCount: paidOrders.filter((order) => order.fulfillmentType === 'delivery').length,
    pickupCount: paidOrders.filter((order) => order.fulfillmentType === 'pickup').length,
    allOrdersCount: orders.length,
    pendingOrdersCount: orders.filter(
      (order) => order.orderStatus === 'pending' || (order.paymentStatus === 'paid' && order.orderStatus === 'confirmed')
    ).length,
    lowStockProducts: products.filter((product) => product.stockQuantity < 15),
  };
}
