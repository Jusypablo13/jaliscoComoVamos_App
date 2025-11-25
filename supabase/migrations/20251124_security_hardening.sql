-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE encuestalol ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Users can insert their own profile (usually handled by triggers, but good to have)
CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Encuestalol Policies
-- Public read access for analytics (Anonymous/Guest users)
CREATE POLICY "Public read access to survey data" 
ON encuestalol FOR SELECT 
TO anon, authenticated
USING (true);

-- Restrict write access to admins only (assuming a role or specific users, strictly denying for now)
-- No INSERT/UPDATE policy for 'encuestalol' means default deny for everyone except service_role.

-- Municipios Policies
ALTER TABLE "Municipios" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access to municipios" 
ON "Municipios" FOR SELECT 
TO anon, authenticated
USING (true);
