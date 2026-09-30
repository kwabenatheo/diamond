import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || (user.role !== 'staff' && user.role !== 'owner')) {
      return NextResponse.json({ error: 'Staff or owner access required.' }, { status: 403 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('order_notifications')
      .select('id, order_id, recipient_role, title, message, created_at, read_at')
      .eq('recipient_role', user.role)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;
    return NextResponse.json({ notifications: data || [] });
  } catch (error) {
    console.error('Order notifications lookup failed:', error);
    return NextResponse.json({ error: 'Could not load order notifications.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || (user.role !== 'staff' && user.role !== 'owner')) {
      return NextResponse.json({ error: 'Staff or owner access required.' }, { status: 403 });
    }

    const { notificationId } = await req.json();
    if (typeof notificationId !== 'string' || !notificationId) {
      return NextResponse.json({ error: 'Notification ID is required.' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('order_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('recipient_role', user.role)
      .is('read_at', null)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ success: true, updated: Boolean(data) });
  } catch (error) {
    console.error('Order notification update failed:', error);
    return NextResponse.json({ error: 'Could not update notification.' }, { status: 500 });
  }
}
