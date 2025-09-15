import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Itinerary, Comment } from '@/types/itinerary';

interface FeedbackSectionProps {
  itinerary: Itinerary;
  onUpdateItinerary: (updates: Partial<Itinerary>) => void;
  isOwner?: boolean;
}

const FeedbackSection = ({ itinerary, onUpdateItinerary, isOwner = false }: FeedbackSectionProps) => {
  const [replyText, setReplyText] = useState('');
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const { toast } = useToast();

  const pendingComments = itinerary.comments.filter(c => c.status === 'pending');
  const addressedComments = itinerary.comments.filter(c => c.status === 'addressed');
  const resolvedComments = itinerary.comments.filter(c => c.status === 'resolved');

  const handleResolveComment = (commentId: string) => {
    const updatedComments = itinerary.comments.map(comment =>
      comment.id === commentId ? { ...comment, status: 'resolved' as const } : comment
    );
    
    onUpdateItinerary({ comments: updatedComments });
    
    toast({
      title: "Comment resolved",
      description: "The feedback has been marked as resolved.",
    });
  };

  const handleAddressComment = (commentId: string) => {
    if (!replyText.trim()) return;

    const updatedComments = itinerary.comments.map(comment =>
      comment.id === commentId ? { ...comment, status: 'addressed' as const } : comment
    );

    // Add consultant reply as new comment
    const replyComment: Comment = {
      id: `reply_${Date.now()}`,
      section: 'response',
      content: replyText,
      author: 'Consultant',
      timestamp: new Date().toISOString(),
      status: 'addressed',
      type: 'feedback'
    };

    onUpdateItinerary({ 
      comments: [...updatedComments, replyComment],
      status: 'feedback'
    });

    setReplyText('');
    setSelectedCommentId(null);
    
    toast({
      title: "Response sent",
      description: "Your response has been sent to the client.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'addressed':
        return <AlertCircle className="w-4 h-4 text-info" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'addressed':
        return 'bg-info/10 text-info border-info/20';
      case 'resolved':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-secondary/10 text-secondary border-secondary/20';
    }
  };

  if (!isOwner) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Feedback History ({itinerary.comments.length})
        </h3>
        
        <div className="space-y-3">
          {itinerary.comments.map((comment) => (
            <div key={comment.id} className={`border rounded-lg p-3 ${getStatusColor(comment.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{comment.author}</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(comment.status)}
                  <Badge variant="outline" className="text-xs">
                    {comment.section}
                  </Badge>
                </div>
              </div>
              <p className="text-sm mb-2">{comment.content}</p>
              <span className="text-xs opacity-70">
                {new Date(comment.timestamp).toLocaleDateString()}
              </span>
            </div>
          ))}
          
          {itinerary.comments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No feedback yet
            </p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-warning mb-1">{pendingComments.length}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-info mb-1">{addressedComments.length}</div>
          <div className="text-sm text-muted-foreground">Addressed</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-success mb-1">{resolvedComments.length}</div>
          <div className="text-sm text-muted-foreground">Resolved</div>
        </Card>
      </div>

      {/* Feedback Management */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Client Feedback Management
        </h3>
        
        <div className="space-y-4">
          {/* Pending Comments */}
          {pendingComments.length > 0 && (
            <div>
              <h4 className="font-medium text-warning mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending Feedback ({pendingComments.length})
              </h4>
              <div className="space-y-3">
                {pendingComments.map((comment) => (
                  <div key={comment.id} className="border border-warning/20 rounded-lg p-4 bg-warning/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{comment.author}</span>
                      <Badge variant="outline" className="text-xs">
                        {comment.section}
                      </Badge>
                    </div>
                    <p className="text-sm mb-3">{comment.content}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCommentId(comment.id)}
                      >
                        Reply
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleResolveComment(comment.id)}
                      >
                        Mark Resolved
                      </Button>
                    </div>
                    
                    {selectedCommentId === comment.id && (
                      <div className="mt-3 p-3 border border-border rounded-lg bg-background">
                        <Textarea
                          placeholder="Type your response to address this feedback..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="mb-3"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAddressComment(comment.id)}
                            disabled={!replyText.trim()}
                          >
                            Send Response
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedCommentId(null);
                              setReplyText('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Comments History */}
          <div>
            <h4 className="font-medium text-foreground mb-3">All Feedback History</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {itinerary.comments.map((comment) => (
                <div key={comment.id} className={`border rounded-lg p-3 ${getStatusColor(comment.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{comment.author}</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(comment.status)}
                      <Badge variant="outline" className="text-xs">
                        {comment.section}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm mb-2">{comment.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs opacity-70">
                      {new Date(comment.timestamp).toLocaleDateString()}
                    </span>
                    {comment.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleResolveComment(comment.id)}
                      >
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {itinerary.comments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No feedback received yet
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FeedbackSection;