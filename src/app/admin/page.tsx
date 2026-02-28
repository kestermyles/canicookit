'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Check, X, Trash2, EyeOff, Eye } from 'lucide-react';

interface Recipe {
  id: string;
  slug: string;
  title: string;
  cuisine: string;
  source: string;
  status: string;
  flagged?: boolean;
  created_at: string;
}

interface Comment {
  id: string;
  recipe_slug: string;
  name: string;
  comment: string;
  created_at: string;
  status: string;
}

interface RatingData {
  slug: string;
  title: string;
  average_rating: number;
  rating_count: number;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [flaggedRecipes, setFlaggedRecipes] = useState<Recipe[]>([]);
  const [lowRatedRecipes, setLowRatedRecipes] = useState<RatingData[]>([]);
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [aiGeneratedContent, setAiGeneratedContent] = useState<Recipe[]>([]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setAuthenticated(true);
        loadDashboardData();
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [flagged, lowRated, comments, aiContent] = await Promise.all([
        fetch('/api/admin/flagged-recipes').then(r => r.json()),
        fetch('/api/admin/low-rated-recipes').then(r => r.json()),
        fetch('/api/admin/pending-comments').then(r => r.json()),
        fetch('/api/admin/ai-generated-content').then(r => r.json()),
      ]);

      setFlaggedRecipes(flagged.recipes || []);
      setLowRatedRecipes(lowRated.recipes || []);
      setPendingComments(comments.comments || []);
      setAiGeneratedContent(aiContent.content || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const handleRecipeAction = async (slug: string, action: 'approve' | 'hide' | 'delete') => {
    try {
      const response = await fetch('/api/admin/recipe-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, action }),
      });

      if (response.ok) {
        loadDashboardData();
      }
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const handleCommentAction = async (commentId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/admin/comment-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, action }),
      });

      if (response.ok) {
        loadDashboardData();
      }
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter admin password"
                required
              />
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Flagged Recipes */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Flagged Recipes ({flaggedRecipes.length})
          </h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Recipe</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Cuisine</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Source</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {flaggedRecipes.map((recipe) => (
                  <tr key={recipe.slug}>
                    <td className="px-4 py-3">
                      <a href={`/recipes/${recipe.source === 'community' ? 'community/' : recipe.cuisine + '/'}${recipe.slug}`} target="_blank" className="text-blue-600 hover:underline">
                        {recipe.title}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm">{recipe.cuisine}</td>
                    <td className="px-4 py-3 text-sm">{recipe.source}</td>
                    <td className="px-4 py-3 text-sm">{new Date(recipe.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleRecipeAction(recipe.slug, 'approve')} className="mr-2 p-1 text-green-600 hover:bg-green-50 rounded" title="Approve">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleRecipeAction(recipe.slug, 'hide')} className="mr-2 p-1 text-yellow-600 hover:bg-yellow-50 rounded" title="Hide">
                        <EyeOff className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleRecipeAction(recipe.slug, 'delete')} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {flaggedRecipes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No flagged recipes</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Low Rated Recipes */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Low Rated Recipes (Under 2★ with 3+ ratings)</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Recipe</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Rating</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Count</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {lowRatedRecipes.map((recipe) => (
                  <tr key={recipe.slug}>
                    <td className="px-4 py-3">
                      <a href={`/recipes/community/${recipe.slug}`} target="_blank" className="text-blue-600 hover:underline">
                        {recipe.title}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm">{recipe.average_rating.toFixed(1)}★</td>
                    <td className="px-4 py-3 text-sm">{recipe.rating_count} ratings</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleRecipeAction(recipe.slug, 'hide')} className="mr-2 p-1 text-yellow-600 hover:bg-yellow-50 rounded" title="Hide">
                        <EyeOff className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleRecipeAction(recipe.slug, 'delete')} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {lowRatedRecipes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No low-rated recipes</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pending Comments */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Pending Comments ({pendingComments.length})</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Comment</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Recipe</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pendingComments.map((comment) => (
                  <tr key={comment.id}>
                    <td className="px-4 py-3 text-sm font-medium">{comment.name}</td>
                    <td className="px-4 py-3 text-sm max-w-md truncate">{comment.comment}</td>
                    <td className="px-4 py-3 text-sm">
                      <a href={`/recipes/community/${comment.recipe_slug}`} target="_blank" className="text-blue-600 hover:underline">
                        View recipe
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm">{new Date(comment.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleCommentAction(comment.id, 'approve')} className="mr-2 p-1 text-green-600 hover:bg-green-50 rounded" title="Approve">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleCommentAction(comment.id, 'reject')} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Reject">
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {pendingComments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No pending comments</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* AI-Generated Content */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Recently AI-Generated Content ({aiGeneratedContent.length})</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {aiGeneratedContent.map((item) => (
                  <tr key={item.slug}>
                    <td className="px-4 py-3">
                      <a href={item.source === 'guide' ? `/guides/${item.slug}` : `/recipes/community/${item.slug}`} target="_blank" className="text-blue-600 hover:underline">
                        {item.title}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm">{item.source === 'guide' ? 'Guide' : 'Recipe'}</td>
                    <td className="px-4 py-3 text-sm">{item.status}</td>
                    <td className="px-4 py-3 text-sm">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleRecipeAction(item.slug, 'hide')} className="mr-2 p-1 text-yellow-600 hover:bg-yellow-50 rounded" title="Hide">
                        <EyeOff className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleRecipeAction(item.slug, 'delete')} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {aiGeneratedContent.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No recent AI-generated content</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
