import React, { useState } from 'react';
import { Language, UserProfile, MatrixSelection } from './types';
import { Sidebar, NavView } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { BurmesePromptMatrix } from './components/BurmesePromptMatrix';
import { AjaxStudioSuiteView } from './components/AjaxStudioSuiteView';
import { ProfessionalStudioWorkstation } from './components/ProfessionalStudioWorkstation';
import { PhotoToTextGeneratorView } from './components/PhotoToTextGeneratorView';
import { CompositeHarmonizerStudio } from './components/CompositeHarmonizerStudio';
import { PhotoManipulationStudio } from './components/PhotoManipulationStudio';
import { BabyStudioView } from './components/BabyStudioView';
import { OldPhotoToNewPhotoStudio } from './components/OldPhotoToNewPhotoStudio';
import { PhotoEditStudio } from './components/PhotoEditStudio';
import { PromptUtilitySuite } from './components/PromptUtilitySuite';
import { PresetLibraryView } from './components/PresetLibraryView';
import { SavedPromptsView, SavedPromptItem } from './components/SavedPromptsView';
import { UserDashboardModal } from './components/dashboard/UserDashboardModal';
import { MyanmarPresentationSlides } from './components/MyanmarPresentationSlides';
import { StorageService } from './utils/storageService';

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
  subject: 'woman',
  customSubjectDetails: '',
  event: 'skip',
  customEventDetails: '',
  location: 'skip',
  customLocationDetails: '',
  timeAndLighting: 'skip',
  customLightingDetails: '',
  camera: 'sony_a7rv',
  cameraAngle: 'eye_level',
  retouching: 'skip',
  makeup: 'skip',
  colorGrade: 'skip',
  aspectRatio: '16:9',
  qualityProfile: 'skip',
  garmentStyle: 'skip',
  garmentFabric: '',
  identityLock: 'no_lock',
  referenceImage: null,
  referenceImageMale: null,
  referenceImageFemale: null,
  poseExpression: 'skip',
  customPoseDetails: '',
  ethnicity: 'burmese',
  customEthnicityDetails: '',
  includeCulturalProps: false,
  culturalPropsDetails: '',
  clothesSwapOption: 'in_app_preset',
  customGarmentImage: null,
  customGarmentDescription: '',
  moodEmotion: 'skip',
  styleStrength: 0.75,
  promptWeight: 0.8,
  customInstruction: ''
};

