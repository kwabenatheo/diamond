import fs from 'fs';
import path from 'path';
import { User, Product, Category, Order, StoreSettings, Role } from './types';
import {
  SEED_USERS,
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_STORE_SETTINGS,
} from './seedData';
import { supabase } from './supabase';
import { buildWhatsAppOrderLink } from '@/lib/whatsapp';

interface DatabaseSchema {
  users: User[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  settings: StoreSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure database directory and file exist
function getInitialData(): DatabaseSchema {
  const sampleOrders: Order[] = [
    {
      id: 'ord_demo_101',
      orderNumber: 'DJ-2026-1001',
      customerId: 'usr_customer_1',
      customerName: 'Akosua Serwaa',
      customerEmail: 'customer@diamondjay.com',
      customerPhone: '+233241000003',
      fulfillmentType: 'delivery',
      deliveryDetails: {
        recipientName: 'Akosua Serwaa',
        phone: '+233241000003',
        address: 'House 14, Ring Road Central',
        zone: 'Accra Central & Surroundings',
        deliveryNotes: 'Leave with security guard if not answering phone',
      },
      deliveryFee: 25,
      subtotal: 900,
      totalAmount: 925,
      paymentStatus: 'paid',
      paymentMethod: 'paystack_momo',
      paystackReference: 'ref_momo_demo_1001',
      paystackPaidAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      orderStatus: 'completed',
      ageConfirmed: true,
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      items: [
        {
          id: 'item_101_1',
          productId: 'prod_jw_black',
          productName: 'Johnnie Walker Black Label 12 Year Old',
          productImage: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=800&q=80',
          volume: '750ml',
          quantity: 2,
          unitPrice: 450,
          totalPrice: 900,
        },
      ],
    },
    {
      id: 'ord_demo_102',
      orderNumber: 'DJ-2026-1002',
      customerId: 'usr_customer_1',
      customerName: 'Kofi Boateng (Guest)',
      customerEmail: 'kofi.b@example.com',
      customerPhone: '+233208765432',
      fulfillmentType: 'pickup',
      deliveryFee: 0,
      subtotal: 540,
      totalAmount: 540,
      paymentStatus: 'paid',
      paymentMethod: 'paystack_card',
      paystackReference: 'ref_card_demo_1002',
      paystackPaidAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      orderStatus: 'confirmed',
      ageConfirmed: true,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      items: [
        {
          id: 'item_102_1',
          productId: 'prod_jameson',
          productName: 'Jameson Irish Whiskey',
          productImage: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=800&q=80',
          volume: '750ml',
          quantity: 1,
          unitPrice: 360,
          totalPrice: 360,
        },
        {
          id: 'item_102_2',
          productId: 'prod_club_bottle',
          productName: 'Club Premium Lager Beer (Single Bottle)',
          productImage: 'https://images.unsplash.com/photo-1608270199042-45e0f73fce81?auto=format&fit=crop&w=800&q=80',
          volume: '625ml',
          quantity: 10,
          unitPrice: 18,
          totalPrice: 180,
        },
      ],
    },
  ];

  return {
    users: SEED_USERS,
    categories: SEED_CATEGORIES,
    products: SEED_PRODUCTS,
    orders: sampleOrders,
    settings: SEED_STORE_SETTINGS,
  };
}

let inMemoryDb: DatabaseSchema | null = null;

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      inMemoryDb = initial;
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    inMemoryDb = parsed;
    return parsed;
  } catch (error) {
    console.error('Error reading db.json:', error);
    if (inMemoryDb) return inMemoryDb;
    inMemoryDb = getInitialData();
    return inMemoryDb;
  }
}

function writeDb(data: DatabaseSchema): void {
  try {
    inMemoryDb = data;
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing db.json:', error);
  }
}

