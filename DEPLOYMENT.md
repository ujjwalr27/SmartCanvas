# 🚀 Deploying SmartCanvas

This guide will help you deploy SmartCanvas to production. **Vercel** is the recommended platform as it's built by the same team behind Next.js.

## 📋 Prerequisites

Ensure you have:
1.  A [GitHub](https://github.com/) account (to host your code)
2.  A [Vercel](https://vercel.com/) account
3.  Your **Supabase** project URL and Anon Key
4.  Your **Google Gemini** API Key

---

## ☁️ Option 1: Deploy to Vercel (Recommended)

### 1. Push Code to GitHub
If you haven't already, push your project to a GitHub repository:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 2. Connect to Vercel
1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your SmartCanvas repository from GitHub.

### 3. Configure Project
Vercel will automatically detect that this is a Next.js project. You don't need to change the build commands.

### 4. Setup Environment Variables
In the **"Environment Variables"** section during import (or in Settings > Environment Variables later), add the following:

| Name | Value |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key |
| `GOOGLE_GEMINI_API_KEY` | Your Google Gemini API Key |
| `NEXT_PUBLIC_APP_URL` | Your production URL (e.g., `https://smartcanvas-yourname.vercel.app`) |

*Optional:*
*   `HUGGINGFACE_API_TOKEN` (if you are using Hugging Face features)

### 5. Deploy
Click **"Deploy"**. Vercel will build your application and deploy it. It usually takes 1-2 minutes.

---

## ⚙️ Post-Deployment Checks

### 1. Update Supabase Auth Settings
After deploying, you need to tell Supabase your new website URL so authentication works.

1.  Go to your **Supabase Dashboard** > **Authentication** > **URL Configuration**.
2.  Add your Vercel URL (e.g., `https://smartcanvas-yourname.vercel.app`) to **Site URL**.
3.  Add it to **Redirect URLs** as well (including `https://smartcanvas-yourname.vercel.app/**` just in case).
4.  Click **Save**.

### 2. Verify Features
Visit your live site and test:
*   [ ] **Login/Signup**: Create a new account.
*   [ ] **Dashboard**: Ensure your empty dashboard loads.
*   [ ] **Editor**: Create a new design.
*   [ ] **AI Generation**: Test the "Generate Layout" wizard.
*   [ ] **Saving**: Save a design and check if it appears in the dashboard.

---

## 🛠️ Troubleshooting Common Issues

### Build Failed: "Canvas" Module
If you see errors related to `canvas` or `fabric` during build:
*   SmartCanvas is already configured to handle this in `next.config.js` via `config.externals`.
*   If issues persist, ensure you are not importing `fabric` directly in server components. Always use `dynamic import` for the editor components (which we have already done).

### 404 on Refresh
If you refresh a page like `/editor/new` and get a 404:
*   This shouldn't happen on Vercel as it handles Next.js routing automatically.

### Images Not Loading
*   If images from Supabase or external URLs aren't loading, check `next.config.js`. We have already configured it to allow `supabase.co` domains.
