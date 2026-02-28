import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getGuideBySlug, getFeaturedGuides } from '@/lib/supabase';

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const guides = await getFeaturedGuides();
  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const guide = await getGuideBySlug(params.slug);
  if (!guide) return {};

  return {
    title: guide.title,
    description: guide.description,
  };
}

export default async function GuidePage({ params }: PageProps) {
  const guide = await getGuideBySlug(params.slug);

  if (!guide) {
    notFound();
  }

  return (
    <>
      {/* Hero Section */}
      {guide.cover_image ? (
        <div className="relative h-[400px] md:h-[500px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={guide.cover_image}
            alt={guide.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
          <div className="relative h-full max-w-4xl mx-auto px-4 flex items-end pb-16">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-5xl">{guide.icon}</div>
                {guide.source === 'ai-generated' && (
                  <span className="px-3 py-1 text-xs bg-orange-500/90 backdrop-blur-sm text-white rounded-full">
                    AI Generated
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
                {guide.title}
              </h1>
              <p className="text-lg text-white/90 max-w-2xl mb-4">
                {guide.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {guide.read_time}
                </div>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                  {guide.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="text-6xl">{guide.icon}</div>
              {guide.source === 'ai-generated' && (
                <span className="px-3 py-1 text-xs bg-orange-500 text-white rounded-full">
                  AI Generated
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
              {guide.title}
            </h1>
            <p className="text-lg text-secondary max-w-2xl mx-auto mb-4">
              {guide.description}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-secondary">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {guide.read_time}
              </div>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                {guide.category}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="mb-12">
          <p className="text-lg leading-relaxed text-foreground">
            {guide.intro}
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 mb-12">
          {guide.steps.map((step: any) => (
            <div
              key={step.number}
              className="bg-light-grey/50 rounded-xl p-6 border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-foreground leading-relaxed">{step.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pro Tips */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 mb-12 border-l-4 border-primary">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>💡</span> Pro Tips
          </h2>
          <ul className="space-y-3">
            {guide.pro_tips.map((tip: string, index: number) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-foreground leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Related Recipes */}
        {guide.related_recipes.length > 0 && (
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold mb-6 font-display">
              Related Recipes
            </h2>
            <div className="flex flex-wrap gap-3">
              {guide.related_recipes.map((cuisine: string) => (
                <Link
                  key={cuisine}
                  href={`/recipes/cuisine/${cuisine}`}
                  className="px-4 py-2 rounded-full bg-light-grey text-foreground hover:bg-primary hover:text-white transition-colors capitalize"
                >
                  {cuisine}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to Guides */}
        <div className="mt-12 text-center">
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 text-primary hover:text-orange-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Guides
          </Link>
        </div>
      </div>
    </>
  );
}
