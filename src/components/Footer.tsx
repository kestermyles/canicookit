export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-secondary">
        <p>
          &copy; {new Date().getFullYear()} Can I Cook It? All rights reserved.
        </p>
      </div>
    </footer>
  );
}
