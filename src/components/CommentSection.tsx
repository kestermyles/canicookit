'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';
import PhotoUpload, { PhotoUploadHandle } from './PhotoUpload';
import { supabase } from '@/lib/supabase';

interface Comment {
  id: string;
  name: string;
  comment: string;
  created_at: string;
}

interface CommentSectionProps {
  recipeSlug: string;
}

function StarRatingInput({ rating, hoverRating, onRate, onHover, onLeave }: {
  rating: number;
  hoverRating: number;
  onRate: (r: number) => void;
  onHover: (r: number) => void;
  onLeave: () => void;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-gray-700">Rate this recipe <span className="text-gray-400 font-normal">(optional)</span></p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            onMouseEnter={() => onHover(star)}
            onMouseLeave={onLeave}
            className="text-2xl transition-transform hover:scale-110 focus:outline-none"
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            <span className={(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}>
              ★
            </span>
          </button>
        ))}
        {rating > 0 && (
          <button
            type="button"
            onClick={() => onRate(0)}
            className="text-xs text-gray-400 hover:text-gray-600 ml-1 self-center"
          >
            clear
          </button>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ recipeSlug }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [photos, setPhotos] = useState<any[]>([]);
  const photoRef = useRef<PhotoUploadHandle>(null);

  const displayName = user
    ? user.user_metadata?.username || user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous'
    : '';

  // Pre-fill name with username for logged-in users
  useEffect(() => {
    if (user && displayName) {
      setName(displayName);
    }
  }, [user, displayName]);

  // Load comments on mount
  useEffect(() => {
    loadComments();
  }, [recipeSlug]);

  // Load approved photos for this recipe
  useEffect(() => {
    supabase
      .from('recipe_photos')
      .select('*')
      .eq('recipe_slug', recipeSlug)
      .eq('status', 'approved')
      .order('sort_order', { ascending: true })
      .then(({ data }) => setPhotos(data || []));
  }, [recipeSlug]);

  const loadComments = async () => {
    try {
      const response = await fetch(
        `/api/comments?recipeSlug=${encodeURIComponent(recipeSlug)}`
      );
      const data = await response.json();

      if (data.success) {
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasPhoto = photoRef.current?.hasFile;
    const hasComment = comment.trim().length > 0;

    if (!hasPhoto && !hasComment) {
      setError('Add a photo or comment to share');
      return;
    }

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Upload photo if one is selected
      if (hasPhoto) {
        const photoOk = await photoRef.current!.upload(name.trim(), recipeSlug);
        if (!photoOk) {
          setSubmitting(false);
          return;
        }
      }

      // Submit comment if one was written
      if (hasComment) {
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipeSlug,
            name: name.trim(),
            comment: comment.trim(),
            rating: rating > 0 ? rating : null,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          setError(result.error || 'Failed to submit comment');
          setSubmitting(false);
          return;
        }
      }

      // Success
      setSuccess(true);
      if (!user) setShowSignupPrompt(true);
      setComment('');
      setRating(0);
      if (!user) setName('');
      photoRef.current?.reset();

      await loadComments();

      // Reload photos to pick up newly uploaded ones
      supabase
        .from('recipe_photos')
        .select('*')
        .eq('recipe_slug', recipeSlug)
        .eq('status', 'approved')
        .order('sort_order', { ascending: true })
        .then(({ data }) => setPhotos(data || []));

      setTimeout(() => setSuccess(false), 5000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Unified Share Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Made this? Share it!</h3>

        <div className="space-y-4">
          {/* Photo Upload */}
          <PhotoUpload ref={photoRef} />
          <p className="text-xs text-gray-500 -mt-2">Add up to 6 photos — share your steps and the finished dish!</p>

          <StarRatingInput
            rating={rating}
            hoverRating={hoverRating}
            onRate={setRating}
            onHover={setHoverRating}
            onLeave={() => setHoverRating(0)}
          />

          {/* Name - show input for guests, plain text for logged-in users */}
          {user && displayName ? (
            <p className="text-sm text-gray-600">
              Commenting as <span className="font-semibold text-foreground">{displayName}</span>
            </p>
          ) : (
            <div>
              <label
                htmlFor="commentName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Name
              </label>
              <input
                type="text"
                id="commentName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Alex"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={submitting}
                maxLength={50}
              />
            </div>
          )}

          {/* Comment textarea */}
          <div>
            <textarea
              id="commentText"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts, tips, or how it turned out..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              disabled={submitting}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-color.svg" alt="Can I Cook It" className="h-12 mx-auto mb-2" />
              <p className="text-sm font-bold text-primary">Can I Cook It?</p>
              <p className="text-lg font-bold text-green-700">Yes You Can!</p>
              <p className="text-sm text-gray-600">Thanks for sharing!</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !name.trim() || (!comment.trim() && !photoRef.current?.hasFile)}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Sharing...' : 'I Cooked It!'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Comments ({comments.length})
        </h3>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">Nobody&apos;s cooked this yet — be the first and tell us how it went!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(c.created_at)}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{c.comment}</p>
                {(() => {
                  const commentPhotos = photos.filter(p =>
                    p.uploaded_by_name === c.name &&
                    Math.abs(new Date(p.created_at).getTime() - new Date(c.created_at).getTime()) < 120000
                  );
                  if (commentPhotos.length === 0) return null;
                  return (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                      {commentPhotos.map((p: any) => (
                        <div key={p.id} className="flex-shrink-0 text-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.photo_url} alt={p.step_label} className="w-20 h-20 object-cover rounded-lg" />
                          <p className="text-xs text-gray-500 mt-1">{p.step_label}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>

      <AuthModal
        isOpen={showSignupPrompt}
        onClose={() => setShowSignupPrompt(false)}
        initialMode="signup"
        context="comment"
      />
    </div>
  );
}
