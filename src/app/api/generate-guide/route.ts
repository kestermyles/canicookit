import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { createGuide, updateGuideScore } from '@/lib/supabase';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Lazy-load OpenAI client
let openaiClient: OpenAI | null = null;
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }
  return openaiClient;
}

/**
 * Validate that the topic is cooking/food related using OpenAI
 */
async function validateCookingTopic(topic: string): Promise<{ valid: boolean; reason?: string }> {
  try {
    const openai = getOpenAIClient();

    // Use GPT-4o-mini to check if the topic is cooking/food related
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a content moderator for a cooking website. Determine if a topic is genuinely related to cooking, food preparation, kitchen skills, ingredients, or hosting/entertaining with food. Return ONLY a JSON object: {"valid": true/false, "reason": "brief explanation"}',
        },
        {
          role: 'user',
          content: `Is this a valid cooking/food topic for a cooking guide?\n\nTopic: "${topic}"\n\nValid cooking topics include: cooking techniques, ingredient preparation, kitchen skills, food storage, hosting tips, recipe fundamentals, etc.\n\nInvalid topics: non-food items, unrelated subjects, offensive content, etc.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(content);
    return {
      valid: result.valid === true,
      reason: result.reason,
    };
  } catch (error) {
    console.error('Error validating topic:', error);
    // Default to allowing if validation fails
    return { valid: true };
  }
}

/**
 * Auto-assign a category based on the topic
 */
async function assignCategory(topic: string): Promise<string> {
  try {
    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You categorize cooking guide topics. Return ONLY a JSON object: {"category": "one of: Techniques, Ingredients, Hosting, Basics, Kitchen Skills"}',
        },
        {
          role: 'user',
          content: `Categorize this cooking guide topic:\n\nTopic: "${topic}"\n\nCategories:\n- Techniques: cooking methods, processes (how to sear, braise, etc.)\n- Ingredients: working with specific ingredients (how to store, prep, etc.)\n- Hosting: entertaining, serving, table setting\n- Basics: fundamental cooking knowledge, reading recipes, fixing mistakes\n- Kitchen Skills: knife skills, equipment, meal prep, organization\n\nReturn the most appropriate category.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return 'Basics';
    }

    const result = JSON.parse(content);
    const category = result.category;

    // Validate the category is one of our valid options
    const validCategories = ['Techniques', 'Ingredients', 'Hosting', 'Basics', 'Kitchen Skills'];
    if (validCategories.includes(category)) {
      return category;
    }

    return 'Basics';
  } catch (error) {
    console.error('Error assigning category:', error);
    return 'Basics';
  }
}

/**
 * Generate a guide using Claude Sonnet 4.5
 */
async function generateGuideContent(topic: string) {
  const prompt = `You are a practical cooking guide writer. Create a comprehensive, no-nonsense cooking guide about: "${topic}"

Your guide should be:
- Practical and actionable
- Written in a friendly, conversational tone
- Clear and concise
- Free of pretentious foodie jargon
- Focused on real-world home cooking

Return ONLY a valid JSON object in this EXACT format (no markdown, no code blocks, no extra text):
{
  "title": "How to [Exact Topic]",
  "description": "One-sentence practical summary (under 120 chars)",
  "icon": "single relevant emoji",
  "read_time": "X min read" (estimate based on content length),
  "intro": "2-3 sentence intro explaining why this matters and what the reader will learn",
  "steps": [
    {
      "number": 1,
      "title": "Clear Step Title",
      "content": "Detailed explanation of this step (2-4 sentences)"
    }
  ],
  "pro_tips": [
    "Practical tip 1",
    "Practical tip 2",
    "Practical tip 3",
    "Practical tip 4",
    "Practical tip 5"
  ],
  "related_recipes": ["cuisine1", "cuisine2", "cuisine3"]
}

Requirements:
- 5-8 steps
- 5 pro tips
- 3 related recipe types or cuisines
- No fluff or filler
- Real techniques, not obvious advice
- Written like you're helping a friend, not teaching a class`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2500,
    temperature: 0.7,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return JSON.parse(content.text);
}

/**
 * Score a guide using Claude Haiku 4.5
 */
async function scoreGuide(guideData: any): Promise<number> {
  const prompt = `Score this cooking guide 0-10 on:
1. Practical usefulness (is it actually helpful?)
2. Clarity (easy to understand and follow?)
3. Completeness (covers the topic well?)
4. Tone (friendly, no-nonsense, not pretentious?)

Guide:
Title: ${guideData.title}
Description: ${guideData.description}
Intro: ${guideData.intro}
Steps: ${guideData.steps.length} steps
Pro Tips: ${guideData.pro_tips.length} tips

Return ONLY a JSON object: {"score": 7.5, "reasoning": "brief explanation"}`;

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    temperature: 0.3,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  const result = JSON.parse(content.text);
  return parseFloat(result.score);
}

/**
 * Create a URL-safe slug from a title
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide a topic for the guide',
        },
        { status: 400 }
      );
    }

    // Validate topic is cooking-related
    const validation = await validateCookingTopic(topic);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'We only cover cooking topics here! Try asking about a technique, ingredient or kitchen skill 🍳',
        },
        { status: 400 }
      );
    }

    // Auto-assign category
    const category = await assignCategory(topic);

    // Generate guide content
    const guideContent = await generateGuideContent(topic);

    // Create slug
    const slug = slugify(guideContent.title);

    // Save to database with pending status and assigned category
    const { success, data: savedGuide, error } = await createGuide({
      slug,
      title: guideContent.title,
      description: guideContent.description,
      icon: guideContent.icon,
      read_time: guideContent.read_time,
      intro: guideContent.intro,
      steps: guideContent.steps,
      pro_tips: guideContent.pro_tips,
      related_recipes: guideContent.related_recipes,
      source: 'ai-generated',
      status: 'pending',
      category,
    });

    if (!success || !savedGuide) {
      throw new Error(error || 'Failed to save guide');
    }

    // Score guide asynchronously (don't wait)
    scoreGuide(guideContent)
      .then((score) => {
        updateGuideScore(savedGuide.id, score);
      })
      .catch((err) => {
        console.error('Error scoring guide:', err);
      });

    return NextResponse.json({
      success: true,
      slug,
      guide: guideContent,
    });
  } catch (error) {
    console.error('Error generating guide:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate guide. Please try again.',
      },
      { status: 500 }
    );
  }
}
