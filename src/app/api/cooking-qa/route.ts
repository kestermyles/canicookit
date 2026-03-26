import { NextResponse } from 'next/server';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-6';

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Service not configured' },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a friendly, practical cooking assistant on the recipe website "Can I Cook It?". You answer general cooking questions — techniques, ingredients, equipment, food safety, terminology, and kitchen basics. Keep your answer to 2-4 sentences max. Be concise, helpful, and conversational. Use UK English. Don't repeat the question back. If you're unsure or if the question is about something dangerous or non-cooking-related, say so honestly and don't guess.`;

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: question }],
      }),
    });

    if (!response.ok) {
      console.error('[Cooking QA] API error:', response.status);
      return NextResponse.json(
        { error: 'Failed to get answer' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const answer = data.content?.[0]?.text || "Sorry, I couldn't come up with an answer. Try rephrasing your question.";

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('[Cooking QA] Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
