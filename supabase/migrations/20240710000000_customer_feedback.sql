-- Create customer_feedback table for storing user feedback
CREATE TABLE IF NOT EXISTS public.customer_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NULL, -- optional reference to user (can be anonymous)
  feedback_type TEXT NOT NULL,
  rating INTEGER NOT NULL,
  details TEXT,
  email TEXT,
  name TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own feedback
CREATE POLICY "Users can view their own feedback" ON public.customer_feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert feedback (including anonymous feedback)
CREATE POLICY "Users can insert feedback" ON public.customer_feedback
  FOR INSERT WITH CHECK (true);

-- Create policy to allow admins to view all feedback
CREATE POLICY "Admins can view all feedback" ON public.customer_feedback
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE is_admin = true
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_feedback_user_id ON public.customer_feedback (user_id);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_timestamp ON public.customer_feedback (timestamp); 