'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

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
        <Link href="/">
          <Image
            src="/images/logo-color.png"
            alt="Can I Cook It"
            width={80}
            height={80}
            className="object-contain"
          />
        </Link>
        <nav className="flex gap-6 text-sm">
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
        </nav>
      </div>
    </header>
  );
}
