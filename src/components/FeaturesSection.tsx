import { Card } from "@/components/ui/card";
import { 
  Brain, 
  Users, 
  FileText, 
  MessageSquare, 
  Zap, 
  Shield,
  Globe,
  Smartphone,
  BarChart3
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Generation",
    description: "Input basic trip details and let AI create a complete itinerary with attractions, hotels, and dining recommendations.",
    color: "text-primary"
  },
  {
    icon: Users,
    title: "Client Collaboration",
    description: "Share interactive itineraries with clients. They can comment, request changes, and approve plans in real-time.",
    color: "text-secondary"
  },
  {
    icon: FileText,
    title: "Professional PDF Export",
    description: "Generate branded, print-ready PDFs with your logo, contact details, and terms & conditions.",
    color: "text-travel-accent"
  },
  {
    icon: MessageSquare,
    title: "Live Comments & Feedback",
    description: "Clients can comment directly on itinerary sections. Get instant notifications and manage feedback seamlessly.",
    color: "text-primary"
  },
  {
    icon: Zap,
    title: "Real-Time Preview",
    description: "See changes instantly with our split-pane editor. Left side for editing, right side for live PDF preview.",
    color: "text-secondary"
  },
  {
    icon: Shield,
    title: "Version Control",
    description: "Track all changes with complete version history. Easily revert to previous versions or compare iterations.",
    color: "text-travel-accent"
  },
  {
    icon: Globe,
    title: "Global Destinations",
    description: "Pre-loaded database of attractions, hotels, and experiences across 100+ countries and 1000+ cities.",
    color: "text-primary"
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    description: "Clients can review and comment on itineraries from any device. Fully responsive design for mobile and tablet.",
    color: "text-secondary"
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Track client engagement, conversion rates, and popular destinations. Optimize your travel business with data.",
    color: "text-travel-accent"
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need to Create 
            <span className="block text-primary mt-2">Amazing Travel Experiences</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professional tools designed for travel agents, tour operators, and travel consultants who want to deliver exceptional client experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-travel transition-all duration-300 group border-2 hover:border-primary/20">
                <div className="mb-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-6 h-6 ${feature.color}`} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-gradient-primary rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Trusted by Travel Professionals Worldwide
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">500+</div>
              <div className="text-white/90">Travel Agents</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">10K+</div>
              <div className="text-white/90">Itineraries</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">95%</div>
              <div className="text-white/90">Client Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">150+</div>
              <div className="text-white/90">Countries</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;