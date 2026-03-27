import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Can I Cook It? — how we handle your data.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2 font-display">Privacy Policy</h1>
      <p className="text-sm text-secondary mb-8">Last updated: 26 March 2026</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-3">What we collect</h2>
          <p>
            When you create an account we collect your name and email address. When you submit
            recipes or photos we store that content. We also collect standard web analytics data
            (pages visited, device type).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">How we use it</h2>
          <p>
            We use your data to run the site, credit your contributions, and send you occasional
            emails about the community (you can unsubscribe at any time).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">How we store it</h2>
          <p>
            Your data is stored securely using Supabase. We do not sell your data to anyone, ever.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Cookies</h2>
          <p className="mb-3">
            We use a small number of essential cookies to keep you logged in and remember your
            preferences. We do not currently use advertising or tracking cookies.
          </p>
          <p className="mb-3">
            If we introduce advertising in the future, it may involve personalised ads based on your
            browsing behaviour, served by third parties such as Google. Before any such cookies are
            set, we will ask for your explicit consent — you will always have a choice, and you can
            change your mind at any time.
          </p>
          <p>
            You can manage or clear cookies in your browser settings at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Your rights (GDPR)</h2>
          <p>
            If you are based in the UK or EU you have the right to access, correct or delete your
            personal data at any time. Email us at{' '}
            <a href="mailto:hello@canicookit.com" className="text-primary hover:underline">
              hello@canicookit.com
            </a>{' '}
            and we will action your request within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Third parties</h2>
          <p>
            We use the following services: Supabase (data storage), Vercel (hosting), Anthropic (AI
            recipe generation). None of these services receive your personal data beyond what is
            necessary to run the site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Contact</h2>
          <p>
            <a href="mailto:hello@canicookit.com" className="text-primary hover:underline">
              hello@canicookit.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
