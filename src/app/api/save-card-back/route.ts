import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { base64Data } = data;
    if (!base64Data) {
      return NextResponse.json({ error: 'Missing base64Data' }, { status: 400 });
    }
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Image, 'base64');

    const publicPath = path.join(process.cwd(), 'public', 'rialo-card-back.png');
    const artifactPath = path.join(
      'C:',
      'Users',
      'user',
      '.gemini',
      'antigravity-ide',
      'brain',
      '975aff8d-b738-44f2-b232-b9e3ff56ada5',
      'rialo_card_back.png'
    );

    fs.writeFileSync(publicPath, buffer);
    try {
      fs.writeFileSync(artifactPath, buffer);
    } catch (_) {}

    return NextResponse.json({ success: true, url: '/rialo-card-back.png' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