// ---------------- PRODUCTS ----------------
export async function getProducts(options?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  onlyActive?: boolean;
}): Promise<Product[]> {
  // 1. Try Supabase cloud query
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data && data.length > 0) {
      let list: Product[] = data.map((row: any) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        price: Number(row.price),
        stockQuantity: row.stock_quantity,
        volume: row.volume,
        alcoholPercentage: row.alcohol_percentage ? Number(row.alcohol_percentage) : undefined,
        originCountry: row.origin_country,
        imageUrl: row.image_url,
        description: row.description || '',
        isFeatured: row.is_featured,
        isActive: row.is_active,
        createdAt: row.created_at,
      }));

      if (options?.onlyActive !== false) {
        list = list.filter((p) => p.isActive);
      }
      if (options?.category && options.category !== 'all') {
        list = list.filter((p) => p.category.toLowerCase() === options.category?.toLowerCase());
      }
      if (options?.search) {
        const q = options.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
      }
      if (options?.minPrice !== undefined) {
        list = list.filter((p) => p.price >= options.minPrice!);
      }
      if (options?.maxPrice !== undefined) {
        list = list.filter((p) => p.price <= options.maxPrice!);
      }
      return list;
    }
  } catch (e) {
    // Fall through to local persistent DB
  }

  // 2. Fallback to local DB
  const db = readDb();
  let list = db.products;

  if (options?.onlyActive !== false) {
    list = list.filter((p) => p.isActive);
  }

  if (options?.category && options.category !== 'all') {
    list = list.filter((p) => p.category.toLowerCase() === options.category?.toLowerCase());
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (options?.minPrice !== undefined) {
    list = list.filter((p) => p.price >= options.minPrice!);
  }

  if (options?.maxPrice !== undefined) {
    list = list.filter((p) => p.price <= options.maxPrice!);
  }

  return list;
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (!error && data) {
      return {
        id: data.id,
        name: data.name,
        category: data.category,
        price: Number(data.price),
        stockQuantity: data.stock_quantity,
        volume: data.volume,
        alcoholPercentage: data.alcohol_percentage ? Number(data.alcohol_percentage) : undefined,
        originCountry: data.origin_country,
        imageUrl: data.image_url,
        description: data.description || '',
        isFeatured: data.is_featured,
        isActive: data.is_active,
        createdAt: data.created_at,
      };
    }
  } catch (e) {}

  const db = readDb();
  return db.products.find((p) => p.id === id) || null;
}

export async function createProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  const newProduct: Product = {
    ...productData,
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  try {
    await supabase.from('products').insert({
      id: newProduct.id,
      name: newProduct.name,
      category: newProduct.category,
      price: newProduct.price,
      stock_quantity: newProduct.stockQuantity,
      volume: newProduct.volume,
      alcohol_percentage: newProduct.alcoholPercentage,
      origin_country: newProduct.originCountry,
      image_url: newProduct.imageUrl,
      description: newProduct.description,
      is_featured: newProduct.isFeatured,
      is_active: newProduct.isActive,
    });
  } catch (e) {}

  const db = readDb();
  db.products.unshift(newProduct);
  writeDb(db);
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  try {
    const supabaseUpdates: any = {};
    if (updates.name !== undefined) supabaseUpdates.name = updates.name;
    if (updates.category !== undefined) supabaseUpdates.category = updates.category;
    if (updates.price !== undefined) supabaseUpdates.price = updates.price;
    if (updates.stockQuantity !== undefined) supabaseUpdates.stock_quantity = updates.stockQuantity;
    if (updates.volume !== undefined) supabaseUpdates.volume = updates.volume;
    if (updates.alcoholPercentage !== undefined) supabaseUpdates.alcohol_percentage = updates.alcoholPercentage;
    if (updates.originCountry !== undefined) supabaseUpdates.origin_country = updates.originCountry;
    if (updates.imageUrl !== undefined) supabaseUpdates.image_url = updates.imageUrl;
    if (updates.description !== undefined) supabaseUpdates.description = updates.description;
    if (updates.isFeatured !== undefined) supabaseUpdates.is_featured = updates.isFeatured;
    if (updates.isActive !== undefined) supabaseUpdates.is_active = updates.isActive;

    await supabase.from('products').update(supabaseUpdates).eq('id', id);
  } catch (e) {}

  const db = readDb();
  const index = db.products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  db.products[index] = { ...db.products[index], ...updates };
  writeDb(db);
  return db.products[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await supabase.from('products').delete().eq('id', id);
  } catch (e) {}

  const db = readDb();
  const initialLen = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  if (db.products.length !== initialLen) {
    writeDb(db);
    return true;
  }
  return false;
}

