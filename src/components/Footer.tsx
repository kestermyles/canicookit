import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-color.svg"
              alt="Can I Cook It"
              className="h-12 mb-3 mix-blend-darken"
            />
            <p className="text-sm text-secondary">
              Great recipes. Great cooks. Great food.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/recipes" className="text-secondary hover:text-primary transition-colors">
                  Recipes
                </Link>
              </li>
              <li>
                <Link href="/generate" className="text-secondary hover:text-primary transition-colors">
                  Generate a Recipe
                </Link>
              </li>
              <li>
                <Link href="/basics" className="text-secondary hover:text-primary transition-colors">
                  Stuff Nobody Tells You
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Get in Touch</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:hello@canicookit.com"
                  className="text-secondary hover:text-primary transition-colors"
                >
                  hello@canicookit.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-100 pt-6 text-center text-sm text-secondary">
          <p>&copy; {new Date().getFullYear()} Can I Cook It? All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
