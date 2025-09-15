import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useItinerary } from '@/contexts/ItineraryContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Plane, 
  Hotel,
  Download,
  MessageSquare,
  Send,
  CheckCircle
} from 'lucide-react';
import { Itinerary, Comment } from '@/types/itinerary';

const SharedItinerary = () => {
  const { shareToken } = useParams();
  const { toast } = useToast();
  const { updateItinerary, exportToPDF, getItineraryByShareToken } = useItinerary();
  
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commentSection, setCommentSection] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSharedItinerary = async () => {
      if (shareToken) {
        try {
          const foundItinerary = await getItineraryByShareToken(shareToken);
          setItinerary(foundItinerary);
        } catch (error) {
          console.error('Error loading shared itinerary:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadSharedItinerary();
  }, [shareToken, getItineraryByShareToken]);

  const handleAddComment = () => {
    if (!itinerary || !newComment.trim() || !commentSection) return;

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      section: commentSection,
      content: newComment,
      author: 'Client',
      timestamp: new Date().toISOString(),
      status: 'pending',
      type: 'feedback'
    };

    const updatedComments = [...itinerary.comments, comment];
    updateItinerary(itinerary.id, { 
      comments: updatedComments,
      status: 'feedback'
    });

    setNewComment('');
    setCommentSection('');
    
    toast({
      title: "Comment added!",
      description: "Your feedback has been sent to the travel consultant.",
    });
  };

  const handleApproveItinerary = () => {
    if (!itinerary) return;

    updateItinerary(itinerary.id, { status: 'approved' });
    
    toast({
      title: "Itinerary approved!",
      description: "Thank you for your approval. The consultant will be notified.",
    });
  };

  const handleExportPDF = () => {
    if (!itinerary) return;
    
    exportToPDF(itinerary.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your itinerary.</p>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Itinerary not found</h2>
          <p className="text-muted-foreground mb-6">The shared itinerary link may be invalid or expired.</p>
          <Button onClick={() => window.location.href = '/'}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Travel Itinerary</h1>
              <p className="text-muted-foreground">Review and provide feedback</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              {itinerary.status !== 'approved' && (
                <Button onClick={handleApproveItinerary} className="bg-success hover:bg-success/90">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Itinerary
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Itinerary */}
          <div className="lg:col-span-2">
            <Card className="p-6 shadow-card">
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
                  <h4 className="font-semibold text-primary mb-2">Your Travel Consultant</h4>
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

          {/* Sidebar - Comments & Feedback */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="p-4">
              <div className="text-center">
                <Badge 
                  variant={itinerary.status === 'approved' ? 'default' : 'secondary'}
                  className="mb-2"
                >
                  {itinerary.status}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {itinerary.status === 'approved' 
                    ? 'This itinerary has been approved' 
                    : 'Review the itinerary and provide feedback'}
                </p>
              </div>
            </Card>

            {/* Add Comment */}
            {itinerary.status !== 'approved' && (
              <Card className="p-4">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Add Feedback
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Section</label>
                    <select 
                      className="w-full mt-1 p-2 border border-border rounded-md text-sm"
                      value={commentSection}
                      onChange={(e) => setCommentSection(e.target.value)}
                    >
                      <option value="">Select section...</option>
                      <option value="general">General</option>
                      <option value="flights">Flights</option>
                      <option value="accommodation">Accommodation</option>
                      <option value="itinerary">Day-by-day Itinerary</option>
                      <option value="inclusions">Inclusions/Exclusions</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground">Your feedback</label>
                    <Textarea
                      placeholder="Share your thoughts or request changes..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || !commentSection}
                    className="w-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Feedback
                  </Button>
                </div>
              </Card>
            )}

            {/* Comments History */}
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Feedback History ({itinerary.comments.length})
              </h3>
              
              <div className="space-y-3">
                {itinerary.comments.map((comment) => (
                  <div key={comment.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{comment.author}</span>
                      <Badge variant="outline" className="text-xs">
                        {comment.section}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{comment.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                      <Badge 
                        variant={comment.status === 'resolved' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {comment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {itinerary.comments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No feedback yet
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedItinerary;