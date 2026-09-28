import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmailOrPhone, createUser } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Please provide full name, email, phone number, and password' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existingUser = (await getUserByEmailOrPhone(email)) || (await getUserByEmailOrPhone(phone));
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email or phone number already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const newUser = await createUser({
      name,
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      passwordHash,
      role: 'customer', // Self-registration is strictly for customers
    });

    const token = signToken(newUser);
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
    });

    response.cookies.set('dj_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
