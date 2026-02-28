'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestDBPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testConnection() {
      try {
        console.log('Testing Supabase connection...');

        // Test 1: Check if client is initialized
        console.log('Supabase client:', supabase);

        // Test 2: Simple query
        const { data, error, count } = await supabase
          .from('guides')
          .select('*', { count: 'exact' });

        const result = {
          success: !error,
          error: error?.message,
          count: count,
          dataLength: data?.length || 0,
          sampleData: data?.[0],
          allTitles: data?.map(g => g.title) || []
        };

        console.log('Test result:', result);
        setResult(result);
      } catch (err) {
        console.error('Test error:', err);
        setResult({
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          exception: err
        });
      } finally {
        setLoading(false);
      }
    }

    testConnection();
  }, []);

  if (loading) {
    return <div className="p-8">Testing database connection...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Environment Variables:</h2>
        <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not Set'}</p>
        <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not Set'}</p>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Query Result:</h2>
        <pre className="whitespace-pre-wrap text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>

      {result?.success && result?.dataLength > 0 && (
        <div className="mt-4 bg-green-100 p-4 rounded">
          <h2 className="font-bold text-green-800 mb-2">✅ Connection Successful!</h2>
          <p>Found {result.dataLength} guides in the database</p>
          <ul className="mt-2 text-sm">
            {result.allTitles.slice(0, 5).map((title: string, i: number) => (
              <li key={i}>• {title}</li>
            ))}
            {result.allTitles.length > 5 && <li>... and {result.allTitles.length - 5} more</li>}
          </ul>
        </div>
      )}

      {result?.error && (
        <div className="mt-4 bg-red-100 p-4 rounded">
          <h2 className="font-bold text-red-800 mb-2">❌ Connection Failed</h2>
          <p className="text-red-700">{result.error}</p>
        </div>
      )}
    </div>
  );
}
