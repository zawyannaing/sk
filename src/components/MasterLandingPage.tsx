import React, { useState } from 'react';
import { MasterLandingPageProps } from './landing/types';
import { LandingNavbar } from './landing/LandingNavbar';
import { LandingHero } from './landing/LandingHero';
import { ScrollVideoScrubber } from './landing/ScrollVideoScrubber';
import { SocialProofTrustBar } from './landing/SocialProofTrustBar';
import { CreditsCalculator } from './landing/CreditsCalculator';
import { FinalCtaFooter } from './landing/FinalCtaFooter';
import { DemoVideoModal } from './landing/DemoVideoModal';

export const MasterLandingPage: React.FC<MasterLandingPageProps> = ({
  onLaunch,
  onSignIn,
  language,
  onLanguageChange,
  isLoggedIn = false,
  onOpenScenes
}) => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  return (
    <div
      style={{
        paddingTop: 'var(--top-banner-height, 0px)',
        transition: 'padding-top 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300 font-sans antialiased overflow-x-hidden"
    >
      {/* 1. Sleek Floating Top Header Navigation Bar with Spring Physics Buttons */}
      <LandingNavbar
        language={language}
        onLanguageChange={onLanguageChange}
        onLaunch={onLaunch}
        onSignIn={onSignIn}
        isLoggedIn={isLoggedIn}
        onOpenScenes={onOpenScenes}
      />

      <main>
        {/* 1. Cinematic 3D Stream Hero (Apple / 21st.dev Style): Bold Headline, Primary CTA, 3D Infinite Heritage Corridor */}
        <LandingHero
          language={language}
          onLaunch={onLaunch}
          onOpenDemo={() => setIsDemoModalOpen(true)}
          onOpenScenes={onOpenScenes}
        />

        {/* 2. Scroll-Driven 5s Video Cinema Scrubber */}
        <ScrollVideoScrubber
          language={language}
          onLaunch={onLaunch}
        />

        {/* 3. Social Proof / Trust Bar: Placed directly under Video Stage */}
        <SocialProofTrustBar
          language={language}
        />

        {/* 4. Daily 250 Credits Simulator & Pricing */}
        <CreditsCalculator
          language={language}
          onLaunch={onLaunch}
        />

        {/* 8. Grand Final CTA & Cultural Heritage Footer */}
        <FinalCtaFooter
          language={language}
          onLanguageChange={onLanguageChange}
          onLaunch={onLaunch}
          onSignIn={onSignIn}
          isLoggedIn={isLoggedIn}
        />
      </main>

      {/* Demo Video Modal */}
      <DemoVideoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        language={language}
      />
    </div>
  );
};

export default MasterLandingPage;
