-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    comment_content TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL
);

-- Create index for faster queries by question_id
CREATE INDEX IF NOT EXISTS idx_comments_question_id ON public.comments(question_id);

-- Create index for ordering by created_at
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read comments
CREATE POLICY "Public read access to comments" 
ON public.comments FOR SELECT 
TO anon, authenticated
USING (true);

-- Policy: Only authenticated users can insert their own comments
CREATE POLICY "Authenticated users can insert own comments" 
ON public.comments FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);
