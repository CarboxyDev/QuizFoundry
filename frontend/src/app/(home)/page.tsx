import { Background } from "@/app/(home)/background";
import { FeaturesSection } from "@/app/(home)/features";
import { CTASection } from "@/app/(home)/final-cta";
import { Footer } from "@/app/(home)/footer";
import { HeroSection } from "@/app/(home)/hero";
import { HowItWorksSection } from "@/app/(home)/how-it-works";
import { QuizModesSection } from "@/app/(home)/quiz-modes";

export default function HomePage() {
  return (
    <>
      <Background />
      <div className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <QuizModesSection />
        <HowItWorksSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}
