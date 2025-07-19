import {
  Background,
  CTASection,
  FeaturesSection,
  Footer,
  HeroSection,
  HowItWorksSection,
  QuizModesSection,
} from "@/components/landing";

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
