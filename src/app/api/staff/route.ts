import { NextRequest, NextResponse } from 'next/server';
import { getUsers, createUser, updateUser, deleteUser, getUserByEmailOrPhone } from '@/lib/db';
import { getAuthenticatedUser, hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    // Strict Owner check: Staff cannot view staff management
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized. Owner access required.' }, { status: 403 });
    }

    const staffList = await getUsers('staff');
    return NextResponse.json({ staff: staffList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to list staff' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized. Owner access required.' }, { status: 403 });
    }

    const { name, email, phone, password } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'Name, email, phone, and password are required.' }, { status: 400 });
    }

    const existing = (await getUserByEmailOrPhone(email)) || (await getUserByEmailOrPhone(phone));
    if (existing) {
      return NextResponse.json({ error: 'An account with this email or phone already exists.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const newStaff = await createUser({
      name,
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      passwordHash,
      role: 'staff',
    });

    const { passwordHash: _, ...staffWithoutPassword } = newStaff;
    return NextResponse.json({ success: true, staff: staffWithoutPassword });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create staff account' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized. Owner access required.' }, { status: 403 });
    }

    const { id, name, email, phone, newPassword } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Staff ID is required.' }, { status: 400 });
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email.trim().toLowerCase();
    if (phone) updates.phone = phone.trim();
    if (newPassword) {
      updates.passwordHash = await hashPassword(newPassword);
    }

    const updated = await updateUser(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Staff member not found.' }, { status: 404 });
    }

    const { passwordHash: _, ...staffWithoutPassword } = updated;
    return NextResponse.json({ success: true, staff: staffWithoutPassword });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update staff' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized. Owner access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Staff ID is required.' }, { status: 400 });
    }

    const deleted = await deleteUser(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Staff member not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Staff member removed.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to remove staff' }, { status: 500 });
  }
}
