-- Create itineraries table
CREATE TABLE public.itineraries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration TEXT NOT NULL,
  travelers INTEGER NOT NULL DEFAULT 1,
  budget TEXT NOT NULL,
  theme TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'shared', 'feedback', 'approved', 'completed')),
  version INTEGER NOT NULL DEFAULT 1,
  share_token UUID DEFAULT gen_random_uuid(),
  
  -- Trip details
  departure_flight TEXT,
  return_flight TEXT,
  hotel_name TEXT,
  hotel_nights INTEGER,
  hotel_rating TEXT,
  
  -- Inclusions and exclusions
  inclusions TEXT[],
  exclusions TEXT[],
  
  -- Consultant info
  consultant_name TEXT,
  consultant_email TEXT,
  consultant_phone TEXT,
  consultant_company TEXT,
  consultant_logo TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create itinerary days table
CREATE TABLE public.itinerary_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  itinerary_id UUID NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  city TEXT NOT NULL,
  activities TEXT[],
  meals TEXT,
  accommodation TEXT,
  images TEXT[],
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table
CREATE TABLE public.itinerary_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  itinerary_id UUID NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  line_item TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'addressed', 'resolved')),
  type TEXT NOT NULL DEFAULT 'feedback' CHECK (type IN ('feedback', 'change_request', 'approval')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a sharing app)
CREATE POLICY "Itineraries are viewable by everyone" 
ON public.itineraries 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create itineraries" 
ON public.itineraries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update itineraries" 
ON public.itineraries 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete itineraries" 
ON public.itineraries 
FOR DELETE 
USING (true);

-- Days policies
CREATE POLICY "Itinerary days are viewable by everyone" 
ON public.itinerary_days 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create itinerary days" 
ON public.itinerary_days 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update itinerary days" 
ON public.itinerary_days 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete itinerary days" 
ON public.itinerary_days 
FOR DELETE 
USING (true);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" 
ON public.itinerary_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create comments" 
ON public.itinerary_comments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update comments" 
ON public.itinerary_comments 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_itineraries_updated_at
  BEFORE UPDATE ON public.itineraries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_itineraries_share_token ON public.itineraries(share_token);
CREATE INDEX idx_itinerary_days_itinerary_id ON public.itinerary_days(itinerary_id);
CREATE INDEX idx_itinerary_comments_itinerary_id ON public.itinerary_comments(itinerary_id);