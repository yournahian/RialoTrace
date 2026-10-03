import { NextRequest, NextResponse } from 'next/server';
import { getGlobalTrollboxMessages, sendGlobalTrollboxMessage } from '@/lib/db';

export async function GET() {
  try {
    const messages = await getGlobalTrollboxMessages();
    return NextResponse.json({ success: true, messages });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sender, text, avatar, isSystem } = body;

    if (!sender || !text || !text.trim()) {
      return NextResponse.json({ success: false, error: 'Sender and text are required' }, { status: 400 });
    }

    if (text.length > 300) {
      return NextResponse.json({ success: false, error: 'Message cannot exceed 300 characters' }, { status: 400 });
    }

    const message = await sendGlobalTrollboxMessage({
      sender: sender.replace('@', '').trim(),
      text: text.trim(),
      avatar,
      isSystem: Boolean(isSystem),
    });

    return NextResponse.json({ success: true, message });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
