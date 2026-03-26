import { NextResponse } from 'next/server';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export async function POST(request: Request) {
  try {
    const { ingredient } = await request.json();

    if (!ingredient || typeof ingredient !== 'string') {
      return NextResponse.json({ corrected: ingredient });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ corrected: ingredient });
    }

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 50,
        messages: [{
          role: 'user',
          content: `Fix any typos and normalise this ingredient or dish name. Return ONLY the corrected name in lowercase, nothing else. If it's already correct, return it unchanged.\n\n${ingredient}`,
        }],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ corrected: ingredient });
    }

    const data = await response.json();
    const corrected = data.content?.[0]?.text?.trim().toLowerCase();

    return NextResponse.json({ corrected: corrected || ingredient });
  } catch {
    return NextResponse.json({ corrected: '' });
  }
}
