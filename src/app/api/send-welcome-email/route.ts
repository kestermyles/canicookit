import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: 'Can I Cook It <hello@canicookit.com>',
      to: email,
      subject: 'Welcome to Can I Cook It!',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #ea580c; font-size: 28px; margin: 0;">Can I Cook It?</h1>
            <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Great recipes. Great cooks. Great food.</p>
          </div>
          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px;">
            <h2 style="color: #1a1a1a; font-size: 22px; margin-top: 0;">Welcome${name ? `, ${name}` : ''}!</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">Thanks for joining the Can I Cook It community. Here's what you can do:</p>
            <ul style="color: #374151; font-size: 14px; line-height: 2; padding-left: 20px;">
              <li>Your name and username displayed on every contribution</li>
              <li>Share your photos and get featured on the homepage</li>
              <li>Eligible for Recipe of the Week and Photo of the Week</li>
              <li>Earn your Community Chef status</li>
              <li>Be part of a community of real cooks</li>
            </ul>
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://www.canicookit.com" style="display: inline-block; background-color: #ea580c; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 9999px;">Go to Can I Cook It</a>
            </div>
            <p style="color: #6b7280; font-size: 14px; text-align: center;">Happy cooking!</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
