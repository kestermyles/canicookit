# Supabase Setup Guide

Follow these steps to set up the Supabase backend for Can I Cook It.

## 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - Name: `canicookit` (or your preferred name)
   - Database Password: (generate a strong password and save it)
   - Region: Choose closest to your users
5. Click "Create new project" and wait 2-3 minutes for provisioning

## 2. Run Database Schema

1. In your Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql`
4. Paste into the query editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. Verify success: You should see "Success. No rows returned"

## 3. Create Storage Bucket

1. Click "Storage" in the left sidebar
2. Click "Create a new bucket"
3. Fill in:
   - Name: `recipe-photos`
   - Public bucket: ✅ (checked)
   - File size limit: 2MB
   - Allowed MIME types: `image/jpeg,image/png,image/webp`
4. Click "Create bucket"

## 4. Configure Storage Policies

1. Click on the `recipe-photos` bucket
2. Click "Policies" tab
3. Click "New policy"
4. Create two policies:

**Policy 1: Public Read**
- Policy name: `Public can view photos`
- Allowed operation: SELECT
- Target roles: public
- USING expression: `true`

**Policy 2: Public Upload**
- Policy name: `Public can upload photos`
- Allowed operation: INSERT
- Target roles: public
- WITH CHECK expression: `true`

## 5. Get Your Credentials

1. Click "Settings" (gear icon) in the left sidebar
2. Click "API" under Configuration
3. Copy these values:

   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGci...` (long string)
   - **service_role key**: `eyJhbGci...` (different long string - keep this secret!)

## 6. Update Environment Variables

Add these to your `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Google AdSense (add later when ready)
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT=ca-pub-xxx
```

## 7. Verify Setup

Run this in your Supabase SQL Editor to verify tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

You should see:
- `generated_recipes`
- `comments`
- `recipe_photos`

## Troubleshooting

**Error: "relation already exists"**
- Tables were already created. You can drop and recreate if needed:
  ```sql
  DROP TABLE IF EXISTS recipe_photos CASCADE;
  DROP TABLE IF EXISTS comments CASCADE;
  DROP TABLE IF EXISTS generated_recipes CASCADE;
  ```
  Then run the schema again.

**Error: "permission denied"**
- Make sure you're running the query in the SQL Editor, not as a client
- Verify you're logged into the correct project

**Storage bucket not working**
- Verify the bucket is marked as "Public"
- Check that policies are created correctly
- Test upload with: Storage > recipe-photos > Upload file

## Next Steps

Once your `.env.local` is updated with the Supabase credentials:

1. Restart your Next.js dev server: `npm run dev`
2. The app will now connect to Supabase
3. Test by generating a recipe - it should save to the database
