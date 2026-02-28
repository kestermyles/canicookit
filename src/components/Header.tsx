'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b border-gray-100 transition-all duration-200 ${
        scrolled ? 'bg-white shadow-sm' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-color.svg"
            alt="Can I Cook It"
            style={{ height: '60px', width: 'auto' }}
            className="mix-blend-darken"
          />
        </Link>
        <nav className="flex gap-6 text-sm items-center">
          <Link
            href="/"
            className={`text-secondary hover:text-foreground transition-colors relative ${
              isActive('/') && pathname === '/' ? 'after:absolute after:bottom-[-12px] after:left-0 after:right-0 after:h-0.5 after:bg-primary' : ''
            }`}
          >
            Recipes
          </Link>
          <Link
            href="/guides"
            className={`text-secondary hover:text-foreground transition-colors relative ${
              isActive('/guides') ? 'after:absolute after:bottom-[-12px] after:left-0 after:right-0 after:h-0.5 after:bg-primary' : ''
            }`}
          >
            Guides
          </Link>
          <Link
            href="/generate"
            className={`text-secondary hover:text-foreground transition-colors relative ${
              isActive('/generate') ? 'after:absolute after:bottom-[-12px] after:left-0 after:right-0 after:h-0.5 after:bg-primary' : ''
            }`}
          >
            Build a Recipe
          </Link>
          <Link
            href="/basics"
            className={`text-secondary hover:text-foreground transition-colors relative ${
              isActive('/basics') ? 'after:absolute after:bottom-[-12px] after:left-0 after:right-0 after:h-0.5 after:bg-primary' : ''
            }`}
          >
            Basics
          </Link>

          {!loading && (
            <>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-full hover:bg-orange-700 transition-colors"
                  >
                    <span>{user.user_metadata?.name || 'Account'}</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        {user.email}
                      </div>
                      <button
                        onClick={() => {
                          signOut();
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setAuthMode('signin');
                      setShowAuthModal(true);
                    }}
                    className="px-3 py-1.5 text-secondary hover:text-foreground transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuthModal(true);
                    }}
                    className="px-3 py-1.5 bg-primary text-white rounded-full hover:bg-orange-700 transition-colors"
                  >
                    Join the Community
                  </button>
                </div>
              )}
            </>
          )}
        </nav>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      </div>
    </header>
  );
}
