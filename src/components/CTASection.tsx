import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

const benefits = [
  "Create professional itineraries in under 10 minutes",
  "AI-powered suggestions for attractions and hotels",
  "Real-time client collaboration and feedback",
  "Branded PDF exports with your company details",
  "Mobile-responsive client review experience"
];

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-full" />
        <div className="absolute bottom-32 right-32 w-24 h-24 border-2 border-white rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-16 h-16 border-2 border-white rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Ready to Transform Your
          <span className="block">Travel Business?</span>
        </h2>
        
        <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
          Join hundreds of travel professionals who've already streamlined their itinerary creation process.
        </p>

        {/* Benefits List */}
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3 text-white/90">
              <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" />
              <span className="text-left">{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button variant="hero" size="lg" className="group bg-white text-primary hover:bg-white/90">
            Start Free Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="lg" className="bg-transparent border-white/30 text-white hover:bg-white/10">
            Schedule Demo
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="text-white/70 text-sm">
          <p className="mb-2">✨ No credit card required • 14-day free trial • Cancel anytime</p>
          <p>🔒 SOC 2 compliant • GDPR ready • Enterprise security</p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;