export default function App() {
  const [activeView, setActiveView] = useState<NavView>('studio-suite');
  const [engine, setEngine] = useState<string>('midjourney-v6');
  const [language, setLanguage] = useState<Language>('en');
  const [selection, setSelection] = useState<MatrixSelection>(DEFAULT_SELECTION);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(StorageService.getCurrentUser());
  const [photoToTextImage, setPhotoToTextImage] = useState<string | null>(null);

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

  // Generate Prompt Action via backend / API
  const handleGeneratePrompt = async (promptText: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selection: {
            ...selection,
            customInstruction: promptText
          },
          language
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.promptData) {
          // Success response
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

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#1c1c1e] font-sans antialiased selection:bg-[#ffd02f] selection:text-[#1c1c1e]">
      
      {/* 🌟 1. FIXED LEFT SIDEBAR */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        savedPromptsCount={savedPrompts.length}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />

      {/* 🌟 2. OFFSET WRAPPER */}
      <div className={`transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
        
        {/* Fixed Top Header */}
        <TopNavbar
          engine={engine}
          onEngineChange={setEngine}
          language={language}
          onLanguageChange={setLanguage}
          onGenerate={() => handleGeneratePrompt('Generate master prompt')}
          isGenerating={isGenerating}
          onExport={handleExportPrompt}
          onOpenUserDashboard={() => setIsUserDashboardOpen(true)}
          onOpenSlides={() => setActiveView('presentation-slides')}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        />

        {/* Main Workspace Body with Miro Canvas Dots */}
        <main className="relative pt-16 bg-[#fafbfc] min-h-screen pb-16">
          
          {/* VIEW: Myanmar Presentation Slides & Interactive Section Guides */}
          {activeView === 'presentation-slides' && (
            <MyanmarPresentationSlides
              onNavigateToSection={(targetView) => setActiveView(targetView)}
            />
          )}

          {/* VIEW: Pro Studio Workstation (Capture One & Lightroom Level) */}
          {activeView === 'pro-workstation' && (
            <ProfessionalStudioWorkstation
              language={language}
              onSendToMatrix={handleLoadPromptToMatrix}
              onSavePrompt={handleSavePrompt}
              engine={engine}
              onNavigateView={(view, photo) => {
                if (photo) setPhotoToTextImage(photo);
                setActiveView(view);
              }}
              initialPhoto={photoToTextImage || undefined}
            />
          )}

          {/* VIEW: 8-Room Studio Master Suite (Official Ajax Click AI Studio Specs) */}
          {activeView === 'studio-suite' && (
            <AjaxStudioSuiteView
              language={language}
              onSendToMatrix={handleLoadPromptToMatrix}
              onSavePrompt={handleSavePrompt}
              engine={engine}
              onNavigateView={(view, photo) => {
                if (photo) setPhotoToTextImage(photo);
                setActiveView(view);
              }}
            />
          )}

          {/* VIEW: Photo to Text Generator & Reverse Prompt Studio */}
          {activeView === 'photo-to-text' && (
            <PhotoToTextGeneratorView
              language={language}
              onSendToMatrix={handleLoadPromptToMatrix}
              onSendToStudioDesk={() => {
                setActiveView('studio-suite');
              }}
              onSavePrompt={handleSavePrompt}
              engine={engine}
              initialImage={photoToTextImage}
            />
          )}

          {/* VIEW: Composite Harmonizer (Background Change & Contact Shadows) */}
          {activeView === 'composite-harmonizer' && (
            <CompositeHarmonizerStudio
              language={language}
              onSendToMatrix={handleLoadPromptToMatrix}
              onSavePrompt={handleSavePrompt}
              engine={engine}
            />
          )}

          {/* VIEW: Photo Manipulation Studio (Custom Upload & Creative Style Presets) */}
          {activeView === 'photo-manipulation' && (
            <PhotoManipulationStudio
              language={language}
              onSendToMatrix={handleLoadPromptToMatrix}
              onSavePrompt={handleSavePrompt}
              engine={engine}
            />
          )}

          {/* VIEW: Baby Studio (12 Milestone Theme Packages) */}
          {activeView === 'baby-studio' && (
            <BabyStudioView
              language={language}
              onSendToMatrix={handleLoadPromptToMatrix}
              onSavePrompt={handleSavePrompt}
              engine={engine}
            />
          )}

          {/* VIEW 1: Prompt Builder (Burmese Prompt Matrix) */}
          {activeView === 'prompt-builder' && (
            <BurmesePromptMatrix
              language={language}
              selection={selection}
              onUpdateSelection={handleUpdateSelection}
              onResetAll={handleResetAll}
              onGeneratePrompt={handleGeneratePrompt}
              isGeneratingPrompt={isGenerating}
              onSavePrompt={handleSavePrompt}
              engine={engine}
              onEngineChange={setEngine}
              onNavigateView={setActiveView}
            />
          )}

          {/* VIEW: Old Photo to New Photo Studio (AI Restoration & 8K Modernization) */}
          {activeView === 'old-to-new' && (
            <OldPhotoToNewPhotoStudio
              language={language}
              onSendToMatrix={handleLoadPromptToMatrix}
              onSavePrompt={handleSavePrompt}
              engine={engine}
            />
          )}

          {/* VIEW: Photo Edit Studio (Clothes Swap, BG Replace, Relighting, Headshot) */}
          {activeView === 'photo-edit' && (
            <PhotoEditStudio
              language={language}
              onSendToMatrix={handleLoadPromptToMatrix}
              onSavePrompt={handleSavePrompt}
              engine={engine}
            />
          )}

          {/* VIEW: Prompt Utility Suite (Secret Keywords, Negative Matrix, Batch, Lens Guide) */}
          {activeView === 'prompt-utility' && (
            <PromptUtilitySuite
              language={language}
              onSendToMatrix={handleLoadPromptToMatrix}
              onSavePrompt={handleSavePrompt}
              engine={engine}
            />
          )}

          {/* VIEW 2: Preset Library */}
          {activeView === 'preset-library' && (
            <PresetLibraryView
              language={language}
              onSelectPreset={handleLoadPromptToMatrix}
            />
          )}



          {/* VIEW 5: Saved Prompts */}
          {activeView === 'saved-prompts' && (
            <SavedPromptsView
              language={language}
              savedPrompts={savedPrompts}
              onDeletePrompt={handleDeleteSavedPrompt}
              onLoadPrompt={handleLoadPromptToMatrix}
              onClearAll={handleClearAllSaved}
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
  );
}
