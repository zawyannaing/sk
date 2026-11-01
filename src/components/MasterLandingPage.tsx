import React, { useState } from 'react';
import { MasterLandingPageProps } from './landing/types';
import { LandingNavbar } from './landing/LandingNavbar';
import { LandingHero } from './landing/LandingHero';
import { StickyStorytelling } from './landing/StickyStorytelling';
import { AIPhotoToolsShowcase } from './landing/AIPhotoToolsShowcase';
import { BeforeAfterShowcase } from './landing/BeforeAfterShowcase';
import { CreditsCalculator } from './landing/CreditsCalculator';
import { FinalCtaFooter } from './landing/FinalCtaFooter';
import { DemoVideoModal } from './landing/DemoVideoModal';

export const MasterLandingPage: React.FC<MasterLandingPageProps> = ({
  onLaunch,
  onSignIn,
  language,
  onLanguageChange,
  isLoggedIn = false
}) => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300 font-sans antialiased overflow-x-hidden">
      {/* Top sticky navigation bar with active scroll spy */}
      <LandingNavbar
        language={language}
        onLanguageChange={onLanguageChange}
        onLaunch={onLaunch}
        onSignIn={onSignIn}
        isLoggedIn={isLoggedIn}
      />

      <main>
        {/* Hero Section: Hologram glow, typography, CTAs, interactive counters */}
        <LandingHero
          language={language}
          onLaunch={onLaunch}
          onOpenDemo={() => setIsDemoModalOpen(true)}
        />

        {/* Feature Storytelling: Desktop sticky pinned scroll presentation, mobile stacked cards */}
        <StickyStorytelling
          language={language}
          onLaunchStudio={onLaunch}
        />

        {/* AI Photo Tools: Face Swap, Background Replacement & Pro Image Editing */}
        <AIPhotoToolsShowcase
          language={language}
          onLaunch={onLaunch}
        />

        {/* Before / After Interactive Slider: Raw product to commercial ad poster */}
        <BeforeAfterShowcase
          language={language}
        />

        {/* Daily 250 Credits Simulator & Cost Tiers */}
        <CreditsCalculator
          language={language}
          onLaunch={onLaunch}
        />

        {/* Grand Final CTA & Cultural Heritage Footer */}
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
