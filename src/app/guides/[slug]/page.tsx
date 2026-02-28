import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getGuideBySlug, getFeaturedGuides } from '@/lib/supabase';
import {
  Clock,
  Lightbulb,
  BookOpen,
  Scissors,
  Wheat,
  Users,
  ChefHat,
  Flame,
  Timer,
  UtensilsCrossed,
  Thermometer,
  Scale,
  EggFried,
  Fish,
  Soup,
  Cookie,
  ShoppingCart,
  ArrowLeft,
  Milk,
  PartyPopper,
  Apple,
  Carrot,
  Leaf,
  Pizza,
  CakeSlice,
  Wine,
  Coffee,
  Sparkles,
  FlaskConical,
  Croissant,
  Package,
  AlertTriangle,
  Utensils
} from 'lucide-react';

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

// Map guide slugs to specific contextual Lucide icons
function getGuideIcon(slug: string, className: string = 'w-12 h-12') {
  // Slug-based mapping (most specific)
  const slugIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'caramelise-onions': Flame,
    'perfect-rice': Utensils,
    'season-food-properly': Sparkles,
    'rest-meat-properly': Timer,
    'cook-fish-without-ruining': Fish,
    'build-flavour-in-sauce': FlaskConical,
    'cook-pasta-perfectly': UtensilsCrossed,
    'make-good-stock': Soup,
    'store-fresh-herbs': Leaf,
    'make-pastry-without-fear': Croissant,
    'sharpen-and-care-for-knives': Scissors,
    'meal-prep-for-week': Package,
    'read-recipe-properly': BookOpen,
    'save-dish-gone-wrong': AlertTriangle,
    'grazing-table': ChefHat,
    'set-dinner-table': UtensilsCrossed,
    'dinner-party-budget': PartyPopper,
    'cook-for-crowd-without-stress': Users,
  };

  const IconComponent = slugIconMap[slug] || BookOpen;
  return <IconComponent className={className} />;
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
                <div className="text-white">{getGuideIcon(guide.slug, 'w-14 h-14 text-white')}</div>
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
                  <Clock className="w-5 h-5" />
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
              <div>{getGuideIcon(guide.slug, 'w-20 h-20 text-primary')}</div>
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
                <Clock className="w-5 h-5" />
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
            <Lightbulb className="w-6 h-6 text-primary" />
            Pro Tips
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
            <ArrowLeft className="w-5 h-5" />
            Back to All Guides
          </Link>
        </div>
      </div>
    </>
  );
}
