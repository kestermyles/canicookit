import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.jpg"
              alt="Can I Cook It?"
              className="h-20 w-auto"
            />
          </Link>
          <div className="flex flex-col">
            <Link href="/" className="text-2xl font-bold text-foreground hover:text-secondary transition-colors">
              Can I Cook It?
            </Link>
            <span className="text-sm text-secondary">
              Global flavours, simply served
            </span>
          </div>
        </div>
        <nav className="flex gap-6 text-sm">
          <Link
            href="/"
            className="text-secondary hover:text-foreground transition-colors"
          >
            Recipes
          </Link>
          <Link
            href="/basics"
            className="text-secondary hover:text-foreground transition-colors"
          >
            Basics
          </Link>
        </nav>
      </div>
    </header>
  );
}