// ---------------- CATEGORIES ----------------
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase.from('categories').select('*');
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (e) {}

  const db = readDb();
  return db.categories;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  const db = readDb();
  const index = db.categories.findIndex((c) => c.id === id);
  if (index === -1) return null;
  db.categories[index] = { ...db.categories[index], ...updates };
  writeDb(db);
  return db.categories[index];
}

// ---------------- USERS ----------------
export async function getUsers(role?: Role): Promise<Omit<User, 'passwordHash'>[]> {
  try {
    let query = supabase.from('users').select('id, name, email, phone, role, created_at');
    if (role) query = query.eq('role', role);
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        createdAt: u.created_at,
      }));
    }
  } catch (e) {}

  const db = readDb();
  let users = db.users;
  if (role) {
    users = users.filter((u) => u.role === role);
  }
  return users.map(({ passwordHash, ...rest }) => rest);
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (!error && data) {
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash: data.password_hash,
        role: data.role,
        createdAt: data.created_at,
      };
    }
  } catch (e) {}

  const db = readDb();
  return db.users.find((u) => u.id === id) || null;
}

export async function getUserByEmailOrPhone(identifier: string): Promise<User | null> {
  const cleanId = identifier.trim().toLowerCase();
  const digits = cleanId.replace(/[^0-9]/g, '');

  try {
    let query = supabase.from('users').select('*');
    if (cleanId.includes('@')) {
      query = query.ilike('email', cleanId);
    } else if (digits.length >= 7) {
      const searchDigits = digits.length >= 9 ? digits.slice(-9) : digits;
      query = query.or(`phone.ilike.%${searchDigits}%,email.ilike.${cleanId}`);
    } else {
      query = query.ilike('email', cleanId);
    }

    const { data, error } = await query.limit(1);
    if (!error && data && data.length > 0) {
      const u = data[0];
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        passwordHash: u.password_hash,
        role: u.role,
        createdAt: u.created_at,
      };
    }
  } catch (e) {}

  const db = readDb();
  const searchDigits = digits.length >= 9 ? digits.slice(-9) : digits;
  return (
    db.users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        (digits.length >= 7 && u.phone.replace(/[^0-9]/g, '').includes(searchDigits))
    ) || null
  );
}

export async function createUser(userData: {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: Role;
}): Promise<User> {
  const db = readDb();

  // Strict enforcement: Only one Shop Owner account can ever exist
  if (userData.role === 'owner') {
    const existingOwner = db.users.find((u) => u.role === 'owner');
    if (existingOwner) {
      throw new Error('Only one Shop Owner account is permitted for Diamond Jay Enterprise.');
    }
  }

  const newUser: User = {
    id: `usr_${userData.role}_${Date.now()}`,
    ...userData,
    createdAt: new Date().toISOString(),
  };

  try {
    await supabase.from('users').insert({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      password_hash: newUser.passwordHash,
      role: newUser.role,
    });
  } catch (e) {}

  db.users.push(newUser);
  writeDb(db);
  return newUser;
}

