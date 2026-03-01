'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const benefits = [
  'Your name and username displayed on every contribution',
  'Share your photos and get featured on the homepage',
  'Eligible for Recipe of the Week and Photo of the Week',
  'Earn your Community Chef status',
  'Be part of a community of real cooks',
];

export default function WelcomePage() {
  const { user, loading } = useAuth();

  const username = user?.user_metadata?.username || user?.user_metadata?.name || 'Chef';

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        {/* Logo */}
        <img
          src="/images/logo-color.svg"
          alt="Can I Cook It"
          className="h-20 mx-auto mb-4"
        />
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">
          Can I Cook It?
        </h1>

        {/* Welcome message */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {loading ? (
            <p className="text-lg text-secondary">Loading...</p>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {user
                  ? `Welcome to the community, ${username}!`
                  : 'Welcome to the community!'}
              </h2>
              <p className="text-secondary mb-6">
                {user
                  ? "Your email is confirmed. Here's what you can do now:"
                  : "Here's what our community members can do:"}
              </p>

              <div className="text-left space-y-3 mb-8">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/recipes"
                className="inline-block px-8 py-4 bg-primary text-white text-lg font-semibold rounded-full hover:bg-orange-700 transition-colors"
              >
                Start exploring recipes
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
