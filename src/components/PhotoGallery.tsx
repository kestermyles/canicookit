'use client';

import { useState, useEffect } from 'react';
import NoPhotoPlaceholder from './NoPhotoPlaceholder';

interface Photo {
  id: string;
  photo_url: string;
  uploaded_by_name: string;
  created_at: string;
}

interface PhotoGalleryProps {
  recipeSlug: string;
  heroImage?: string;
}

export default function PhotoGallery({ recipeSlug, heroImage }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    async function fetchPhotos() {
      try {
        const res = await fetch(`/api/recipe-photos?slug=${encodeURIComponent(recipeSlug)}`);
        const data = await res.json();
        if (data.success && data.photos.length > 0) {
          setPhotos(data.photos);
        }
      } catch (err) {
        console.error('Error fetching photos:', err);
      } finally {
        setLoaded(true);
      }
    }
    fetchPhotos();
  }, [recipeSlug]);

  // Build the list of all images: hero first (if exists), then community photos (deduped)
  const allImages: { url: string; label?: string }[] = [];

  if (heroImage) {
    allImages.push({ url: heroImage });
  }

  for (const p of photos) {
    if (!allImages.some((img) => img.url === p.photo_url)) {
      allImages.push({ url: p.photo_url, label: p.uploaded_by_name });
    }
  }

  // While loading, show hero if available, otherwise placeholder
  if (!loaded) {
    if (heroImage) {
      return (
        <div className="relative w-full h-64 md:h-96 bg-light-grey">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImage} alt="Recipe" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      );
    }
    return <NoPhotoPlaceholder size="large" />;
  }

  // No images at all
  if (allImages.length === 0) {
    return <NoPhotoPlaceholder size="large" />;
  }

  // Single image
  if (allImages.length === 1) {
    return (
      <div className="relative w-full h-64 md:h-96 bg-light-grey">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={allImages[0].url}
          alt="Recipe"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    );
  }

  // Multiple images — gallery
  const safeIndex = activeIndex < allImages.length ? activeIndex : 0;

  return (
    <div>
      {/* Main image */}
      <div className="relative w-full h-64 md:h-96 bg-light-grey">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={allImages[safeIndex].url}
          alt="Recipe"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-medium bg-black/50 text-white rounded-full">
          {allImages.length} photos
        </span>
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto py-2 px-4 md:px-0 scrollbar-hide">
        {allImages.map((img, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`flex-shrink-0 rounded-lg overflow-hidden transition-all ${
              i === safeIndex
                ? 'ring-2 ring-primary ring-offset-1 opacity-100'
                : 'opacity-60 hover:opacity-90'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.label || 'Recipe photo'}
              className="w-[120px] h-[80px] object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
