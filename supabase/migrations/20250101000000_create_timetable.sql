-- Create enum for priority levels
CREATE TYPE public.priority_level AS ENUM ('High', 'Medium', 'Low');

-- Create enum for days of week
CREATE TYPE public.day_of_week AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

-- Create timetable_sessions table
CREATE TABLE public.timetable_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT,
  day public.day_of_week NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  priority public.priority_level NOT NULL DEFAULT 'Medium',
  notes TEXT,
  color TEXT, -- Hex color code for subject
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.timetable_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own timetable sessions"
  ON public.timetable_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own timetable sessions"
  ON public.timetable_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timetable sessions"
  ON public.timetable_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timetable sessions"
  ON public.timetable_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_timetable_sessions_user_day ON public.timetable_sessions(user_id, day);
CREATE INDEX idx_timetable_sessions_user_time ON public.timetable_sessions(user_id, start_time);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger to update updated_at
CREATE TRIGGER update_timetable_sessions_updated_at
  BEFORE UPDATE ON public.timetable_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

