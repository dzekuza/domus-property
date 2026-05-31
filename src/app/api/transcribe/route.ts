import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get('audio') as Blob | null;
    if (!audioBlob) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
    }

    const file = new File([audioBlob], 'recording.webm', { type: audioBlob.type || 'audio/webm' });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'lt',
      response_format: 'text',
    });

    return NextResponse.json({ text: transcription });
  } catch (err) {
    console.error('Transcription error:', err);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
