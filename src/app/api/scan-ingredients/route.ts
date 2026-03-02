import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Lazy-loaded OpenAI client
let openaiClient: OpenAI | null = null;
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }
  return openaiClient;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert image to base64 data URL
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: dataUrl },
            },
            {
              type: 'text',
              text: "Look at this image and identify all the food ingredients you can see. Return only a JSON array of ingredient names, lowercase, singular form, e.g. [\"chicken\", \"lemon\", \"garlic\"]. Only include actual food ingredients — ignore packaging, containers, appliances, and non-food items.",
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from GPT-4o');
    }

    // Parse JSON array from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({
        success: true,
        ingredients: [],
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate it's an array of strings
    if (!Array.isArray(parsed) || !parsed.every((item: unknown) => typeof item === 'string')) {
      return NextResponse.json({
        success: true,
        ingredients: [],
      });
    }

    const ingredients = parsed.map((s: string) => s.toLowerCase().trim()).filter(Boolean);

    return NextResponse.json({
      success: true,
      ingredients,
    });
  } catch (error) {
    console.error('[Scan Ingredients] ERROR:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scan ingredients',
      },
      { status: 500 }
    );
  }
}
