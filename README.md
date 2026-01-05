# SmartCanvas - AI-Powered Creative Suite

An intelligent ad design automation tool that uses AI to generate professional, brand-compliant designs from simple prompts.

## 🚀 Features

- **AI Layout Generation** - Generate professional ad layouts with Gemini AI
- **Smart Copywriting** - AI-powered headlines, CTAs, and body copy
- **Brand Kit Management** - Store and enforce brand colors, logos, and fonts
- **Multi-Format Export** - Resize designs for all social platforms
- **Compliance Checking** - Automated design rule validation
- **Real-time Canvas Editor** - Interactive design editing with Fabric.js
- **Beautiful UI** - Modern, responsive interface with dark mode

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Fabric.js** - Canvas manipulation
- **Lucide React** - Beautiful icons

### Backend & AI
- **Google Gemini 2.0 Flash** - AI layout and copy generation
- **Hugging Face** - Text-to-image and NLP models
- **Supabase** - Authentication, database, and storage
- **PostgreSQL** - Relational database with RLS

### Performance
- Code splitting and lazy loading
- Image optimization
- Client-side caching
- Responsive design

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier)
- Google AI Studio API key (free)
- Hugging Face account (optional, for image generation)

## 🔧 Setup

### 1. Clone and Install

```bash
cd SmartCanvas
npm install
```

### 2. Configure Environment Variables

Create `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Gemini
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# Hugging Face (optional)
HUGGINGFACE_API_TOKEN=your_hf_token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Supabase

1. Create a new Supabase project
2. Run the migration script:

```bash
# In Supabase SQL Editor, run:
# supabase/migrations/001_initial_schema.sql
```

3. Create a storage bucket named `assets` with public access

### 4. Get API Keys

#### Google Gemini API:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy to `.env.local`

#### Supabase:
1. Go to Project Settings → API
2. Copy URL and anon key to `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📱 Usage

1. **Sign Up** - Create an account
2. **Create Brand Kit** - Add your brand colors, logo, fonts
3. **Start Designing**:
   - Click "New Design" from dashboard
   - Use AI wizard to generate layouts
   - Customize with the editor
   - Export to PNG

### AI Layout Wizard

1. Describe your campaign
2. Add product name and offer
3. Select format (Instagram, Facebook, etc.)
4. Click "Generate Layout"
5. AI creates professional design in seconds

## 🎨 Supported Formats

- Facebook Feed (1200x630)
- Facebook Story (1080x1920)
- Instagram Post (1080x1080)
- Instagram Story (1080x1920)
- Twitter Post (1200x675)
- LinkedIn Post (1200x627)
- Custom sizes

## 🔐 Security

- Row Level Security (RLS) on all tables
- Authenticated file uploads
- Server-side AI API calls
- Environment variable protection

## 📦 Project Structure

```
SmartCanvas/
├── app/
│   ├── api/
│   │   └── ai/          # AI endpoints (layout, copy, compliance)
│   ├── auth/            # Login/signup pages
│   ├── dashboard/       # Main dashboard and brand kits
│   ├── editor/          # Canvas editor
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── components/
│   └── FabricCanvas.tsx # Canvas component
├── lib/
│   ├── auth.ts          # Auth utilities
│   ├── database.ts      # Database queries
│   ├── gemini.ts        # Gemini AI client
│   ├── supabase.ts      # Supabase client
│   └── types.ts         # TypeScript types
├── supabase/
│   └── migrations/      # Database schema
└── public/              # Static assets
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Compatible with any Next.js hosting:
- Netlify
- Railway
- Render
- AWS Amplify

## 🎯 Roadmap

- [ ] Real-time collaboration
- [ ] Template library
- [ ] Advanced image generation
- [ ] A/B testing for designs
- [ ] Team workspaces
- [ ] API for programmatic design
- [ ] Mobile app

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 🐛 Known Issues

- Fabric.js requires `canvas` package shimming for server builds
- Some browsers may have CORS issues with external images

## 💡 Tips

- Use descriptive prompts for better AI layouts
- Create brand kits first for consistent designs
- Export at 2x resolution for high quality
- Check compliance before finalizing

## 📞 Support

- GitHub Issues: Report bugs and feature requests
- Documentation: See implementation_plan.md for detailed architecture

---

Built with ❤️ using AI. Powered by Next.js, Gemini AI, and Supabase.
