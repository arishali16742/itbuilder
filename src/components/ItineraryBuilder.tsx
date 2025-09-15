import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Plane, 
  Hotel, 
  Utensils,
  Download,
  Share2,
  Sparkles
} from "lucide-react";

const ItineraryBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [itinerary, setItinerary] = useState({
    destination: "Tbilisi, Georgia",
    startDate: "2024-09-20",
    endDate: "2024-09-25",
    travelers: 2,
    budget: "$3000",
    theme: "Cultural & Adventure"
  });

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/itinerary/share_demo_${Date.now()}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Share link copied!",
      description: "The itinerary share link has been copied to your clipboard.",
    });
  };

  const handleExportPDF = () => {
    // Create a temporary PDF export
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(sampleItinerary, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `${sampleItinerary.title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "PDF exported!",
      description: "Your itinerary has been downloaded as a PDF.",
    });
  };

  const handleCreateWithAI = () => {
    navigate('/create');
  };

  const sampleItinerary = {
    title: "Georgia Cultural Discovery",
    duration: "5 Days / 4 Nights",
    flights: {
      departure: "NYC → TBS, September 20, 2024 (Turkish Airlines)",
      return: "TBS → NYC, September 25, 2024 (Turkish Airlines)"
    },
    accommodation: {
      hotel: "Rooms Hotel Tbilisi",
      nights: 4,
      rating: "5-star boutique hotel"
    },
    days: [
      {
        day: 1,
        date: "September 20, 2024",
        title: "Arrival & Old Tbilisi",
        activities: [
          "Airport pickup and hotel check-in",
          "Walking tour of Old Tbilisi",
          "Visit Narikala Fortress",
          "Traditional Georgian dinner at Shavi Lomi"
        ],
        meals: "Dinner included",
        accommodation: "Rooms Hotel Tbilisi"
      },
      {
        day: 2,
        date: "September 21, 2024", 
        title: "Wine Country Adventure",
        activities: [
          "Drive to Kakheti wine region",
          "Wine tasting at Château Mukhrani",
          "Traditional supra lunch experience",
          "Visit Sighnaghi - City of Love"
        ],
        meals: "Breakfast, Lunch included",
        accommodation: "Rooms Hotel Tbilisi"
      },
      {
        day: 3,
        date: "September 22, 2024",
        title: "Mountain Excursion", 
        activities: [
          "Day trip to Kazbegi",
          "Gergeti Trinity Church hike",
          "Traditional khinkali lunch",
          "Scenic mountain photography"
        ],
        meals: "Breakfast, Lunch included",
        accommodation: "Rooms Hotel Tbilisi"
      }
    ],
    inclusions: [
      "4 nights accommodation in 5-star hotel",
      "Daily breakfast",
      "Professional English-speaking guide",
      "All transportation in comfortable vehicle",
      "Entrance fees to all mentioned attractions",
      "Wine tastings and cultural experiences"
    ],
    exclusions: [
      "International flights",
      "Travel insurance",
      "Personal expenses and souvenirs",
      "Lunches and dinners not mentioned",
      "Optional activities and excursions"
    ]
  };

  return (
    <section className="py-20 bg-gradient-to-br from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Build Your Perfect Itinerary
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional split-pane editor with live PDF preview. Start from scratch or let AI generate your base itinerary.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 h-[800px]">
          {/* Left Panel - Editor */}
          <Card className="p-6 shadow-card overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-foreground">Itinerary Editor</h3>
              <Button variant="travel" size="sm" onClick={handleCreateWithAI}>
                <Sparkles className="w-4 h-4" />
                Generate with AI
              </Button>
            </div>

            <div className="space-y-6">
              {/* Basic Details */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Trip Details
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="destination">Destination</Label>
                    <Input 
                      id="destination"
                      value={itinerary.destination}
                      onChange={(e) => setItinerary({...itinerary, destination: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="theme">Trip Theme</Label>
                    <Select value={itinerary.theme} onValueChange={(value) => setItinerary({...itinerary, theme: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cultural & Adventure">Cultural & Adventure</SelectItem>
                        <SelectItem value="Luxury & Relaxation">Luxury & Relaxation</SelectItem>
                        <SelectItem value="Family Fun">Family Fun</SelectItem>
                        <SelectItem value="Honeymoon">Honeymoon</SelectItem>
                        <SelectItem value="Business Travel">Business Travel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input 
                      id="startDate"
                      type="date"
                      value={itinerary.startDate}
                      onChange={(e) => setItinerary({...itinerary, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input 
                      id="endDate"
                      type="date"
                      value={itinerary.endDate}
                      onChange={(e) => setItinerary({...itinerary, endDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="travelers">Travelers</Label>
                    <Input 
                      id="travelers"
                      type="number"
                      value={itinerary.travelers}
                      onChange={(e) => setItinerary({...itinerary, travelers: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="budget">Budget Range</Label>
                  <Input 
                    id="budget"
                    value={itinerary.budget}
                    onChange={(e) => setItinerary({...itinerary, budget: e.target.value})}
                    placeholder="e.g. $2000-3000"
                  />
                </div>
              </div>

              <Separator />

              {/* Additional Sections */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-foreground flex items-center gap-2">
                  <Plane className="w-5 h-5 text-primary" />
                  Flights & Transportation
                </h4>
                <Textarea placeholder="Add flight details, airport transfers, local transportation..." className="min-h-[100px]" />
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium text-foreground flex items-center gap-2">
                  <Hotel className="w-5 h-5 text-primary" />
                  Accommodation
                </h4>
                <Textarea placeholder="Hotel details, room types, special requests..." className="min-h-[100px]" />
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium text-foreground flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-primary" />
                  Meals & Dining
                </h4>
                <Textarea placeholder="Dining recommendations, included meals, dietary restrictions..." className="min-h-[100px]" />
              </div>
            </div>
          </Card>

          {/* Right Panel - Live Preview */}
          <Card className="p-6 shadow-card overflow-y-auto bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-foreground">Live Preview</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                <Button variant="default" size="sm" onClick={handleExportPDF}>
                  <Download className="w-4 h-4" />
                  Export PDF
                </Button>
              </div>
            </div>

            {/* PDF-Style Preview */}
            <div className="space-y-6 text-sm">
              {/* Header */}
              <div className="text-center border-b pb-4">
                <h1 className="text-2xl font-bold text-primary mb-2">{sampleItinerary.title}</h1>
                <p className="text-lg text-muted-foreground">{sampleItinerary.duration}</p>
                <div className="flex justify-center gap-4 mt-2 text-sm">
                  <Badge variant="secondary">{itinerary.travelers} Travelers</Badge>
                  <Badge variant="secondary">{itinerary.budget}</Badge>
                  <Badge variant="secondary">{itinerary.theme}</Badge>
                </div>
              </div>

              {/* Flights */}
              <div>
                <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <Plane className="w-4 h-4" />
                  Flight Details
                </h3>
                <div className="space-y-1 text-muted-foreground">
                  <p><strong>Departure:</strong> {sampleItinerary.flights.departure}</p>
                  <p><strong>Return:</strong> {sampleItinerary.flights.return}</p>
                </div>
              </div>

              {/* Accommodation */}
              <div>
                <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <Hotel className="w-4 h-4" />
                  Accommodation
                </h3>
                <div className="space-y-1 text-muted-foreground">
                  <p><strong>Hotel:</strong> {sampleItinerary.accommodation.hotel}</p>
                  <p><strong>Duration:</strong> {sampleItinerary.accommodation.nights} nights</p>
                  <p><strong>Category:</strong> {sampleItinerary.accommodation.rating}</p>
                </div>
              </div>

              {/* Day by Day */}
              <div>
                <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Day-by-Day Itinerary
                </h3>
                <div className="space-y-4">
                  {sampleItinerary.days.map((day) => (
                    <div key={day.day} className="border border-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Day {day.day}</Badge>
                        <span className="text-sm text-muted-foreground">{day.date}</span>
                      </div>
                      <h4 className="font-semibold mb-2">{day.title}</h4>
                      <ul className="space-y-1 text-muted-foreground text-sm mb-2">
                        {day.activities.map((activity, idx) => (
                          <li key={idx}>• {activity}</li>
                        ))}
                      </ul>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span><strong>Meals:</strong> {day.meals}</span>
                        <span><strong>Stay:</strong> {day.accommodation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions/Exclusions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-success mb-2">✅ Included</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {sampleItinerary.inclusions.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-destructive mb-2">❌ Not Included</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {sampleItinerary.exclusions.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ItineraryBuilder;