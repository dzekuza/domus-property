import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PROMPT = `Analyze this bill/receipt image and extract expense data.
Return ONLY a JSON object (no markdown, no code blocks) with this exact shape:
{
  "vendor_name": "store or company name, or 'Nežinoma' if not visible",
  "bill_date": "YYYY-MM-DD (use today if not visible)",
  "total_amount": 0.00,
  "currency": "EUR",
  "items": [
    { "description": "item name", "quantity": null, "unit_price": null, "line_total": null }
  ]
}
If a field is not readable, use null for numbers and a sensible default for strings.`;

export async function POST(req: NextRequest) {
  try {
    const { imageDataUrl } = await req.json() as { imageDataUrl: string };
    if (!imageDataUrl) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const mimeMatch = imageDataUrl.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch?.[1] ?? 'image/jpeg';
    const base64 = imageDataUrl.split(',')[1];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'high' } },
            { type: 'text', text: PROMPT },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const data = JSON.parse(cleaned);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Bill analysis error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
