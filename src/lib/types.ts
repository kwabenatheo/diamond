export type Role = 'customer' | 'staff' | 'owner';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName?: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string; // Category slug or name
  price: number; // In GHS (Ghana Cedis)
  stockQuantity: number;
  volume: string; // e.g., '750ml', '330ml', '1L', 'Crate (24x330ml)'
  alcoholPercentage?: number; // e.g., 40.0%
  originCountry?: string; // e.g., 'Scotland', 'Ghana', 'France'
  imageUrl: string;
  description: string;
  isFeatured?: boolean;
  isActive: boolean;
  createdAt: string;
}

export type FulfillmentType = 'delivery' | 'pickup';

export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'out_for_delivery'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  volume: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface DeliveryDetails {
  recipientName: string;
  phone: string;
  alternativePhone?: string;
  address: string;
  zone: string;
  deliveryNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string; // Optional for guest orders
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fulfillmentType: FulfillmentType;
  deliveryDetails?: DeliveryDetails;
  deliveryFee: number;
  subtotal: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'paystack_momo' | 'paystack_card' | 'paystack_direct';
  paystackReference?: string;
  paystackPaidAt?: string;
  orderStatus: OrderStatus;
  ageConfirmed: boolean;
  cancellationReason?: string;
  refundedAt?: string;
  refundedBy?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface DeliveryZone {
  id: string;
  name: string;
  areas: string[];
  fee: number; // In GHS
  estimatedTime: string;
}

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  isClosed?: boolean;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  whatsapp: string;
  email: string;
  minOrderAge: number;
  businessHours: BusinessHours[];
  deliveryZones: DeliveryZone[];
  announcementBanner: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  paystackPublicKey?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
