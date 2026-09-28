import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { getAuthenticatedUser } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || (user.role !== 'staff' && user.role !== 'owner')) {
      return NextResponse.json({ error: 'Unauthorized. Staff or owner access required.' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload a JPEG, PNG, WEBP, GIF, or AVIF image.' },
        { status: 400 }
      );
    }

    // Max size: 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds maximum limit of 5MB.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Image storage is not configured. Set the Supabase URL and server-side service role key.' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/avif': 'avif',
    };
    const filename = `${randomUUID()}.${extensions[file.type]}`;
    const objectPath = `products/${filename}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(objectPath, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type,
        cacheControl: '31536000',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError.message);
      return NextResponse.json(
        { error: `Could not upload image to the '${bucket}' bucket. Check that the bucket exists and is public.` },
        { status: 502 }
      );
    }

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(objectPath);

    return NextResponse.json({
      success: true,
      url: data.publicUrl,
      filename,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
  }
}
