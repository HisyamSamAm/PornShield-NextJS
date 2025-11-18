import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(`uploads/${Date.now()}-${file.name}`, file, { access: 'public' });

    // Return only the URL - NSFW analysis is done on client-side
    return NextResponse.json({
      url: blob.url,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}