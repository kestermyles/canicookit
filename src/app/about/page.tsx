import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Can I Cook It?',
  description: 'The story behind Can I Cook It? — a community recipe platform built for real people, real kitchens, and real results.',
};

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-start">
        {/* Photo — top on mobile, right on desktop */}
        <div className="md:col-span-2 md:order-2">
          <div
            style={{
              maskImage: 'radial-gradient(ellipse 90% 90% at 50% 40%, black 40%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 40%, black 40%, transparent 80%)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/kester.jpg"
              alt="Kester, founder of Can I Cook It?"
              className="w-full max-w-md mx-auto object-cover rounded-lg"
              style={{ aspectRatio: '3/4' }}
            />
          </div>
          <p className="text-center text-sm text-gray-400 italic mt-2">Yes, that&apos;s a brisket.</p>
        </div>

        {/* Text — below photo on mobile, left on desktop */}
        <div className="md:col-span-3 md:order-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 font-display">
            About Can I Cook It?
          </h1>
          <p className="text-2xl text-secondary mb-8 font-handwritten">
            Real cooking. Real people. Real results.
          </p>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>
              I&apos;ve spent years cooking. It&apos;s one of the great constants of my
              life — something I come back to whether I&apos;m attempting something
              ambitious or just seeing what I can pull together from whatever&apos;s in
              the fridge. I love both equally.
            </p>

            <p>
              But cooking isn&apos;t always straightforward. Even experienced cooks hit
              moments where they&apos;re not quite sure — what to do with an unfamiliar
              ingredient, how to adapt something they&apos;ve made a hundred times, or
              simply what on earth to cook tonight. And for people who are just starting
              out, or who&apos;ve never really had anyone show them, it can feel genuinely
              out of reach.
            </p>

            <p>
              I built Can I Cook It? for my son and his friends heading off to university.
              For my sister and my nephew, who love the food I make and always want to
              know how. For anyone who&apos;s ever stood in front of a fridge and not known
              where to start — and for the confident cook who just wants a fresh idea.
            </p>

            <p>
              This is a community built around real cooking. Not perfect studio shots and
              unattainable recipes, though beautiful food photography is absolutely welcome
              here. It&apos;s about real people, real kitchens, real results. Tell us what
              you&apos;ve got — type it in, photograph your fridge, snap a shopping list —
              and we&apos;ll build something around it. Ask questions as you go. We&apos;re
              here the whole way through.
            </p>

            <p>
              Every recipe is checked. Nothing is copied. This is about creativity,
              accessibility and the joy of cooking — at whatever level you&apos;re at.
            </p>

            <p>
              If you&apos;re a Michelin-starred chef and you want to contribute, we&apos;d
              love that. If you&apos;re a student making your first proper meal, we&apos;d
              love that even more. Food is for everyone. So is this.
            </p>

            <p className="text-2xl pt-4 font-handwritten">— Kester</p>
          </div>
        </div>
      </div>
    </div>
  );
}
