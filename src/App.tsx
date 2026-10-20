import React, { useState } from 'react';
import { Language, UserProfile, MatrixSelection } from './types';
import type { NavView } from './components/Sidebar';
import { BurmesePromptMatrix } from './components/BurmesePromptMatrix';
import { ProfessionalStudioWorkstation } from './components/ProfessionalStudioWorkstation';
import { CompositeHarmonizerStudio } from './components/CompositeHarmonizerStudio';
import { PhotoManipulationStudio } from './components/PhotoManipulationStudio';
import { BabyStudioView } from './components/BabyStudioView';
import { PhotoEditStudio } from './components/PhotoEditStudio';
import { PromptUtilitySuite } from './components/PromptUtilitySuite';
import { PresetLibraryView } from './components/PresetLibraryView';
import { SavedPromptsView, SavedPromptItem } from './components/SavedPromptsView';
import { UserDashboardModal } from './components/dashboard/UserDashboardModal';
import { MyanmarPresentationSlides } from './components/MyanmarPresentationSlides';
import { VideoPromptStudio } from './components/VideoPromptStudio';
import { PhotoPromptStudio } from './components/PhotoPromptStudio';
import { MainPortalHub, MainSectionType } from './components/MainPortalHub';
import { DetailBurmeseHub, DetailBurmeseRoom } from './components/DetailBurmeseHub';
import { StorageService } from './utils/storageService';
import { SupabaseCloudHub } from './components/SupabaseCloudHub';
import { SupabaseService } from './utils/supabaseClient';
import { ScrollProgressBar } from './components/ScrollProgressBar';

const DEFAULT_SELECTION: MatrixSelection = {
  subject: 'woman',
  customSubjectDetails: 'Bagan Royal Lady',
  event: 'thingyan',
  customEventDetails: '',
  location: 'bagan_temples',
  customLocationDetails: '',
  timeAndLighting: 'golden_hour_sunset',
  customLightingDetails: '',
  camera: 'hasselblad_x2d',
  cameraAngle: 'eye_level',
  retouching: 'ultra_realism',
  makeup: 'traditional_myanmar',
  colorGrade: 'kodak_portra',
  aspectRatio: '16:9',
  qualityProfile: '8k_uhd',
  garmentStyle: 'traditional_myanmar_royal',
  garmentFabric: 'Woven Silk with Water Droplets',
  identityLock: 'face_100',
  referenceImage: null,
  referenceImageMale: null,
  referenceImageFemale: null,
  poseExpression: 'looking_at_camera',
  customPoseDetails: '',
  ethnicity: 'burmese',
  customEthnicityDetails: '',
  includeCulturalProps: true,
  culturalPropsDetails: 'Pathein Parasol and Mogok Ruby',
  clothesSwapOption: 'in_app_preset',
  customGarmentImage: null,
  customGarmentDescription: '',
  moodEmotion: 'joyful_celebratory',
  styleStrength: 0.75,
  promptWeight: 0.8,
  customInstruction: ''
};

const CLEAN_RESET_SELECTION: MatrixSelection = {
  subject: '',
  customSubjectDetails: '',
  event: 'skip',
  customEventDetails: '',
  location: 'skip',
  customLocationDetails: '',
  timeAndLighting: 'skip',
  customLightingDetails: '',
  camera: 'skip',
  cameraAngle: 'skip',
  retouching: 'skip',
  makeup: 'skip',
  colorGrade: 'skip',
  aspectRatio: '',
  qualityProfile: 'skip',
  garmentStyle: 'skip',
  garmentFabric: '',
  identityLock: 'no_lock',
  referenceImage: null,
  referenceImageMale: null,
  referenceImageFemale: null,
  poseExpression: 'skip',
  customPoseDetails: '',
  ethnicity: '',
  customEthnicityDetails: '',
  includeCulturalProps: false,
  culturalPropsDetails: '',
  clothesSwapOption: undefined,
  customGarmentImage: null,
  customGarmentDescription: '',
  moodEmotion: 'skip',
  styleStrength: 0.75,
  promptWeight: 0.8,
  customInstruction: ''
};

