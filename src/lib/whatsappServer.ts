import 'server-only';
import { Order } from './types';
import { getSupabaseAdmin } from './supabaseAdmin';
import { normalizeWhatsAppNumber } from './whatsapp';

const DISPATCH_RECIPIENTS = ['0598015154', '0242657521'];

function buildDispatchAlert(order: Order): string {
  const delivery = order.deliveryDetails;
  const itemLines = order.items.map(
    (item) => `${item.quantity} x ${item.productName} (${item.volume}) — GHS ${item.totalPrice.toFixed(2)}`
  );

  return [
    `PAID DELIVERY ORDER: ${order.orderNumber}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Email: ${order.customerEmail}`,
    `Delivery address: ${delivery?.address || 'Address not supplied'}`,
    delivery?.zone ? `Area: ${delivery.zone}` : '',
    delivery?.deliveryNotes ? `Delivery notes: ${delivery.deliveryNotes}` : '',
    'Items:',
    ...itemLines,
    `Total paid: GHS ${order.totalAmount.toFixed(2)}`,
    `Payment reference: ${order.paystackReference || 'Unavailable'}`,
    'Please arrange a dispatch driver.',
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, 1024);
}

async function reserveNotification(orderId: string, recipient: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('whatsapp_order_notifications').insert({
    order_id: orderId,
    recipient,
    status: 'sending',
  });

  if (!error) return true;
  if (error.code === '23505') {
    const { data, error: retryReadError } = await supabase
      .from('whatsapp_order_notifications')
      .update({ status: 'sending', error_message: null })
      .eq('order_id', orderId)
      .eq('recipient', recipient)
      .eq('status', 'failed')
      .select('order_id')
      .maybeSingle();
    if (retryReadError) throw retryReadError;
    return Boolean(data);
  }
  throw error;
}

export async function notifyDispatchRecipients(order: Order): Promise<void> {
  if (order.paymentStatus !== 'paid' || order.fulfillmentType !== 'delivery') return;

  const accessToken = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_ORDER_TEMPLATE;
  if (!accessToken || !phoneNumberId || !templateName) {
    console.error('WhatsApp order alerts are not configured; set the WhatsApp Cloud API environment variables.');
    return;
  }

  const apiVersion = process.env.WHATSAPP_GRAPH_API_VERSION || 'v23.0';
  const language = process.env.WHATSAPP_ORDER_TEMPLATE_LANGUAGE || 'en';
  const message = buildDispatchAlert(order);
  const supabase = getSupabaseAdmin();

  await Promise.all(
    DISPATCH_RECIPIENTS.map(async (rawRecipient) => {
      const recipient = normalizeWhatsAppNumber(rawRecipient);
      let reserved = false;
      try {
        reserved = await reserveNotification(order.id, recipient);
        if (!reserved) return;

        const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipient,
            type: 'template',
            template: {
              name: templateName,
              language: { code: language },
              components: [
                {
                  type: 'body',
                  parameters: [{ type: 'text', text: message }],
                },
              ],
            },
          }),
          cache: 'no-store',
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error?.message || `WhatsApp Cloud API request failed (${response.status}).`);
        }

        const { error: updateError } = await supabase
          .from('whatsapp_order_notifications')
          .update({
            status: 'sent',
            provider_message_id: result.messages?.[0]?.id || null,
            sent_at: new Date().toISOString(),
            error_message: null,
          })
          .eq('order_id', order.id)
          .eq('recipient', recipient);
        if (updateError) throw updateError;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown WhatsApp sending error.';
        console.error(`WhatsApp delivery alert failed for ${recipient}:`, message);
        if (reserved) {
          const { error: updateError } = await supabase
            .from('whatsapp_order_notifications')
            .update({ status: 'failed', error_message: message.slice(0, 1000) })
            .eq('order_id', order.id)
            .eq('recipient', recipient);
          if (updateError) console.error('Could not record WhatsApp alert failure:', updateError.message);
        }
      }
    })
  );
}
