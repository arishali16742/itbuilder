import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useItinerary } from '@/contexts/ItineraryContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
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
  Save,
  ArrowLeft,
  MessageSquare,
  Plus,
  Minus
} from 'lucide-react';
import FeedbackSection from '@/components/FeedbackSection';

const EditItinerary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { itineraries, currentItinerary, setCurrentItinerary, updateItinerary, shareItinerary, exportToPDF } = useItinerary();

  const [itinerary, setItinerary] = useState(currentItinerary);

  useEffect(() => {
    if (id) {
      const foundItinerary = itineraries.find(i => i.id === id);
      if (foundItinerary) {
        setItinerary(foundItinerary);
        setCurrentItinerary(foundItinerary);
      } else {
        navigate('/dashboard');
      }
    }
  }, [id, itineraries, setCurrentItinerary, navigate]);

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Itinerary not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!itinerary) return;
    await updateItinerary(itinerary.id, itinerary);
  };

  const handleShare = () => {
    const shareUrl = shareItinerary(itinerary.id);
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Share link copied!",
      description: "The itinerary share link has been copied to your clipboard.",
    });
  };

  const handleExportPDF = () => {
    exportToPDF(itinerary.id);
    toast({
      title: "PDF exported!",
      description: "Your itinerary has been downloaded as a PDF.",
    });
  };

  const updateItineraryField = (field: string, value: any) => {
    setItinerary(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Edit Itinerary</h1>
                <p className="text-muted-foreground">{itinerary.title}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Feedback Section */}
        {itinerary.comments.length > 0 && (
          <div className="mb-6">
            <FeedbackSection 
              itinerary={itinerary} 
              onUpdateItinerary={(updates) => setItinerary(prev => prev ? { ...prev, ...updates } : null)}
              isOwner={true}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 h-[800px]">
          {/* Left Panel - Editor */}
          <Card className="p-6 shadow-card overflow-y-auto">
            <h3 className="text-2xl font-semibold text-foreground mb-6">Itinerary Editor</h3>

            <div className="space-y-6">
              {/* Basic Details */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Trip Details
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Trip Title</Label>
                    <Input 
                      id="title"
                      value={itinerary.title}
                      onChange={(e) => updateItineraryField('title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="destination">Destination</Label>
                    <Input 
                      id="destination"
                      value={itinerary.destination}
                      onChange={(e) => updateItineraryField('destination', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input 
                      id="startDate"
                      type="date"
                      value={itinerary.startDate}
                      onChange={(e) => updateItineraryField('startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input 
                      id="endDate"
                      type="date"
                      value={itinerary.endDate}
                      onChange={(e) => updateItineraryField('endDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="travelers">Travelers</Label>
                    <Input 
                      id="travelers"
                      type="number"
                      value={itinerary.travelers}
                      onChange={(e) => updateItineraryField('travelers', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Budget</Label>
                    <Input 
                      id="budget"
                      value={itinerary.budget}
                      onChange={(e) => updateItineraryField('budget', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={itinerary.theme} onValueChange={(value) => updateItineraryField('theme', value)}>
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
              </div>

              <Separator />

              {/* Flights */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-foreground flex items-center gap-2">
                  <Plane className="w-5 h-5 text-primary" />
                  Flight Details
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="departure">Departure Flight</Label>
                    <Input 
                      id="departure"
                      value={itinerary.flights.departure}
                      onChange={(e) => updateItineraryField('flights', { ...itinerary.flights, departure: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="return">Return Flight</Label>
                    <Input 
                      id="return"
                      value={itinerary.flights.return}
                      onChange={(e) => updateItineraryField('flights', { ...itinerary.flights, return: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Accommodation */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-foreground flex items-center gap-2">
                  <Hotel className="w-5 h-5 text-primary" />
                  Accommodation
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hotel">Hotel Name</Label>
                    <Input 
                      id="hotel"
                      value={itinerary.accommodation.hotel}
                      onChange={(e) => updateItineraryField('accommodation', { ...itinerary.accommodation, hotel: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <Input 
                      id="rating"
                      value={itinerary.accommodation.rating}
                      onChange={(e) => updateItineraryField('accommodation', { ...itinerary.accommodation, rating: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="nights">Number of Nights</Label>
                  <Input 
                    id="nights"
                    type="number"
                    value={itinerary.accommodation.nights}
                    onChange={(e) => updateItineraryField('accommodation', { ...itinerary.accommodation, nights: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <Separator />

              {/* Inclusions/Exclusions Editor */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-foreground mb-4">✅ Inclusions</h4>
                  <div className="space-y-2">
                    {itinerary.inclusions.map((inclusion, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={inclusion}
                          onChange={(e) => {
                            const newInclusions = [...itinerary.inclusions];
                            newInclusions[index] = e.target.value;
                            updateItineraryField('inclusions', newInclusions);
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newInclusions = itinerary.inclusions.filter((_, i) => i !== index);
                            updateItineraryField('inclusions', newInclusions);
                          }}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateItineraryField('inclusions', [...itinerary.inclusions, '']);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Inclusion
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-foreground mb-4">❌ Exclusions</h4>
                  <div className="space-y-2">
                    {itinerary.exclusions.map((exclusion, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={exclusion}
                          onChange={(e) => {
                            const newExclusions = [...itinerary.exclusions];
                            newExclusions[index] = e.target.value;
                            updateItineraryField('exclusions', newExclusions);
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newExclusions = itinerary.exclusions.filter((_, i) => i !== index);
                            updateItineraryField('exclusions', newExclusions);
                          }}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateItineraryField('exclusions', [...itinerary.exclusions, '']);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Exclusion
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Consultant Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-foreground">Travel Consultant</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="consultantName">Name</Label>
                    <Input
                      id="consultantName"
                      value={itinerary.consultant.name}
                      onChange={(e) => updateItineraryField('consultant', { ...itinerary.consultant, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="consultantEmail">Email</Label>
                    <Input
                      id="consultantEmail"
                      type="email"
                      value={itinerary.consultant.email}
                      onChange={(e) => updateItineraryField('consultant', { ...itinerary.consultant, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="consultantPhone">Phone</Label>
                    <Input
                      id="consultantPhone"
                      value={itinerary.consultant.phone}
                      onChange={(e) => updateItineraryField('consultant', { ...itinerary.consultant, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="consultantCompany">Company</Label>
                    <Input
                      id="consultantCompany"
                      value={itinerary.consultant.company}
                      onChange={(e) => updateItineraryField('consultant', { ...itinerary.consultant, company: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Right Panel - Live Preview */}
          <Card className="p-6 shadow-card overflow-y-auto bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-foreground">Live Preview</h3>
              <Badge variant="secondary">{itinerary.status}</Badge>
            </div>

            {/* PDF-Style Preview */}
            <div className="space-y-6 text-sm">
              {/* Header */}
              <div className="text-center border-b pb-4">
                <h1 className="text-2xl font-bold text-primary mb-2">{itinerary.title}</h1>
                <p className="text-lg text-muted-foreground">{itinerary.duration}</p>
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
                  <p><strong>Departure:</strong> {itinerary.flights.departure}</p>
                  <p><strong>Return:</strong> {itinerary.flights.return}</p>
                </div>
              </div>

              {/* Accommodation */}
              <div>
                <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <Hotel className="w-4 h-4" />
                  Accommodation
                </h3>
                <div className="space-y-1 text-muted-foreground">
                  <p><strong>Hotel:</strong> {itinerary.accommodation.hotel}</p>
                  <p><strong>Duration:</strong> {itinerary.accommodation.nights} nights</p>
                  <p><strong>Category:</strong> {itinerary.accommodation.rating}</p>
                </div>
              </div>

              {/* Day by Day */}
              <div>
                <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Day-by-Day Itinerary
                </h3>
                <div className="space-y-4">
                  {itinerary.days.map((day) => (
                    <div key={day.day} className="border border-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Day {day.day}</Badge>
                        <span className="text-sm text-muted-foreground">{day.date}</span>
                      </div>
                      <h4 className="font-semibold mb-2">{day.title}</h4>
                      
                      {/* Images */}
                      {day.images && day.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {day.images.map((image, idx) => (
                            <img
                              key={idx}
                              src={image}
                              alt={`${day.title} - Image ${idx + 1}`}
                              className="w-full h-24 object-cover rounded-md"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ))}
                        </div>
                      )}
                      
                      <ul className="space-y-1 text-muted-foreground text-sm mb-2">
                        {day.activities.map((activity, idx) => (
                          <li key={idx}>• {activity}</li>
                        ))}
                      </ul>
                      
                      {day.description && (
                        <p className="text-sm text-muted-foreground mb-2 italic">{day.description}</p>
                      )}
                      
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
                    {itinerary.inclusions.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-destructive mb-2">❌ Not Included</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {itinerary.exclusions.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Consultant Info */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-primary mb-2">Consultant Information</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p><strong>Name:</strong> {itinerary.consultant.name}</p>
                  <p><strong>Email:</strong> {itinerary.consultant.email}</p>
                  <p><strong>Phone:</strong> {itinerary.consultant.phone}</p>
                  <p><strong>Company:</strong> {itinerary.consultant.company}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditItinerary;