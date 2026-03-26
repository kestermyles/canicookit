import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Can I Cook It? — a community recipe platform.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2 font-display">Terms of Service</h1>
      <p className="text-sm text-secondary mb-8">Last updated: 26 March 2026</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-3">About this site</h2>
          <p>
            Can I Cook It? (canicookit.com) is a community recipe platform where home cooks can
            discover, create and share recipes. By using this site you agree to these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Age requirement</h2>
          <p>You must be at least 13 years old to create an account or submit content.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Community content</h2>
          <p>
            Recipes and photos on this site are submitted by our community of home cooks and may
            also be AI-assisted. By submitting content you confirm it is your own original work and
            that you grant Can I Cook It? a licence to display it on the site. We reserve the right
            to remove any content at our discretion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Food safety</h2>
          <p>
            Recipes on this site are community-submitted and AI-assisted. Always follow safe food
            handling and preparation practices. Never consume anything you are unsure about. Can I
            Cook It? accepts no liability for any illness, injury or damage resulting from preparing
            or consuming recipes found on this site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Allergens</h2>
          <p>
            Always check ingredients carefully if you have food allergies or intolerances. We cannot
            guarantee that any recipe is free from any particular allergen. If in doubt, consult a
            medical professional.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">AI-generated content</h2>
          <p>
            Some recipes on this site are created with the assistance of artificial intelligence.
            While we strive for accuracy, AI-generated recipes should always be reviewed with common
            sense before following them.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Copyright</h2>
          <p>
            If you believe any content on this site infringes your copyright, please contact us at{' '}
            <a href="mailto:hello@canicookit.com" className="text-primary hover:underline">
              hello@canicookit.com
            </a>{' '}
            and we will review and remove it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Changes</h2>
          <p>
            We may update these terms from time to time. Continued use of the site means you accept
            any changes.
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
