# Setup Instructions for SmartCanvas

Follow these steps to get SmartCanvas running locally.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account (free)
- Google AI Studio API key (free)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API**
3. Copy your:
   - Project URL
   - Anon/Public Key
   - Service Role Key

### 3. Run Database Migration

1. Go to **SQL Editor** in Supabase
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Execute the script

### 4. Create Storage Bucket

1. Go to **Storage** in Supabase
2. Create a new bucket named `assets`
3. Make it **public**

### 5. Get Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

### 6. Configure Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini
GOOGLE_GEMINI_API_KEY=your-gemini-api-key

# Hugging Face (optional)
HUGGINGFACE_API_TOKEN=your-hf-token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Troubleshooting

### Fabric.js Build Errors

If you encounter canvas-related errors:

```bash
npm install --legacy-peer-deps
```

### Supabase Connection Issues

1. Check your environment variables
2. Verify RLS policies are enabled
3. Ensure storage bucket is public

### Gemini API Rate Limits

Free tier: 1,500 requests/day
If exceeded, wait 24 hours or upgrade

## Next Steps

1. Sign up for an account
2. Create a brand kit
3. Generate your first design!

## Need Help?

See README.md for detailed documentation
