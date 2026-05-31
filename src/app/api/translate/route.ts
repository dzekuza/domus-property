import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const LANG_NAMES: Record<string, string> = {
  en: 'English',
  ru: 'Russian',
  de: 'German',
  lt: 'Lithuanian',
};

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang } = await req.json() as { text: string; targetLang: string };
    if (!text || !targetLang) {
      return NextResponse.json({ error: 'Missing text or targetLang' }, { status: 400 });
    }

    const langName = LANG_NAMES[targetLang] ?? targetLang;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following construction/renovation work update text to ${langName}. Return only the translated text, no explanations.`,
        },
        { role: 'user', content: text },
      ],
      max_tokens: 500,
    });

    const translated = response.choices[0]?.message?.content ?? '';
    return NextResponse.json({ text: translated });
  } catch (err) {
    console.error('Translation error:', err);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
