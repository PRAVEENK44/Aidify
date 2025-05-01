-- Create medical_info table for storing user medical information
CREATE TABLE IF NOT EXISTS public.medical_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  info JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create emergency_events table for logging emergency actions
CREATE TABLE IF NOT EXISTS public.emergency_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  location JSONB,
  contacts_notified TEXT[],
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.medical_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own medical info
CREATE POLICY "Users can view their own medical info" ON public.medical_info
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to update their own medical info
CREATE POLICY "Users can update their own medical info" ON public.medical_info
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own medical info
CREATE POLICY "Users can insert their own medical info" ON public.medical_info
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to view their own emergency events
CREATE POLICY "Users can view their own emergency events" ON public.emergency_events
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own emergency events
CREATE POLICY "Users can insert their own emergency events" ON public.emergency_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_medical_info_user_id ON public.medical_info (user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_events_user_id ON public.emergency_events (user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_events_timestamp ON public.emergency_events (timestamp); 