export async function updateUser(
  id: string,
  updates: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<User | null> {
  const db = readDb();
  const index = db.users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  // Prevent promoting any account to owner
  if (updates.role === 'owner' && db.users[index].role !== 'owner') {
    throw new Error('Cannot assign Shop Owner role. Diamond Jay Enterprise has a single owner account.');
  }

  try {
    const sUpdates: any = {};
    if (updates.name) sUpdates.name = updates.name;
    if (updates.email) sUpdates.email = updates.email;
    if (updates.phone) sUpdates.phone = updates.phone;
    if (updates.passwordHash) sUpdates.password_hash = updates.passwordHash;
    await supabase.from('users').update(sUpdates).eq('id', id);
  } catch (e) {}

  db.users[index] = { ...db.users[index], ...updates };
  writeDb(db);
  return db.users[index];
}

export async function deleteUser(id: string): Promise<boolean> {
  const db = readDb();
  const target = db.users.find((u) => u.id === id);
  if (!target) return false;

  // Prevent deleting the sole Shop Owner
  if (target.role === 'owner') {
    throw new Error('The primary Shop Owner account cannot be deleted.');
  }

  try {
    await supabase.from('users').delete().eq('id', id);
  } catch (e) {}

  const initialLen = db.users.length;
  db.users = db.users.filter((u) => u.id !== id);
  if (db.users.length !== initialLen) {
    writeDb(db);
    return true;
  }
  return false;
}

// ---------------- ORDERS ----------------
export async function getOrders(options?: {
  customerId?: string;
  status?: string;
  fulfillmentType?: string;
}): Promise<Order[]> {
  try {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (options?.customerId) query = query.eq('customer_id', options.customerId);
    if (options?.status && options.status !== 'all') query = query.eq('order_status', options.status);
    if (options?.fulfillmentType && options.fulfillmentType !== 'all') {
      query = query.eq('fulfillment_type', options.fulfillmentType);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((o: any) => ({
        id: o.id,
        orderNumber: o.order_number,
        customerId: o.customer_id,
        customerName: o.customer_name,
        customerEmail: o.customer_email,
        customerPhone: o.customer_phone,
        fulfillmentType: o.fulfillment_type,
        deliveryDetails: o.delivery_details,
        deliveryFee: Number(o.delivery_fee),
        subtotal: Number(o.subtotal),
        totalAmount: Number(o.total_amount),
        paymentStatus: o.payment_status,
        paymentMethod: o.payment_method,
        paystackReference: o.paystack_reference,
        paystackPaidAt: o.paystack_paid_at,
        orderStatus: o.order_status,
        ageConfirmed: o.age_confirmed,
        cancellationReason: o.cancellation_reason,
        refundedAt: o.refunded_at,
        refundedBy: o.refunded_by,
        items: o.items || [],
        createdAt: o.created_at,
        updatedAt: o.updated_at,
      }));
    }
  } catch (e) {}

  const db = readDb();
  let list = db.orders;

  if (options?.customerId) {
    list = list.filter((o) => o.customerId === options.customerId);
  }

  if (options?.status && options.status !== 'all') {
    list = list.filter((o) => o.orderStatus === options.status);
  }

  if (options?.fulfillmentType && options.fulfillmentType !== 'all') {
    list = list.filter((o) => o.fulfillmentType === options.fulfillmentType);
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`id.eq.${id},order_number.eq.${id}`)
      .single();
    if (!error && data) {
      return {
        id: data.id,
        orderNumber: data.order_number,
        customerId: data.customer_id,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        customerPhone: data.customer_phone,
        fulfillmentType: data.fulfillment_type,
        deliveryDetails: data.delivery_details,
        deliveryFee: Number(data.delivery_fee),
        subtotal: Number(data.subtotal),
        totalAmount: Number(data.total_amount),
        paymentStatus: data.payment_status,
        paymentMethod: data.payment_method,
        paystackReference: data.paystack_reference,
        paystackPaidAt: data.paystack_paid_at,
        orderStatus: data.order_status,
        ageConfirmed: data.age_confirmed,
        cancellationReason: data.cancellation_reason,
        refundedAt: data.refunded_at,
        refundedBy: data.refunded_by,
        items: data.items || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
  } catch (e) {}

  const db = readDb();
  return db.orders.find((o) => o.id === id || o.orderNumber === id) || null;
}

export async function createOrder(
  orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>
): Promise<Order> {
  const db = readDb();
  const currentYear = new Date().getFullYear();
  const orderCount = db.orders.length + 1001;
  const orderNumber = `DJ-${currentYear}-${orderCount}`;

  const newOrder: Order = {
    ...orderData,
    id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orderNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await supabase.from('orders').insert({
      id: newOrder.id,
      order_number: newOrder.orderNumber,
      customer_id: newOrder.customerId,
      customer_name: newOrder.customerName,
      customer_email: newOrder.customerEmail,
      customer_phone: newOrder.customerPhone,
      fulfillment_type: newOrder.fulfillmentType,
      delivery_details: newOrder.deliveryDetails,
      delivery_fee: newOrder.deliveryFee,
      subtotal: newOrder.subtotal,
      total_amount: newOrder.totalAmount,
      payment_status: newOrder.paymentStatus,
      order_status: newOrder.orderStatus,
      age_confirmed: newOrder.ageConfirmed,
      items: newOrder.items,
    });
  } catch (e) {}

  db.orders.unshift(newOrder);
  writeDb(db);
  return newOrder;
}

export async function updateOrderStatus(
  id: string,
  orderStatus: Order['orderStatus'],
  cancellationReason?: string
): Promise<Order | null> {
  try {
    await supabase
      .from('orders')
      .update({
        order_status: orderStatus,
        cancellation_reason: cancellationReason || null,
        updated_at: new Date().toISOString(),
      })
      .or(`id.eq.${id},order_number.eq.${id}`);
  } catch (e) {}

  const db = readDb();
  const index = db.orders.findIndex((o) => o.id === id || o.orderNumber === id);
  if (index === -1) return null;

  db.orders[index].orderStatus = orderStatus;
  db.orders[index].updatedAt = new Date().toISOString();
  if (cancellationReason) {
    db.orders[index].cancellationReason = cancellationReason;
  }
  writeDb(db);
  return db.orders[index];
}

export async function markOrderPaid(
  idOrRef: string,
  paystackReference: string,
  paymentMethod: Order['paymentMethod'] = 'paystack_momo'
): Promise<Order | null> {
  const db = readDb();
  const index = db.orders.findIndex(
    (o) => o.id === idOrRef || o.orderNumber === idOrRef || o.paystackReference === idOrRef
  );
  if (index === -1) return null;

  const order = db.orders[index];
  if (order.paymentStatus === 'paid') {
    return order; // Already paid idempotently
  }

  order.paymentStatus = 'paid';
  order.orderStatus = 'confirmed';
  order.paystackReference = paystackReference;
  order.paymentMethod = paymentMethod;
  order.paystackPaidAt = new Date().toISOString();
  order.updatedAt = new Date().toISOString();

  // Deduct inventory quantities safely
  for (const item of order.items) {
    const pIndex = db.products.findIndex((p) => p.id === item.productId);
    if (pIndex !== -1) {
      db.products[pIndex].stockQuantity = Math.max(0, db.products[pIndex].stockQuantity - item.quantity);
      try {
        supabase
          .from('products')
          .update({ stock_quantity: db.products[pIndex].stockQuantity })
          .eq('id', item.productId);
      } catch (e) {}
    }
  }

  try {
    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        order_status: 'confirmed',
        paystack_reference: paystackReference,
        payment_method: paymentMethod,
        paystack_paid_at: order.paystackPaidAt,
        updated_at: order.updatedAt,
      })
      .eq('id', order.id);
  } catch (e) {}

  try {
    const ownerNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '0248565916';
    const link = buildWhatsAppOrderLink(order, ownerNumber);
    if (typeof window === 'undefined') {
      // Server-side notification is not sent via browser; we keep a link for direct use in the future.
      console.info('WhatsApp order notification link:', link);
    }
  } catch (e) {
    console.error('WhatsApp notification build failed:', e);
  }

  writeDb(db);
  return order;
}

