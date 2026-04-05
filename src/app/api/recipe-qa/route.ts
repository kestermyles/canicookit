import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-6';

export async function POST(request: Request) {
  try {
    const { question, recipeTitle, recipeDescription, ingredients, recipeSlug } = await request.json();

    if (!question || !recipeTitle) {
      return NextResponse.json(
        { error: 'Question and recipe title are required' },
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

    const systemPrompt = `You are a friendly, practical cooking assistant on the recipe website "Can I Cook It?". You are answering a question about a specific recipe. Keep your answer to 2-3 sentences max. Be concise, helpful and conversational. Don't repeat the question back. If you're unsure, say so honestly.

Recipe: ${recipeTitle}
Description: ${recipeDescription || ''}
Ingredients: ${(ingredients || []).join(', ')}`;

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 256,
        system: systemPrompt,
        messages: [{ role: 'user', content: question }],
      }),
    });

    if (!response.ok) {
      console.error('[Recipe QA] API error:', response.status);
      return NextResponse.json(
        { error: 'Failed to get answer' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const answer = data.content?.[0]?.text || 'Sorry, I couldn\'t come up with an answer. Try rephrasing your question.';

    try {
      if (recipeSlug && answer && question) {
        await supabase.from('recipe_questions').insert({ recipe_slug: recipeSlug, question: question.trim(), answer });
      }
    } catch (saveError) {
      console.error('[Recipe QA] Failed to save Q&A:', saveError);
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('[Recipe QA] Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
