import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { WorkUpdate } from '@/lib/types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { updates, period, unitInfo } = await req.json() as {
      updates: WorkUpdate[];
      period: 'daily' | 'weekly';
      unitInfo: string;
    };

    if (!updates?.length) {
      return NextResponse.json({ text: 'Šiuo laikotarpiu ataskaitų nebuvo.' });
    }

    const updateList = updates
      .map(u => `[${new Date(u.createdAt).toLocaleDateString('lt-LT')}] ${u.authorName} (${u.authorRole === 'work_manager' ? 'Vadovas' : 'Darbininkas'}): ${u.text}`)
      .join('\n');

    const periodLabel = period === 'daily' ? 'dienos' : 'savaitės';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Esi statybos darbų koordinatorius. Apibendrink darbuotojų ataskaitas lietuvių kalba. Pateik trumpą ${periodLabel} santrauką: kas padaryta, kokie progresai, ar yra problemų. Rašyk aiškiai ir profesionaliai. Maksimaliai 150 žodžių.`,
        },
        {
          role: 'user',
          content: `Butas / objektas: ${unitInfo}\n\nAtasakaitos:\n${updateList}`,
        },
      ],
      max_tokens: 300,
    });

    const text = response.choices[0]?.message?.content ?? 'Nepavyko sugeneruoti santraukos.';
    return NextResponse.json({ text });
  } catch (err) {
    console.error('Summary error:', err);
    return NextResponse.json({ error: 'Summary failed' }, { status: 500 });
  }
}