export default function App() {
  const [activeMainSection, setActiveMainSection] = useState<'portal' | 'video-prompt' | 'photo-prompt' | 'detail-burmese'>('portal');
  const [detailBurmeseRoom, setDetailBurmeseRoom] = useState<DetailBurmeseRoom>('prompt-builder');
  const [activeView, setActiveView] = useState<NavView>('portal');
  const [engine, setEngine] = useState<string>('midjourney-v6');
  const [language, setLanguage] = useState<Language>('en');
  const [selection, setSelection] = useState<MatrixSelection>(DEFAULT_SELECTION);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(StorageService.getCurrentUser());
  const [photoToTextImage, setPhotoToTextImage] = useState<string | null>(null);
  const [photoStudioInitialPrompt, setPhotoStudioInitialPrompt] = useState<string>('');
  const [photoStudioInitialRatio, setPhotoStudioInitialRatio] = useState<string | undefined>(undefined);
  const [photoStudioInitialRefPhoto, setPhotoStudioInitialRefPhoto] = useState<string | null>(null);
  const [photoStudioInitialRefPhotos, setPhotoStudioInitialRefPhotos] = useState<
    (string | { url: string; name?: string; id?: string })[]
  >([]);
  const [photoStudioChosenOptions, setPhotoStudioChosenOptions] = useState<
    { label: string; value: string; emoji?: string }[]
  >([]);

  const handleSendToPhotoPromptStudio = (
    promptText: string,
    options?: {
      ratio?: string;
      referencePhoto?: string | null;
      referencePhotos?: (string | { url: string; name?: string; id?: string })[];
      chosenOptions?: { label: string; value: string; emoji?: string }[];
    }
  ) => {
    const session = SupabaseService.getSession();
    if (!session) {
      window.dispatchEvent(new CustomEvent('open-supabase-auth', { detail: { targetSection: 'photo-prompt' } }));
      return;
    }
    setPhotoStudioInitialPrompt(promptText);
    if (options?.ratio) setPhotoStudioInitialRatio(options.ratio);
    if (options?.referencePhoto !== undefined) setPhotoStudioInitialRefPhoto(options.referencePhoto);
    if (options?.referencePhotos && options.referencePhotos.length > 0) {
      setPhotoStudioInitialRefPhotos(options.referencePhotos);
    } else if (options?.referencePhoto) {
      setPhotoStudioInitialRefPhotos([options.referencePhoto]);
    } else {
      setPhotoStudioInitialRefPhotos([]);
    }
    if (options?.chosenOptions && options.chosenOptions.length > 0) {
      setPhotoStudioChosenOptions(options.chosenOptions);
    } else {
      setPhotoStudioChosenOptions([]);
    }
    setActiveMainSection('photo-prompt');
    setActiveView('photo-prompt-studio');
  };

  const handleSelectMainSection = (sec: 'portal' | 'video-prompt' | 'photo-prompt' | 'detail-burmese') => {
    if (sec !== 'portal') {
      const session = SupabaseService.getSession();
      if (!session) {
        window.dispatchEvent(new CustomEvent('open-supabase-auth', { detail: { targetSection: sec } }));
        return;
      }
    }
    setActiveMainSection(sec);
    if (sec === 'video-prompt') setActiveView('video-prompt-studio');
    else if (sec === 'photo-prompt') setActiveView('photo-prompt-studio');
    else if (sec === 'detail-burmese') {
      setActiveView('prompt-builder');
      setDetailBurmeseRoom('prompt-builder');
    } else {
      setActiveView('portal');
    }
  };

  const handleNavViewChange = (view: NavView) => {
    if (view !== 'portal' && view !== 'presentation-slides') {
      const session = SupabaseService.getSession();
      if (!session) {
        let sec: 'video-prompt' | 'photo-prompt' | 'detail-burmese' = 'photo-prompt';
        if (view === 'video-prompt-studio') sec = 'video-prompt';
        else if (view === 'photo-prompt-studio') sec = 'photo-prompt';
        else sec = 'detail-burmese';
        window.dispatchEvent(new CustomEvent('open-supabase-auth', { detail: { targetSection: sec } }));
        return;
      }
    }
    setActiveView(view);
    if (view === 'portal') {
      setActiveMainSection('portal');
    } else if (view === 'video-prompt-studio') {
      setActiveMainSection('video-prompt');
    } else if (view === 'photo-prompt-studio') {
      setActiveMainSection('photo-prompt');
    } else if (view === 'presentation-slides') {
      // Presentation slides overlay
    } else {
      setActiveMainSection('detail-burmese');
      setDetailBurmeseRoom(view as DetailBurmeseRoom);
    }
  };

  // Saved prompts collection
  const [savedPrompts, setSavedPrompts] = useState<SavedPromptItem[]>([
    {
      id: 'saved-1',
      title: 'Mandalay Palace Moat Sunset',
      timestamp: 'Yesterday at 4:32 PM',
      prompt: 'Editorial National Geographic photography of an authentic Konbaung Royal Court Noblewoman, gentle honey-olive skin with circular Thanaka paste patterns on cheeks, adorned in Royal Velvet Yadanabon Ein Gyi, Sadon hair coiffure with fragrant Jasmine cascade, looking towards the Mandalay Palace moat at crimson sunset, illuminated by warm golden rim lighting, Hasselblad 100mm f/1.4 lens, 8k resolution --ar 16:9 --style raw --v 6.1',
      metadata: { era: 'Konbaung', ratio: '16:9' }
    },
    {
      id: 'saved-2',
      title: 'Intha Leg Rower Dawn Mist',
      timestamp: '2 days ago',
      prompt: 'National Geographic ethnographic master portrait of an authentic Intha fisherman balancing on one leg on the prow of a wooden longboat, holding a traditional conical bamboo fishing net over calm glass Inle Lake at sunrise mist, Shan misty mountains, Hasselblad 100mm f/1.4 lens --ar 4:5 --style raw --v 6.1',
      metadata: { era: 'Shan State', ratio: '4:5' }
    }
  ]);

  const handleUpdateSelection = (updates: Partial<MatrixSelection>) => {
    setSelection(prev => ({ ...prev, ...updates }));
  };

  const handleResetAll = () => {
    setSelection({ ...CLEAN_RESET_SELECTION });
  };

  // Handle saving a prompt from Prompt Matrix
  const handleSavePrompt = (promptText: string, metadata: any) => {
    const newItem: SavedPromptItem = {
      id: `saved-${Date.now()}`,
      title: `${metadata.archetype || 'Custom'} in ${metadata.setting || 'Heritage Setting'}`,
      prompt: promptText,
      timestamp: 'Just now',
      metadata
    };
    setSavedPrompts(prev => [newItem, ...prev]);
  };

  const handleDeleteSavedPrompt = (id: string) => {
    setSavedPrompts(prev => prev.filter(p => p.id !== id));
  };

  const handleClearAllSaved = () => {
    setSavedPrompts([]);
  };

  // When user clicks "Load Matrix" from Preset Library or Saved Prompts
  const handleLoadPromptToMatrix = (promptText: string) => {
    handleUpdateSelection({ customInstruction: promptText });
    setActiveView('prompt-builder');
  };

  // Generate Prompt Action via backend / API & save to Supabase Cloud
  const handleGeneratePrompt = async (promptText: string) => {
    const session = SupabaseService.getSession();
    if (!session) {
      window.dispatchEvent(new CustomEvent('open-supabase-auth', { detail: { targetSection: 'detail-burmese' } }));
      return;
    }

    setIsGenerating(true);
    try {
      if (SupabaseService.isConfigured()) {
        const creditRes = await SupabaseService.deductCredits(1, 'prompt_generation', 'Burmese Detail Master Prompt Generation');
        if (!creditRes.success) {
          alert(creditRes.error || 'Insufficient credits (Requires 1 Credit)');
          setIsGenerating(false);
          return;
        }
        window.dispatchEvent(new CustomEvent('supabase-cloud-refresh'));
      }

      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selection,
          customInstruction: selection.customInstruction || '',
          language
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.promptData) {
          const generatedMaster = data.promptData.masterPrompt || data.promptData.midjourneyFormat || promptText;
          if (generatedMaster) {
            handleSavePrompt(generatedMaster, {
              archetype: selection.customSubjectDetails || selection.subject || 'Burmese Portrait',
              setting: selection.location || 'Heritage Setting',
              ratio: selection.aspectRatio || '16:9'
            });
            if (SupabaseService.isConfigured() && SupabaseService.getSession()) {
              await SupabaseService.saveHistoryRecord({
                mode: 'burmese-detail',
                masterPrompt: generatedMaster,
                negativePrompt: data.promptData.negativePrompt || '',
                burmeseExplanation: data.promptData.burmeseExplanation || '',
                aspectRatio: selection.aspectRatio || '16:9',
                folder: 'Portraits',
                creditsUsed: 1
              });
              window.dispatchEvent(new Event('supabase-cloud-refresh'));
            }
          }
        }
      }
    } catch (err) {
      console.warn('API generation fallback to client synthesis', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export action: prompt file download
  const handleExportPrompt = () => {
    const blob = new Blob(
      [
        `MINGALAR AI STUDIO - BURMESE PROMPT ARCHIVE\n` +
        `Engine: ${engine}\n` +
        `Export Date: ${new Date().toLocaleString()}\n` +
        `----------------------------------------\n\n` +
        savedPrompts.map((p, idx) => `[0${idx + 1}] ${p.title}\n${p.prompt}\n`).join('\n')
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mingalar-burmese-prompts-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SupabaseCloudHub 
      currentUser={currentUser} 
      onUserChange={setCurrentUser}
      isPortal={activeMainSection === 'portal'}
      onNavigateToSection={handleSelectMainSection}
      onSignOut={() => {
        setActiveMainSection('portal');
        setActiveView('portal');
      }}
    >
      <div className="min-h-screen bg-[#090a0f] text-[#1c1c1e] font-sans antialiased selection:bg-[#ffd02f] selection:text-[#1c1c1e]">
        <div>
          <main className="relative min-h-screen w-full overflow-x-hidden">
            <ScrollProgressBar />
            
            {/* VIEW: Myanmar Presentation Slides */}
            {activeView === 'presentation-slides' && (
              <div className="min-h-screen bg-[#fafbfc]">
                <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#e0e2e8] px-3 sm:px-6 py-2.5">
                  <button
                    type="button"
                    onClick={() => handleNavViewChange('portal')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f4f5f8] hover:bg-[#e9ebf0] text-zinc-800 text-xs font-semibold border border-zinc-300/80 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                    <span>3 Sections</span>
                  </button>
                </div>
                <MyanmarPresentationSlides
                  onNavigateToSection={(targetView) => handleNavViewChange(targetView)}
                />
              </div>
            )}

            {/* SECTION 0: Portal Entry Hub (3 Animated Buttons) */}
            {activeView !== 'presentation-slides' && activeMainSection === 'portal' && (
              <MainPortalHub
                onSelectSection={handleSelectMainSection}
                onOpenSlides={() => setActiveView('presentation-slides')}
              />
            )}

            {/* SECTION 1: Video Prompt Studio */}
            {activeView !== 'presentation-slides' && activeMainSection === 'video-prompt' && (
              <VideoPromptStudio
                onBackToMatrix={() => {
                  setActiveMainSection('detail-burmese');
                  setDetailBurmeseRoom('prompt-builder');
                  setActiveView('prompt-builder');
                }}
                onBackToPortal={() => {
                  setActiveMainSection('portal');
                  setActiveView('portal');
                }}
              />
            )}

            {/* SECTION 2: Photo Prompt Studio */}
            {activeView !== 'presentation-slides' && activeMainSection === 'photo-prompt' && (
              <PhotoPromptStudio
                initialPrompt={photoStudioInitialPrompt}
                initialRatio={photoStudioInitialRatio}
                initialRefPhoto={photoStudioInitialRefPhoto}
                initialRefPhotos={photoStudioInitialRefPhotos}
                initialChosenOptions={photoStudioChosenOptions}
                onNavigateView={(view, photo) => {
                  if (photo) setPhotoToTextImage(photo);
                  handleNavViewChange(view);
                }}
                onBackToMatrix={() => {
                  setActiveMainSection('detail-burmese');
                  setDetailBurmeseRoom('prompt-builder');
                  setActiveView('prompt-builder');
                }}
                onBackToPortal={() => {
                  setActiveMainSection('portal');
                  setActiveView('portal');
                }}
              />
            )}

            {/* SECTION 3: Detail Burmese (8-Room Studio Suite & Prompt Utilities) */}
            {activeView !== 'presentation-slides' && activeMainSection === 'detail-burmese' && (
              <DetailBurmeseHub
                language={language}
                engine={engine}
                onEngineChange={setEngine}
                selection={selection}
                onUpdateSelection={handleUpdateSelection}
                onResetAll={handleResetAll}
                onGeneratePrompt={handleGeneratePrompt}
                isGenerating={isGenerating}
                onSavePrompt={handleSavePrompt}
                savedPrompts={savedPrompts}
                onDeleteSavedPrompt={handleDeleteSavedPrompt}
                onClearAllSaved={handleClearAllSaved}
                onLoadPromptToMatrix={handleLoadPromptToMatrix}
                onSendToPhotoStudio={handleSendToPhotoPromptStudio}
                onBackToPortal={() => {
                  setActiveMainSection('portal');
                  setActiveView('portal');
                }}
                initialRoom={detailBurmeseRoom}
              />
            )}

          </main>
        </div>

        {/* User Dashboard Modal */}
        <UserDashboardModal
          isOpen={isUserDashboardOpen}
          onClose={() => setIsUserDashboardOpen(false)}
          currentUser={currentUser}
          onUserUpdate={setCurrentUser}
          language={language}
          onSelectPromptToUse={handleLoadPromptToMatrix}
        />

      </div>
    </SupabaseCloudHub>
  );
}
