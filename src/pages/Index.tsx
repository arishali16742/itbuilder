import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import ItineraryBuilder from "@/components/ItineraryBuilder";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <div id="builder">
        <ItineraryBuilder />
      </div>
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
