import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, recipeTitle, ingredients, recipeSlug, subscribeToNewsletter } =
      await request.json();

    if (!email || !recipeTitle || !ingredients?.length) {
      return NextResponse.json(
        { error: 'Email, recipe title, and ingredients are required' },
        { status: 400 }
      );
    }

    const recipeUrl = recipeSlug
      ? `https://www.canicookit.com/recipes/community/${recipeSlug}`
      : 'https://www.canicookit.com';

    const ingredientListHtml = ingredients
      .map(
        (ing: string) =>
          `<li style="padding: 6px 0; border-bottom: 1px solid #f3f4f6; color: #374151; font-size: 15px;">${ing}</li>`
      )
      .join('');

    const { error } = await resend.emails.send({
      from: 'Can I Cook It <hello@canicookit.com>',
      to: email,
      subject: `Your shopping list for ${recipeTitle}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #ea580c; font-size: 28px; margin: 0;">Can I Cook It?</h1>
          </div>

          <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 32px;">
            <h2 style="color: #1a1a1a; font-size: 20px; margin-top: 0; margin-bottom: 4px;">Your shopping list</h2>
            <p style="color: #6b7280; font-size: 14px; margin-top: 0; margin-bottom: 24px;">for ${recipeTitle}</p>

            <ul style="list-style: none; padding: 0; margin: 0;">
              ${ingredientListHtml}
            </ul>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${recipeUrl}" style="display: inline-block; background-color: #ea580c; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 9999px;">View the full recipe &rarr;</a>
          </div>

          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-bottom: 0;">
            Happy cooking! &mdash; The Can I Cook It? team
          </p>

          <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 16px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              You received this because you requested a shopping list from
              <a href="https://www.canicookit.com" style="color: #9ca3af;">canicookit.com</a>.
              No further emails will be sent unless you subscribed.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // Upsert newsletter subscription if opted in
    if (subscribeToNewsletter) {
      try {
        await supabase.from('newsletter_subscribers').upsert(
          { email, subscribed_at: new Date().toISOString() },
          { onConflict: 'email' }
        );
      } catch (err) {
        // Don't fail the request if newsletter upsert fails
        console.error('Newsletter subscription error:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Shopping list email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
