-- Create tables for SmartCanvas

-- Brand Kits table
CREATE TABLE IF NOT EXISTS brand_kits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  colors JSONB DEFAULT '[]'::jsonb,
  fonts JSONB DEFAULT '[]'::jsonb,
  guidelines TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Designs table
CREATE TABLE IF NOT EXISTS designs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_kit_id UUID REFERENCES brand_kits(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  canvas_json JSONB NOT NULL,
  format TEXT NOT NULL DEFAULT 'instagram-post',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'published')),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Design Assets table
CREATE TABLE IF NOT EXISTS design_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  canvas_json JSONB NOT NULL,
  preview_url TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Rules table
CREATE TABLE IF NOT EXISTS compliance_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_kit_id UUID REFERENCES brand_kits(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL,
  configuration JSONB DEFAULT '{}'::jsonb,
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('error', 'warning')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Design History table
CREATE TABLE IF NOT EXISTS design_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  canvas_json JSONB NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_brand_kits_user_id ON brand_kits(user_id);
CREATE INDEX IF NOT EXISTS idx_designs_user_id ON designs(user_id);
CREATE INDEX IF NOT EXISTS idx_designs_brand_kit_id ON designs(brand_kit_id);
CREATE INDEX IF NOT EXISTS idx_design_assets_design_id ON design_assets(design_id);
CREATE INDEX IF NOT EXISTS idx_design_history_design_id ON design_history(design_id);

-- Enable Row Level Security
ALTER TABLE brand_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brand_kits
CREATE POLICY "Users can view own brand kits" ON brand_kits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own brand kits" ON brand_kits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand kits" ON brand_kits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brand kits" ON brand_kits
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for designs
CREATE POLICY "Users can view own designs" ON designs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own designs" ON designs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own designs" ON designs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own designs" ON designs
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for design_assets
CREATE POLICY "Users can view assets from own designs" ON design_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM designs
      WHERE designs.id = design_assets.design_id
      AND designs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create assets for own designs" ON design_assets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM designs
      WHERE designs.id = design_assets.design_id
      AND designs.user_id = auth.uid()
    )
  );

-- RLS Policies for design_history
CREATE POLICY "Users can view history of own designs" ON design_history
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM designs
      WHERE designs.id = design_history.design_id
      AND designs.user_id = auth.uid()
    )
  );

-- Templates are public, anyone can view
CREATE POLICY "Anyone can view public templates" ON templates
  FOR SELECT USING (is_public = true);

-- Create storage bucket for assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'assets' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'assets');

CREATE POLICY "Users can delete own assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);
