'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function WelcomeBack() {
  const { user, loading } = useAuth();

  if (loading || !user) return null;

  const username = user.user_metadata?.username || user.user_metadata?.name;
  if (!username) return null;

  return (
    <p className="text-lg text-secondary mb-6">
      Welcome back, <span className="font-semibold text-foreground">{username}</span>!
    </p>
  );
}
