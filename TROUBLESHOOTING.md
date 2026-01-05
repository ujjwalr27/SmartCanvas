# SmartCanvas - Troubleshooting Guide

## Common Issues and Solutions

### 1. Gemini API 429 Error (Quota Exceeded)

**Error Message:**
```
Error: [429 Too Many Requests] You exceeded your current quota
```

**Causes:**
- Using experimental model (`gemini-2.0-flash-exp`) which has limited free tier
- Exceeded daily quota (1,500 requests/day for free tier)
- Rate limiting (15 requests/minute)

**Solutions:**

#### Option 1: Use Stable Model (Recommended)
The app now uses `gemini-1.5-flash` which has better free tier support.

#### Option 2: Wait and Retry
If you hit rate limits, wait 30-60 seconds and try again.

#### Option 3: Demo Mode Fallback
The app automatically provides demo layouts when API fails. You'll see:
- Pre-generated layout templates
- Sample copy suggestions
- Basic rule-based compliance checks

**Check Your Usage:**
Visit [Google AI Studio Usage](https://aistudio.google.com/app/apikey) to monitor quota.

---

### 2. Supabase Connection Errors

**Error:** `Failed to connect to Supabase`

**Solutions:**
1. Check environment variables in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   ```

2. Verify project is active at [supabase.com](https://supabase.com)

3. Run database migration:
   - Go to SQL Editor in Supabase
   - Execute `supabase/migrations/001_initial_schema.sql`

---

### 3. Canvas Not Rendering

**Error:** Blank white screen in editor

**Solutions:**
1. Check browser console for errors
2. Verify Fabric.js loaded (check Network tab)
3. Clear cache and hard reload (Ctrl+Shift+R)
4. Try different browser (Chrome recommended)

---

### 4. Image Upload Fails

**Error:** `Failed to upload asset`

**Solutions:**
1. Create `assets` storage bucket in Supabase:
   - Go to Storage
   - Create new bucket named `assets`
   - Make it **public**

2. Check file size (Supabase free tier: 1GB total)

3. Verify file type is allowed (jpg, png, svg, webp)

---

### 5. Build Errors

**Error:** `Module not found: Can't resolve 'canvas'`

**Solution:**
Already handled in `next.config.js` with webpack externals.

If still occurring:
```bash
npm install --legacy-peer-deps
```

---

### 6. Environment Variables Not Working

**Error:** `undefined` when accessing env vars

**Solutions:**
1. Restart dev server after changing `.env.local`:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. Prefix client-side vars with `NEXT_PUBLIC_`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...  ✅
   SUPABASE_URL=...              ❌ Won't work in browser
   ```

3. Never commit `.env.local` to git (already in `.gitignore`)

---

### 7. Slow AI Generation

**Issue:** Layout generation takes >10 seconds

**Solutions:**
1. **Normal:** First call is slower (cold start)
2. **Check internet:** Gemini API requires stable connection
3. **Simplify prompt:** Shorter prompts = faster generation
4. **Monitor quota:** Near limit = slower responses

**Expected Times:**
- Layout generation: 3-5 seconds
- Copy generation: 2-3 seconds
- Compliance check: 2-4 seconds

---

### 8. Hugging Face Image Generation Fails

**Error:** `Failed to generate image`

**Solutions:**
1. **Optional feature:** HF image generation is optional
2. **Add token:** Get token from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
3. **Fallback:** App uses placeholder if HF unavailable
4. **Rate limits:** Free tier has limits, may need to wait

---

### 9. Database Permission Errors

**Error:** `new row violates row-level security policy`

**Solutions:**
1. Verify RLS policies are created (run migration)
2. Check you're logged in (auth token valid)
3. Ensure `user_id` matches authenticated user

**Debug RLS:**
```sql
-- In Supabase SQL Editor
SELECT * FROM brand_kits WHERE user_id = auth.uid();
```

---

### 10. Dark Mode Issues

**Issue:** Colors look wrong in dark mode

**Solutions:**
1. Check CSS variables in `globals.css`
2. Use `dark:` prefix in Tailwind classes
3. Test in both light/dark modes

---

## Getting Help

### 1. Check Documentation
- README.md - Project overview
- SETUP.md - Installation guide
- implementation_plan.md - Technical details

### 2. Check Browser Console
Press F12 → Console tab to see error messages

### 3. Verify Environment
```bash
# Check Node version (need 18+)
node --version

# Check npm version
npm --version

# Check installed packages
npm list
```

### 4. Clean Install
If all else fails:
```bash
# Remove dependencies
rm -rf node_modules
rm package-lock.json

# Reinstall
npm install

# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

---

## Performance Tips

1. **Use stable models:** `gemini-1.5-flash` > `gemini-2.0-flash-exp`
2. **Cache results:** Browser will cache static assets
3. **Optimize images:** Use compressed images for uploads
4. **Batch operations:** Generate multiple designs at once
5. **Monitor quotas:** Check API usage regularly

---

## Known Limitations

1. **Gemini Free Tier:** 1,500 requests/day, 15/minute
2. **Supabase Free Tier:** 500MB database, 1GB storage
3. **Experimental models:** May have lower quotas
4. **Real-time collaboration:** Framework ready, not fully implemented
5. **Vector search:** Requires Supabase Pro for pgvector

---

## FAQ

**Q: Can I use this in production?**  
A: Yes, but upgrade to paid tiers for higher quotas.

**Q: Is my data safe?**  
A: Yes, Supabase has RLS policies enforcing data isolation.

**Q: Can I self-host?**  
A: Yes, but requires self-hosted Supabase instance.

**Q: What's the cost to scale?**  
A: Gemini: $0.00025/1k chars, Supabase Pro: $25/month

---

**Still having issues?** Check the error message carefully and search this guide for keywords.
