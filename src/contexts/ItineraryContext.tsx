import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Itinerary, TripSettings, ItineraryDay, Comment } from '@/types/itinerary';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ItineraryContextType {
  itineraries: Itinerary[];
  currentItinerary: Itinerary | null;
  createItinerary: (settings: TripSettings) => Promise<string>;
  updateItinerary: (id: string, updates: Partial<Itinerary>) => Promise<void>;
  deleteItinerary: (id: string) => Promise<void>;
  setCurrentItinerary: (itinerary: Itinerary | null) => void;
  generateItineraryWithAI: (settings: TripSettings) => Promise<Itinerary>;
  shareItinerary: (id: string) => string;
  exportToPDF: (id: string) => Promise<void>;
  getItineraryByShareToken: (shareToken: string) => Promise<Itinerary | null>;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

export const useItinerary = () => {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
};

export const ItineraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);
  const { toast } = useToast();

  // Load itineraries from Supabase on mount
  useEffect(() => {
    loadItineraries();
  }, []);

  const loadItineraries = async () => {
    try {
      const { data: itinerariesData, error: itinerariesError } = await supabase
        .from('itineraries')
        .select('*')
        .order('created_at', { ascending: false });

      if (itinerariesError) throw itinerariesError;

      const formattedItineraries: Itinerary[] = await Promise.all(
        (itinerariesData || []).map(async (itinerary) => {
          // Load days
          const { data: days, error: daysError } = await supabase
            .from('itinerary_days')
            .select('*')
            .eq('itinerary_id', itinerary.id)
            .order('day');

          if (daysError) throw daysError;

          // Load comments
          const { data: comments, error: commentsError } = await supabase
            .from('itinerary_comments')
            .select('*')
            .eq('itinerary_id', itinerary.id)
            .order('created_at');

          if (commentsError) throw commentsError;

          return {
            id: itinerary.id,
            title: itinerary.title,
            destination: itinerary.destination,
            startDate: itinerary.start_date,
            endDate: itinerary.end_date,
            duration: itinerary.duration,
            travelers: itinerary.travelers,
            budget: itinerary.budget,
            theme: itinerary.theme,
            status: itinerary.status as 'draft' | 'shared' | 'feedback' | 'approved' | 'completed',
            createdAt: itinerary.created_at,
            updatedAt: itinerary.updated_at,
            version: itinerary.version,
            shareToken: itinerary.share_token,
            flights: {
              departure: itinerary.departure_flight || '',
              return: itinerary.return_flight || ''
            },
            accommodation: {
              hotel: itinerary.hotel_name || '',
              nights: itinerary.hotel_nights || 0,
              rating: itinerary.hotel_rating || ''
            },
            days: (days || []).map(day => ({
              day: day.day,
              date: day.date,
              title: day.title,
              city: day.city,
              activities: day.activities || [],
              meals: day.meals || '',
              accommodation: day.accommodation || '',
              images: day.images || [],
              description: day.description
            })),
            inclusions: itinerary.inclusions || [],
            exclusions: itinerary.exclusions || [],
            consultant: {
              name: itinerary.consultant_name || '',
              email: itinerary.consultant_email || '',
              phone: itinerary.consultant_phone || '',
              company: itinerary.consultant_company || '',
              logo: itinerary.consultant_logo
            },
            comments: (comments || []).map(comment => ({
              id: comment.id,
              section: comment.section,
              lineItem: comment.line_item,
              content: comment.content,
              author: comment.author,
          timestamp: comment.created_at,
          status: comment.status as 'pending' | 'addressed' | 'resolved',
          type: comment.type as 'feedback' | 'change_request' | 'approval'
            }))
          };
        })
      );

      setItineraries(formattedItineraries);
    } catch (error) {
      console.error('Error loading itineraries:', error);
      toast({
        title: "Error",
        description: "Failed to load itineraries",
        variant: "destructive"
      });
    }
  };

  const createItinerary = async (settings: TripSettings): Promise<string> => {
    const newItinerary = await generateItineraryWithAI(settings);
    
    try {
      // Save to Supabase
      const { data: itineraryData, error: itineraryError } = await supabase
        .from('itineraries')
        .insert({
          title: newItinerary.title,
          destination: newItinerary.destination,
          start_date: newItinerary.startDate,
          end_date: newItinerary.endDate,
          duration: newItinerary.duration,
          travelers: newItinerary.travelers,
          budget: newItinerary.budget,
          theme: newItinerary.theme,
          status: newItinerary.status,
          departure_flight: newItinerary.flights.departure,
          return_flight: newItinerary.flights.return,
          hotel_name: newItinerary.accommodation.hotel,
          hotel_nights: newItinerary.accommodation.nights,
          hotel_rating: newItinerary.accommodation.rating,
          inclusions: newItinerary.inclusions,
          exclusions: newItinerary.exclusions,
          consultant_name: newItinerary.consultant.name,
          consultant_email: newItinerary.consultant.email,
          consultant_phone: newItinerary.consultant.phone,
          consultant_company: newItinerary.consultant.company,
          consultant_logo: newItinerary.consultant.logo
        })
        .select()
        .single();

      if (itineraryError) throw itineraryError;

      // Save days
      if (newItinerary.days.length > 0) {
        const daysData = newItinerary.days.map(day => ({
          itinerary_id: itineraryData.id,
          day: day.day,
          date: day.date,
          title: day.title,
          city: day.city,
          activities: day.activities,
          meals: day.meals,
          accommodation: day.accommodation,
          images: day.images || [],
          description: day.description
        }));

        const { error: daysError } = await supabase
          .from('itinerary_days')
          .insert(daysData);

        if (daysError) throw daysError;
      }

      const savedItinerary = { ...newItinerary, id: itineraryData.id, shareToken: itineraryData.share_token };
      setItineraries(prev => [savedItinerary, ...prev]);
      setCurrentItinerary(savedItinerary);
      return savedItinerary.id;
    } catch (error) {
      console.error('Error saving itinerary:', error);
      toast({
        title: "Error",
        description: "Failed to save itinerary",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateItinerary = async (id: string, updates: Partial<Itinerary>) => {
    try {
      // Update in Supabase
      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.destination) updateData.destination = updates.destination;
      if (updates.startDate) updateData.start_date = updates.startDate;
      if (updates.endDate) updateData.end_date = updates.endDate;
      if (updates.duration) updateData.duration = updates.duration;
      if (updates.travelers) updateData.travelers = updates.travelers;
      if (updates.budget) updateData.budget = updates.budget;
      if (updates.theme) updateData.theme = updates.theme;
      if (updates.status) updateData.status = updates.status;
      if (updates.flights) {
        updateData.departure_flight = updates.flights.departure;
        updateData.return_flight = updates.flights.return;
      }
      if (updates.accommodation) {
        updateData.hotel_name = updates.accommodation.hotel;
        updateData.hotel_nights = updates.accommodation.nights;
        updateData.hotel_rating = updates.accommodation.rating;
      }
      if (updates.inclusions) updateData.inclusions = updates.inclusions;
      if (updates.exclusions) updateData.exclusions = updates.exclusions;
      if (updates.consultant) {
        updateData.consultant_name = updates.consultant.name;
        updateData.consultant_email = updates.consultant.email;
        updateData.consultant_phone = updates.consultant.phone;
        updateData.consultant_company = updates.consultant.company;
        updateData.consultant_logo = updates.consultant.logo;
      }

      const { error } = await supabase
        .from('itineraries')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Update days if provided
      if (updates.days) {
        // Delete existing days
        await supabase
          .from('itinerary_days')
          .delete()
          .eq('itinerary_id', id);

        // Insert new days
        const daysData = updates.days.map(day => ({
          itinerary_id: id,
          day: day.day,
          date: day.date,
          title: day.title,
          city: day.city,
          activities: day.activities,
          meals: day.meals,
          accommodation: day.accommodation,
          images: day.images || [],
          description: day.description
        }));

        await supabase
          .from('itinerary_days')
          .insert(daysData);
      }

      // Update comments if provided
      if (updates.comments) {
        // Add new comments that don't have an ID yet
        const newComments = updates.comments.filter(comment => 
          !comment.id || comment.id.startsWith('comment_')
        );
        
        if (newComments.length > 0) {
          const commentsData = newComments.map(comment => ({
            itinerary_id: id,
            section: comment.section,
            line_item: comment.lineItem,
            content: comment.content,
            author: comment.author,
            status: comment.status,
            type: comment.type
          }));

          const { data: insertedComments, error: commentsError } = await supabase
            .from('itinerary_comments')
            .insert(commentsData)
            .select();

          if (commentsError) throw commentsError;
        }
        
        // Update existing comments status
        const existingComments = updates.comments.filter(comment => 
          comment.id && !comment.id.startsWith('comment_')
        );
        
        for (const comment of existingComments) {
          await supabase
            .from('itinerary_comments')
            .update({ status: comment.status })
            .eq('id', comment.id);
        }
      }

      // Update local state
      setItineraries(prev =>
        prev.map(itinerary =>
          itinerary.id === id ? { ...itinerary, ...updates } : itinerary
        )
      );
      
      if (currentItinerary?.id === id) {
        setCurrentItinerary(prev => prev ? { ...prev, ...updates } : null);
      }

      toast({
        title: "Success",
        description: "Itinerary updated successfully"
      });
    } catch (error) {
      console.error('Error updating itinerary:', error);
      toast({
        title: "Error",
        description: "Failed to update itinerary",
        variant: "destructive"
      });
    }
  };

  const deleteItinerary = async (id: string) => {
    try {
      const { error } = await supabase
        .from('itineraries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItineraries(prev => prev.filter(itinerary => itinerary.id !== id));
      if (currentItinerary?.id === id) {
        setCurrentItinerary(null);
      }

      toast({
        title: "Success",
        description: "Itinerary deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      toast({
        title: "Error",
        description: "Failed to delete itinerary",
        variant: "destructive"
      });
    }
  };

  const generateItineraryWithAI = async (settings: TripSettings): Promise<Itinerary> => {
    // Simulate AI generation with enhanced content including images
    const startDate = new Date(settings.startDate);
    const endDate = new Date(settings.endDate);
    const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Sample images for places
    const placeImages = [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1520637836862-4d197d17c36a?w=800&h=400&fit=crop'
    ];
    
    const days = Array.from({ length: dayCount }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      return {
        day: i + 1,
        date: date.toISOString().split('T')[0],
        title: i === 0 ? 'Arrival & Orientation' : 
               i === dayCount - 1 ? 'Departure' : 
               `${settings.destination} Exploration`,
        city: settings.destination,
        activities: [
          'Morning city tour and local markets',
          'Visit iconic landmarks and attractions',
          'Traditional cultural experience',
          'Evening leisure time and local cuisine'
        ],
        meals: i === 0 ? 'Welcome dinner included' : 'Breakfast included',
        accommodation: `Premium Hotel in ${settings.destination}`,
        images: placeImages.slice(0, 2),
        description: `Day ${i + 1} offers an immersive experience in ${settings.destination} with carefully curated activities.`
      };
    });

    const itinerary: Itinerary = {
      id: `itin_${Date.now()}`,
      title: `${settings.destination} ${settings.theme} Experience`,
      destination: settings.destination,
      startDate: settings.startDate,
      endDate: settings.endDate,
      duration: `${dayCount} Days / ${dayCount - 1} Nights`,
      travelers: settings.travelers,
      budget: settings.budget,
      theme: settings.theme,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      
      flights: {
        departure: `NYC → ${settings.destination}, ${settings.startDate} (AI Selected Premium Airline)`,
        return: `${settings.destination} → NYC, ${settings.endDate} (AI Selected Premium Airline)`
      },
      
      accommodation: {
        hotel: `Luxury Resort & Spa ${settings.destination}`,
        nights: dayCount - 1,
        rating: '5-star luxury resort with spa facilities'
      },
      
      days,
      
      inclusions: [
        `${dayCount - 1} nights luxury accommodation`,
        'Daily gourmet breakfast',
        'Professional English-speaking guide',
        'All transportation in premium vehicles',
        'Entrance fees to all mentioned attractions',
        'Cultural experiences and activities',
        'Welcome dinner on arrival',
        '24/7 concierge service'
      ],
      
      exclusions: [
        'International flights',
        'Travel insurance',
        'Personal expenses and souvenirs',
        'Lunches and dinners not mentioned',
        'Optional activities and excursions',
        'Spa treatments and wellness services',
        'Alcoholic beverages'
      ],
      
      consultant: {
        name: 'Sarah Mitchell',
        email: 'sarah@travelbuilder.com',
        phone: '+1 (555) 123-4567',
        company: 'TravelBuilder Pro',
        logo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop'
      },
      
      comments: []
    };

    return itinerary;
  };

  const shareItinerary = (id: string): string => {
    const itinerary = itineraries.find(i => i.id === id);
    if (!itinerary) return '';
    
    updateItinerary(id, { status: 'shared' });
    
    return `${window.location.origin}/itinerary/${itinerary.shareToken}`;
  };

  const getItineraryByShareToken = async (shareToken: string): Promise<Itinerary | null> => {
    try {
      const { data: itineraryData, error: itineraryError } = await supabase
        .from('itineraries')
        .select('*')
        .eq('share_token', shareToken)
        .maybeSingle();

      if (itineraryError) throw itineraryError;
      
      if (!itineraryData) {
        return null;
      }

      // Load days
      const { data: days, error: daysError } = await supabase
        .from('itinerary_days')
        .select('*')
        .eq('itinerary_id', itineraryData.id)
        .order('day');

      if (daysError) throw daysError;

      // Load comments
      const { data: comments, error: commentsError } = await supabase
        .from('itinerary_comments')
        .select('*')
        .eq('itinerary_id', itineraryData.id)
        .order('created_at');

      if (commentsError) throw commentsError;

      return {
        id: itineraryData.id,
        title: itineraryData.title,
        destination: itineraryData.destination,
        startDate: itineraryData.start_date,
        endDate: itineraryData.end_date,
        duration: itineraryData.duration,
        travelers: itineraryData.travelers,
        budget: itineraryData.budget,
        theme: itineraryData.theme,
        status: itineraryData.status as 'draft' | 'shared' | 'feedback' | 'approved' | 'completed',
        createdAt: itineraryData.created_at,
        updatedAt: itineraryData.updated_at,
        version: itineraryData.version,
        shareToken: itineraryData.share_token,
        flights: {
          departure: itineraryData.departure_flight || '',
          return: itineraryData.return_flight || ''
        },
        accommodation: {
          hotel: itineraryData.hotel_name || '',
          nights: itineraryData.hotel_nights || 0,
          rating: itineraryData.hotel_rating || ''
        },
        days: (days || []).map(day => ({
          day: day.day,
          date: day.date,
          title: day.title,
          city: day.city,
          activities: day.activities || [],
          meals: day.meals || '',
          accommodation: day.accommodation || '',
          images: day.images || [],
          description: day.description
        })),
        inclusions: itineraryData.inclusions || [],
        exclusions: itineraryData.exclusions || [],
        consultant: {
          name: itineraryData.consultant_name || '',
          email: itineraryData.consultant_email || '',
          phone: itineraryData.consultant_phone || '',
          company: itineraryData.consultant_company || '',
          logo: itineraryData.consultant_logo
        },
        comments: (comments || []).map(comment => ({
          id: comment.id,
          section: comment.section,
          lineItem: comment.line_item,
          content: comment.content,
          author: comment.author,
          timestamp: comment.created_at,
          status: comment.status as 'pending' | 'addressed' | 'resolved',
          type: comment.type as 'feedback' | 'change_request' | 'approval'
        }))
      };
    } catch (error) {
      console.error('Error loading shared itinerary:', error);
      return null;
    }
  };

  const exportToPDF = async (id: string) => {
    const itinerary = itineraries.find(i => i.id === id) || currentItinerary;
    if (!itinerary) return;

    try {
      // Create a container element with the itinerary content matching reference design
      const element = document.createElement('div');
      element.style.width = '210mm'; // A4 width
      element.style.backgroundColor = 'white';
      element.style.padding = '15mm';
      element.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      element.style.color = '#1f2937';
      element.style.lineHeight = '1.5';
      
      // Generate the HTML content for PDF matching the uploaded design
      element.innerHTML = `
        <!-- Hero Section -->
        <div style="
          background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop');
          background-size: cover;
          background-position: center;
          color: white;
          text-align: center;
          padding: 60px 40px;
          border-radius: 12px;
          margin-bottom: 30px;
        ">
          <h1 style="font-size: 42px; font-weight: bold; margin: 0 0 15px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">
            ${itinerary.title}
          </h1>
          <p style="font-size: 22px; margin: 0 0 25px 0; opacity: 0.9;">
            ${itinerary.destination}'s Best Escape
          </p>
          <div style="
            background: #ef4444;
            color: white;
            padding: 12px 30px;
            border-radius: 25px;
            display: inline-block;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 40px;
          ">
            Map View
          </div>
        </div>

        <!-- Trip Summary Box -->
        <div style="
          background: #f8fafc;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 30px;
          border-left: 6px solid #f97316;
        ">
          <p style="font-size: 16px; color: #64748b; margin-bottom: 20px; line-height: 1.6;">
            Explore the best of ${itinerary.destination} with this ${itinerary.duration.toLowerCase()}. From vibrant cities to stunning landscapes, 
            experience ${itinerary.destination}'s rich culture, stunning landscapes, and historical landmarks. 
            Enjoy a blend of city life and natural wonders.
          </p>
          
          <div style="
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          ">
            <h3 style="
              color: #f97316;
              font-size: 24px;
              margin: 0 0 20px 0;
              display: flex;
              align-items: center;
              gap: 10px;
            ">
              🧳 Trip Summary
            </h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <div style="color: #3b82f6; font-size: 14px; margin-bottom: 5px; display: flex; align-items: center; gap: 8px;">
                  📅 Start Date
                </div>
                <div style="font-size: 16px; font-weight: 600;">${new Date(itinerary.startDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              </div>
              <div>
                <div style="color: #3b82f6; font-size: 14px; margin-bottom: 5px; display: flex; align-items: center; gap: 8px;">
                  📅 End Date
                </div>
                <div style="font-size: 16px; font-weight: 600;">${new Date(itinerary.endDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Flight Details Card -->
        <div style="
          background: white;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 25px;
          box-shadow: 0 2px 15px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
        ">
          <h3 style="color: #1f2937; font-size: 22px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            ✈️ Flight Details
          </h3>
          
          <!-- Onward Flight -->
          <div style="margin-bottom: 20px;">
            <h4 style="color: #3b82f6; font-size: 18px; margin-bottom: 15px;">Onward Flight</h4>
            <div style="background: #dbeafe; border-radius: 8px; padding: 15px;">
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; text-align: center;">
                <div>
                  <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">From</div>
                  <div style="color: #64748b;">Mumbai</div>
                </div>
                <div>
                  <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">To</div>
                  <div style="color: #64748b;">${itinerary.destination}</div>
                </div>
                <div>
                  <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">Flight Name</div>
                  <div style="color: #64748b;">6E-1823</div>
                </div>
                <div>
                  <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">Date</div>
                  <div style="color: #64748b;">${itinerary.startDate}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Return Flight -->
          <div>
            <h4 style="color: #3b82f6; font-size: 18px; margin-bottom: 15px;">Return Flight</h4>
            <div style="background: #dbeafe; border-radius: 8px; padding: 15px;">
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; text-align: center;">
                <div>
                  <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">From</div>
                  <div style="color: #64748b;">${itinerary.destination}</div>
                </div>
                <div>
                  <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">To</div>
                  <div style="color: #64748b;">Mumbai</div>
                </div>
                <div>
                  <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">Flight Name</div>
                  <div style="color: #64748b;">6E-1824</div>
                </div>
                <div>
                  <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">Date</div>
                  <div style="color: #64748b;">${itinerary.endDate}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stay Details Card -->
        <div style="
          background: white;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 25px;
          box-shadow: 0 2px 15px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
        ">
          <h3 style="color: #1f2937; font-size: 22px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            🏠 Stay Details
          </h3>
          <div style="background: #dbeafe; border-radius: 8px; padding: 15px;">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; text-align: center;">
              <div>
                <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">Place</div>
                <div style="color: #64748b;">${itinerary.destination}</div>
              </div>
              <div>
                <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">Nights</div>
                <div style="color: #64748b;">${itinerary.accommodation.nights}</div>
              </div>
              <div>
                <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">Hotel</div>
                <div style="color: #64748b;">${itinerary.accommodation.hotel}</div>
              </div>
              <div>
                <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">Rating</div>
                <div style="color: #64748b;">⭐⭐⭐⭐⭐</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Meal Summary Card -->
        <div style="
          background: white;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 25px;
          box-shadow: 0 2px 15px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
        ">
          <h3 style="color: #1f2937; font-size: 22px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            🍽️ Meal Summary
          </h3>
          <div style="
            background: #fef3c7;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin-bottom: 20px;
          ">
            <div style="
              background: #f59e0b;
              width: 60px;
              height: 60px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px auto;
              color: white;
              font-size: 24px;
            ">
              🍽️
            </div>
            <h4 style="font-size: 20px; font-weight: 600; margin-bottom: 15px; color: #1f2937;">
              Meals Included Throughout Your Journey
            </h4>
            <p style="color: #f59e0b; font-size: 18px; font-weight: 600;">
              Include ${itinerary.accommodation.nights} Breakfasts, 0 Lunch, and 0 Dinners
            </p>
          </div>
        </div>

        <!-- Day-wise Summary -->
        <div style="
          background: white;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 25px;
          box-shadow: 0 2px 15px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
        ">
          <h3 style="color: #1f2937; font-size: 22px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            📅 Quick Day-wise Summary
          </h3>
          <div style="space-y: 15px;">
            ${itinerary.days.map((day, index) => `
              <div style="
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 20px;
              ">
                <div style="
                  background: #3b82f6;
                  color: white;
                  width: 50px;
                  height: 50px;
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 24px;
                  font-weight: 700;
                  flex-shrink: 0;
                ">
                  ${day.day}
                </div>
                <div style="flex-grow: 1;">
                  <div style="color: #64748b; font-size: 16px; line-height: 1.6;">
                    ${day.title}. ${day.description || ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Detailed Day-by-Day -->
        ${itinerary.days.map((day, index) => `
          <div style="
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.1);
            border: 1px solid #e2e8f0;
            ${index > 0 && index % 2 === 0 ? 'page-break-before: always;' : ''}
          ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
              <h2 style="font-size: 28px; font-weight: 700; color: #1f2937; margin: 0;">Day ${day.day}</h2>
              <div style="color: #64748b; font-size: 18px; font-weight: 600;">${day.city}</div>
            </div>

            <!-- Main Activity -->
            <div style="
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 25px;
              margin-bottom: 20px;
              background: #fafafa;
            ">
              <h3 style="font-size: 22px; font-weight: 600; color: #1f2937; margin-bottom: 15px;">
                ${day.title}
              </h3>
              <div style="color: #64748b; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                📍 ${day.city}
              </div>
              <p style="color: #1f2937; font-size: 15px; line-height: 1.6; margin-bottom: 15px;">
                ${day.description || `Discover ${day.city}'s iconic landmarks and hidden gems. ${day.activities.join('. ')}.`}
              </p>
            </div>

            <!-- Activities List -->
            <div style="
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 20px;
              background: white;
            ">
              <h4 style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 15px;">
                Activities & Highlights
              </h4>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${day.activities.map(activity => `
                  <li style="
                    padding: 8px 0;
                    border-bottom: 1px solid #f1f5f9;
                    color: #64748b;
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                  ">
                    <span style="color: #3b82f6; margin-top: 2px;">•</span>
                    <span>${activity}</span>
                  </li>
                `).join('')}
              </ul>
              
              <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #f1f5f9;
                font-size: 14px;
              ">
                <div>
                  <span style="font-weight: 600; color: #1f2937;">Meals:</span>
                  <span style="color: #64748b; margin-left: 8px;">${day.meals}</span>
                </div>
                <div>
                  <span style="font-weight: 600; color: #1f2937;">Stay:</span>
                  <span style="color: #64748b; margin-left: 8px;">${day.accommodation}</span>
                </div>
              </div>
            </div>
          </div>
        `).join('')}

        <!-- Travel Consultant -->
        <div style="
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          margin-top: 30px;
        ">
          <h3 style="color: #1f2937; font-size: 24px; margin-bottom: 25px;">Your Travel Consultant</h3>
          
          <div style="
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            max-width: 400px;
            margin: 0 auto;
          ">
            <div style="
              background: #dbeafe;
              width: 80px;
              height: 80px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px auto;
              color: #3b82f6;
              font-size: 32px;
            ">
              👤
            </div>
            
            <h4 style="font-size: 22px; font-weight: 700; color: #1f2937; margin-bottom: 8px;">
              ${itinerary.consultant.name}
            </h4>
            <p style="color: #3b82f6; font-size: 16px; font-weight: 600; margin-bottom: 25px;">
              ${itinerary.consultant.company}
            </p>
            
            <div style="space-y: 15px;">
              <div style="
                background: #f0fdf4;
                border-radius: 8px;
                padding: 12px;
                display: flex;
                align-items: center;
                gap: 12px;
              ">
                <div style="color: #22c55e; font-size: 18px;">📞</div>
                <div>
                  <div style="font-size: 12px; color: #64748b;">Contact Number</div>
                  <div style="font-weight: 600; color: #1f2937;">${itinerary.consultant.phone}</div>
                </div>
              </div>
              
              <div style="
                background: #dbeafe;
                border-radius: 8px;
                padding: 12px;
                display: flex;
                align-items: center;
                gap: 12px;
              ">
                <div style="color: #3b82f6; font-size: 18px;">✉️</div>
                <div>
                  <div style="font-size: 12px; color: #64748b;">Email Address</div>
                  <div style="font-weight: 600; color: #3b82f6;">${itinerary.consultant.email}</div>
                </div>
              </div>
              
              <div style="
                background: #f3e8ff;
                border-radius: 8px;
                padding: 12px;
                display: flex;
                align-items: center;
                gap: 12px;
              ">
                <div style="color: #8b5cf6; font-size: 18px;">🏢</div>
                <div>
                  <div style="font-size: 12px; color: #64748b;">Travel Company</div>
                  <div style="font-weight: 600; color: #8b5cf6;">${itinerary.consultant.company}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Add element to document temporarily
      document.body.appendChild(element);

      // Generate canvas from element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // Remove element from document
      document.body.removeChild(element);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${itinerary.title}-itinerary.pdf`);

      toast({
        title: "Success",
        description: "PDF downloaded successfully"
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    }
  };

  return (
    <ItineraryContext.Provider value={{
      itineraries,
      currentItinerary,
      createItinerary,
      updateItinerary,
      deleteItinerary,
      setCurrentItinerary,
      generateItineraryWithAI,
      shareItinerary,
      exportToPDF,
      getItineraryByShareToken
    }}>
      {children}
    </ItineraryContext.Provider>
  );
};