import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useItinerary } from '@/contexts/ItineraryContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Sparkles, 
  ArrowLeft,
  Wand2
} from 'lucide-react';
import { TripSettings } from '@/types/itinerary';

const CreateItinerary = () => {
  const navigate = useNavigate();
  const { createItinerary } = useItinerary();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [settings, setSettings] = useState<TripSettings>({
    destination: '',
    cities: [],
    startDate: '',
    endDate: '',
    travelers: 2,
    budget: '',
    theme: '',
    attractions: [],
    specialRequests: ''
  });

  const handleGenerateWithAI = async () => {
    if (!settings.destination || !settings.startDate || !settings.endDate || !settings.theme) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    
    try {
      const itineraryId = await createItinerary(settings);
      navigate(`/edit/${itineraryId}`);
    } catch (error) {
      console.error('Error generating itinerary:', error);
      alert('Failed to generate itinerary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const themes = [
    'Cultural & Adventure',
    'Luxury & Relaxation',
    'Family Fun',
    'Honeymoon',
    'Business Travel',
    'Solo Adventure',
    'Wildlife & Nature',
    'Food & Wine',
    'Beach & Coastal',
    'Mountain & Hiking'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Create New Itinerary</h1>
              <p className="text-muted-foreground">Let AI generate a professional travel plan</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-4">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">AI-Powered Trip Planning</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Provide some basic details about your trip, and our AI will generate a comprehensive itinerary 
              with flights, hotels, activities, and more.
            </p>
          </div>

          <div className="space-y-8">
            {/* Destination & Theme */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-lg font-medium flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Destination
                </Label>
                <Input
                  placeholder="e.g., Tokyo, Japan"
                  value={settings.destination}
                  onChange={(e) => setSettings({...settings, destination: e.target.value})}
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground">Main destination city or country</p>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-medium">Trip Theme</Label>
                <Select value={settings.theme} onValueChange={(value) => setSettings({...settings, theme: value})}>
                  <SelectTrigger className="text-lg">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">This helps AI tailor your itinerary</p>
              </div>
            </div>

            {/* Dates & Travelers */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <Label className="text-lg font-medium flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={settings.startDate}
                  onChange={(e) => setSettings({...settings, startDate: e.target.value})}
                  className="text-lg"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-medium">End Date</Label>
                <Input
                  type="date"
                  value={settings.endDate}
                  onChange={(e) => setSettings({...settings, endDate: e.target.value})}
                  className="text-lg"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-medium flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Travelers
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={settings.travelers}
                  onChange={(e) => setSettings({...settings, travelers: parseInt(e.target.value) || 1})}
                  className="text-lg"
                />
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-4">
              <Label className="text-lg font-medium flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Budget Range
              </Label>
              <Input
                placeholder="e.g., $3000-5000 or €2500 per person"
                value={settings.budget}
                onChange={(e) => setSettings({...settings, budget: e.target.value})}
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Total budget or budget per person - helps AI suggest appropriate accommodations and activities
              </p>
            </div>

            {/* Additional Cities */}
            <div className="space-y-4">
              <Label className="text-lg font-medium">Additional Cities (Optional)</Label>
              <Input
                placeholder="e.g., Kyoto, Osaka (comma-separated)"
                value={settings.cities.join(', ')}
                onChange={(e) => setSettings({
                  ...settings, 
                  cities: e.target.value.split(',').map(city => city.trim()).filter(Boolean)
                })}
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">Other cities or regions you'd like to visit</p>
            </div>

            {/* Special Requests */}
            <div className="space-y-4">
              <Label className="text-lg font-medium">Special Requests & Preferences (Optional)</Label>
              <Textarea
                placeholder="e.g., prefer luxury hotels, interested in local cuisine, need vegetarian options, want to avoid long travel days, specific attractions to visit..."
                value={settings.specialRequests}
                onChange={(e) => setSettings({...settings, specialRequests: e.target.value})}
                className="min-h-[120px] text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Any specific requirements, interests, or constraints for your trip
              </p>
            </div>

            {/* Generate Button */}
            <div className="pt-6 border-t border-border">
              <div className="flex flex-col items-center gap-4">
                <Button
                  onClick={handleGenerateWithAI}
                  disabled={isGenerating || !settings.destination || !settings.startDate || !settings.endDate || !settings.theme}
                  size="lg"
                  className="text-lg px-8 py-6 flex items-center gap-3"
                >
                  <Sparkles className="w-6 h-6" />
                  {isGenerating ? 'Generating Your Itinerary...' : 'Generate AI Itinerary'}
                </Button>
                
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Our AI will create a detailed day-by-day itinerary with flights, hotels, activities, 
                  meals, and all the details you need for a perfect trip.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CreateItinerary;