import { NextRequest, NextResponse } from 'next/server';
import { getStoreSettings, updateStoreSettings } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    // Strict Owner check: Staff cannot edit store settings
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized. Owner access required.' }, { status: 403 });
    }

    const updates = await req.json();
    const updated = await updateStoreSettings(updates);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}
