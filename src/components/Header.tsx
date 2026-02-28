'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';
import { Menu, X, ChevronDown, UtensilsCrossed, BookOpen, Sparkles, Lightbulb } from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b border-gray-100 transition-all duration-200 ${
          scrolled ? 'bg-white shadow-sm' : 'bg-white shadow-sm'
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 text-sm items-center">
            <Link
              href="/"
              className={`text-secondary hover:text-foreground transition-colors relative flex items-center gap-1.5 ${
                isActive('/') && pathname === '/' ? 'after:absolute after:bottom-[-12px] after:left-0 after:right-0 after:h-0.5 after:bg-primary' : ''
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              Recipes
            </Link>
            <Link
              href="/guides"
              className={`text-secondary hover:text-foreground transition-colors relative flex items-center gap-1.5 ${
                isActive('/guides') ? 'after:absolute after:bottom-[-12px] after:left-0 after:right-0 after:h-0.5 after:bg-primary' : ''
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Guides
            </Link>
            <Link
              href="/generate"
              className={`text-secondary hover:text-foreground transition-colors relative flex items-center gap-1.5 ${
                isActive('/generate') ? 'after:absolute after:bottom-[-12px] after:left-0 after:right-0 after:h-0.5 after:bg-primary' : ''
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Build a Recipe
            </Link>
            <Link
              href="/basics"
              className={`text-secondary hover:text-foreground transition-colors relative flex items-center gap-1.5 ${
                isActive('/basics') ? 'after:absolute after:bottom-[-12px] after:left-0 after:right-0 after:h-0.5 after:bg-primary' : ''
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              Stuff Nobody Tells You
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-full hover:bg-orange-700 transition-colors"
                >
                  <span>{user.user_metadata?.name || 'Account'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
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
                  </>
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
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-gray-700 hover:text-primary transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close Button */}
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-lg font-semibold">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation Links */}
        <nav className="flex flex-col p-4">
          <Link
            href="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/') && pathname === '/' ? 'bg-orange-50 text-primary' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <UtensilsCrossed className="w-5 h-5" />
            <span className="font-medium">Recipes</span>
          </Link>
          <Link
            href="/guides"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/guides') ? 'bg-orange-50 text-primary' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">Guides</span>
          </Link>
          <Link
            href="/generate"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/generate') ? 'bg-orange-50 text-primary' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Build a Recipe</span>
          </Link>
          <Link
            href="/basics"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/basics') ? 'bg-orange-50 text-primary' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Lightbulb className="w-5 h-5" />
            <span className="font-medium">Stuff Nobody Tells You</span>
          </Link>

          {/* Auth Buttons */}
          <div className="mt-6 pt-6 border-t space-y-3">
            {user ? (
              <>
                <div className="px-4 py-2 text-sm text-gray-600">
                  {user.email}
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthMode('signin');
                    setShowAuthModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-center text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setShowAuthModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-center bg-primary text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Join the Community
                </button>
              </>
            )}
          </div>
        </nav>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
}
