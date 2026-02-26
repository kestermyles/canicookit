import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Can I Cook It? — Simple Recipes for Real People',
    template: '%s | Can I Cook It?',
  },
  description:
    "Simple, delicious recipes with clear instructions. No fuss, no jargon — just food you'll actually want to cook.",
  metadataBase: new URL('https://canicookit.com'),
  icons: {
    icon: '/images/logo.jpg',
    apple: '/images/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
