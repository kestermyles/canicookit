'use client';

import { useState, useEffect } from 'react';

interface FlaggedPhoto {
  id: string;
  recipe_slug: string;
  recipe_title: string;
  photo_url: string;
  quality_score: number | null;
  authenticity_score: number | null;
  authenticity_flag: string | null;
  uploaded_by_name: string | null;
  created_at: string;
}

export default function FlaggedPhotosPage() {
  const [photos, setPhotos] = useState<FlaggedPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  async function fetchPhotos() {
    try {
      const res = await fetch('/api/admin/flagged-photos');
      const data = await res.json();
      if (data.success) {
        setPhotos(data.photos);
      }
    } catch (err) {
      console.error('Failed to fetch flagged photos:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(photoId: string, action: 'approve' | 'delete') {
    setActionLoading(photoId);
    try {
      const res = await fetch('/api/admin/photo-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, action }),
      });
      const data = await res.json();
      if (data.success) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      }
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Flagged Photos</h1>
      <p className="text-secondary mb-8">
        Photos flagged as likely AI-generated or stock photos. Review and approve or delete.
      </p>

      {loading ? (
        <p className="text-secondary">Loading...</p>
      ) : photos.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-lg text-secondary">No flagged photos to review</p>
        </div>
      ) : (
        <div className="space-y-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="border border-gray-200 rounded-lg p-6 flex gap-6 items-start"
            >
              {/* Photo */}
              <div className="flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.photo_url}
                  alt="Flagged upload"
                  className="w-48 h-48 object-cover rounded-lg border border-gray-200"
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1">{photo.recipe_title}</h3>
                <p className="text-sm text-secondary mb-3">
                  Uploaded by {photo.uploaded_by_name || 'Anonymous'} on{' '}
                  {new Date(photo.created_at).toLocaleDateString()}
                </p>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Flag:</span>{' '}
                    <span className="text-red-600 font-medium">{photo.authenticity_flag}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Confidence:</span>{' '}
                    <span className="font-medium">{photo.authenticity_score}%</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Quality score:</span>{' '}
                    {photo.quality_score ?? 'N/A'}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(photo.id, 'approve')}
                    disabled={actionLoading === photo.id}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === photo.id ? '...' : 'Approve anyway'}
                  </button>
                  <button
                    onClick={() => handleAction(photo.id, 'delete')}
                    disabled={actionLoading === photo.id}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === photo.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
