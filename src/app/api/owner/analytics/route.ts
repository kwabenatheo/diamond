import { NextRequest, NextResponse } from 'next/server';
import { getSalesAnalytics } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    // Strict Owner check: Staff cannot view financial analytics
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized. Owner access required.' }, { status: 403 });
    }

    const analytics = await getSalesAnalytics();
    return NextResponse.json({ analytics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch analytics' }, { status: 500 });
  }
}