export async function refundOrder(
  id: string,
  reason: string,
  byUserId: string
): Promise<Order | null> {
  const db = readDb();
  const index = db.orders.findIndex((o) => o.id === id || o.orderNumber === id);
  if (index === -1) return null;

  const order = db.orders[index];
  order.paymentStatus = 'refunded';
  order.orderStatus = 'cancelled';
  order.cancellationReason = reason;
  order.refundedAt = new Date().toISOString();
  order.refundedBy = byUserId;
  order.updatedAt = new Date().toISOString();

  // Restock inventory
  for (const item of order.items) {
    const pIndex = db.products.findIndex((p) => p.id === item.productId);
    if (pIndex !== -1) {
      db.products[pIndex].stockQuantity += item.quantity;
      try {
        supabase
          .from('products')
          .update({ stock_quantity: db.products[pIndex].stockQuantity })
          .eq('id', item.productId);
      } catch (e) {}
    }
  }

  try {
    await supabase
      .from('orders')
      .update({
        payment_status: 'refunded',
        order_status: 'cancelled',
        cancellation_reason: reason,
        refunded_at: order.refundedAt,
        refunded_by: byUserId,
        updated_at: order.updatedAt,
      })
      .eq('id', order.id);
  } catch (e) {}

  writeDb(db);
  return order;
}

