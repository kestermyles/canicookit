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
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ea580c;">Welcome${name ? `, ${name}` : ''}!</h1>
          <p>Thanks for joining the Can I Cook It community.</p>
          <p>You can now:</p>
          <ul>
            <li>Share your photos and get featured on the homepage</li>
            <li>Rate and comment on recipes</li>
            <li>Be part of a community of real cooks</li>
          </ul>
          <p>Happy cooking!</p>
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
