import { Background } from "@/components/landing/Background";
import { CTASection } from "@/components/landing/CTASection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Footer } from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { QuizModesSection } from "@/components/landing/QuizModesSection";

export default function HomePage() {
  return (
    <div className="from-background via-muted/20 to-background relative min-h-screen bg-gradient-to-br">
      <Background />
      <HeroSection />
      <FeaturesSection />
      <QuizModesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}