// ---------------- STORE SETTINGS ----------------
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const { data, error } = await supabase.from('store_settings').select('*').single();
    if (!error && data) {
      return {
        storeName: data.store_name,
        tagline: data.tagline,
        address: data.address,
        city: data.city,
        country: data.country,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        minOrderAge: data.min_order_age,
        businessHours: data.business_hours,
        deliveryZones: data.delivery_zones,
        announcementBanner: data.announcement_banner,
        paystackPublicKey: data.paystack_public_key,
      };
    }
  } catch (e) {}

  const db = readDb();
  return db.settings || SEED_STORE_SETTINGS;
}

export async function updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  const db = readDb();
  db.settings = { ...db.settings, ...updates };

  try {
    const sUpdates: any = {};
    if (updates.storeName) sUpdates.store_name = updates.storeName;
    if (updates.tagline) sUpdates.tagline = updates.tagline;
    if (updates.address) sUpdates.address = updates.address;
    if (updates.phone) sUpdates.phone = updates.phone;
    if (updates.whatsapp) sUpdates.whatsapp = updates.whatsapp;
    if (updates.email) sUpdates.email = updates.email;
    if (updates.businessHours) sUpdates.business_hours = updates.businessHours;
    if (updates.deliveryZones) sUpdates.delivery_zones = updates.deliveryZones;
    if (updates.announcementBanner) sUpdates.announcement_banner = updates.announcementBanner;

    await supabase.from('store_settings').update(sUpdates).eq('id', 'primary_store');
  } catch (e) {}

  writeDb(db);
  return db.settings;
}

// ---------------- OWNER SALES ANALYTICS ----------------
export async function getSalesAnalytics() {
  const db = readDb();
  const paidOrders = db.orders.filter((o) => o.paymentStatus === 'paid');

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = paidOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const order of paidOrders) {
    for (const item of order.items) {
      const existing = productSalesMap.get(item.productId) || {
        name: item.productName,
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue += item.totalPrice;
      productSalesMap.set(item.productId, existing);
    }
  }

  const topProducts = Array.from(productSalesMap.entries())
    .map(([id, stats]) => ({ id, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const deliveryCount = paidOrders.filter((o) => o.fulfillmentType === 'delivery').length;
  const pickupCount = paidOrders.filter((o) => o.fulfillmentType === 'pickup').length;

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    topProducts,
    deliveryCount,
    pickupCount,
    allOrdersCount: db.orders.length,
    pendingOrdersCount: db.orders.filter(
      (o) => o.orderStatus === 'pending' || (o.paymentStatus === 'paid' && o.orderStatus === 'confirmed')
    ).length,
    lowStockProducts: db.products.filter((p) => p.stockQuantity < 15),
  };
}
