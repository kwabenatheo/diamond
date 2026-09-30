import { Order } from '@/lib/types';

export const COURIER_WHATSAPP_CONTACTS = [
  { number: '0598015154', label: 'Courier Contact 1' },
  { number: '0242657521', label: 'Courier Contact 2' },
] as const;

export function normalizeWhatsAppNumber(rawNumber?: string): string {
  const digits = (rawNumber || '').replace(/\D/g, '');

  if (!digits) {
    return '233509735216';
  }

  if (digits.startsWith('233')) {
    return digits;
  }

  if (digits.startsWith('0')) {
    return `233${digits.slice(1)}`;
  }

  return digits.length === 9 ? `233${digits}` : digits;
}

export function buildWhatsAppOrderMessage(order: Order): string {
  const delivery = order.deliveryDetails;

  const lines = [
    `PAID ORDER — COURIER ARRANGEMENT: ${order.orderNumber}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Email: ${order.customerEmail}`,
    `Fulfillment: ${order.fulfillmentType}`,
  ];

  if (delivery) {
    lines.push(`Location: ${delivery.address}`);
    if (delivery.zone) {
      lines.push(`Zone: ${delivery.zone}`);
    }
    if (delivery.deliveryNotes) {
      lines.push(`Notes: ${delivery.deliveryNotes}`);
    }
  }

  if (order.items.length > 0) {
    lines.push('Items:');
    for (const item of order.items) {
      lines.push(`- ${item.quantity}x ${item.productName} (${item.volume}) = GHS ${item.totalPrice.toFixed(2)}`);
    }
  }

  lines.push(`Subtotal: GHS ${order.subtotal.toFixed(2)}`);
  lines.push(`Total: GHS ${order.totalAmount.toFixed(2)}`);
  if (order.paystackReference) lines.push(`Payment reference: ${order.paystackReference}`);
  lines.push('Please help arrange a courier for this delivery. Kindly confirm the courier fee and estimated arrival time.');

  return lines.join('\n');
}

export function buildWhatsAppOrderLink(order: Order, rawNumber?: string): string {
  const targetNumber = normalizeWhatsAppNumber(rawNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '233248565916');
  const message = buildWhatsAppOrderMessage(order);
  return `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
}
