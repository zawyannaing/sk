import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';

interface ProfessionalStudioWorkstationProps {
  language: Language;
  onSendToMatrix?: (promptText: string) => void;
  onSavePrompt?: (promptText: string, metadata: any) => void;
  engine?: string;
  onNavigateView?: (view: any, photoUrl?: string) => void;
  initialPhoto?: string;
}

type WorkstationTab = 'lighting' | 'split-compare' | 'color-grading' | 'session-proofing' | 'exif-lab';

interface LightSource {
  id: 'key' | 'fill' | 'rim' | 'background';
  label: string;
  angle: number; // 0 to 360 degrees
  distance: number; // 50 to 120 px
  power: number; // 1 to 10
  colorTemp: number; // 2800K to 6500K
  modifier: 'octabox-120' | 'beauty-dish' | 'parabolic-umbrella' | 'honeycomb-grid' | 'bare-bulb';
  active: boolean;
  color: string;
}

interface ClientPhotoShot {
  id: string;
  title: string;
  url: string;
  rating: number; // 1 to 5
  status: 'picked' | 'rejected' | 'candidate';
  focalLength: string;
  aperture: string;
}

export const ProfessionalStudioWorkstation: React.FC<ProfessionalStudioWorkstationProps> = ({
  language,
  onSendToMatrix,
  onSavePrompt,
  engine = 'midjourney-v6',
  onNavigateView,
  initialPhoto
}) => {
  const isMm = language === 'my';
  const [activeTab, setActiveTab] = useState<WorkstationTab>('lighting');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [quickToast, setQuickToast] = useState<string | null>(null);

  // Active portrait photo
  const [activePhoto, setActivePhoto] = useState<string>(
    initialPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85'
  );
  const [retouchedPhoto, setRetouchedPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=85'
  );

  // FEATURE 1: 3-POINT STUDIO LIGHTING RIG
  const [lights, setLights] = useState<LightSource[]>([
    {
      id: 'key',
      label: 'Key Light (Primary)',
      angle: 45, // 45 deg Rembrandt
      distance: 85,
      power: 8.5,
      colorTemp: 5200,
      modifier: 'octabox-120',
      active: true,
      color: '#ffd02f'
    },
    {
      id: 'fill',
      label: 'Fill Light (Shadow Softener)',
      angle: 315, // opposite
      distance: 95,
      power: 4.2,
      colorTemp: 5400,
      modifier: 'parabolic-umbrella',
      active: true,
      color: '#5cd2e6'
    },
    {
      id: 'rim',
      label: 'Kicker / Rim Light (Edge Separation)',
      angle: 135, // backlight
      distance: 105,
      power: 6.8,
      colorTemp: 2800, // warm golden edge
      modifier: 'honeycomb-grid',
      active: true,
      color: '#ff9233'
    },
    {
      id: 'background',
      label: 'Background Spot',
      angle: 180,
      distance: 110,
      power: 3.5,
      colorTemp: 4500,
      modifier: 'honeycomb-grid',
      active: false,
      color: '#a78bfa'
    }
  ]);
  const [selectedLightId, setSelectedLightId] = useState<'key' | 'fill' | 'rim' | 'background'>('key');
  const [isDraggingLight, setIsDraggingLight] = useState<boolean>(false);
  const diagramRef = useRef<SVGSVGElement>(null);

  // FEATURE 2: BEFORE / AFTER SPLIT SLIDER
  const [splitPos, setSplitPos] = useState<number>(50); // 0% to 100%
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const [showLoupe, setShowLoupe] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [loupePos, setLoupePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // FEATURE 3: 3-WAY COLOR GRADING & FILM EMULSION
  const [shadowsHue, setShadowsHue] = useState<number>(220); // cool shadows
  const [shadowsSat, setShadowsSat] = useState<number>(15);
  const [midtonesHue, setMidtonesHue] = useState<number>(45); // warm golden skin
  const [midtonesSat, setMidtonesSat] = useState<number>(25);
  const [highlightsHue, setHighlightsHue] = useState<number>(35); // subtle ivory highlights
  const [highlightsSat, setHighlightsSat] = useState<number>(12);
  const [colorTempKelvin, setColorTempKelvin] = useState<number>(5200);
  const [filmEmulsion, setFilmEmulsion] = useState<string>('hasselblad-hncs'); // kodak-portra-400, fuji-pro-400h, hasselblad-hncs, leica-monochrom

  // FEATURE 4: CLIENT SESSION & PROOFING
  const [clientJobId, setClientJobId] = useState<string>('JOB-2026-YGN-089');
  const [clientName, setClientName] = useState<string>('Daw Khin Thiri & Ko Aung Kyaw');
  const [eventType, setEventType] = useState<string>('Royal Court Wedding');
  const [clientShots, setClientShots] = useState<ClientPhotoShot[]>([
    {
      id: 'shot-01',
      title: 'Regal Frontal Pose in Acheik',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      rating: 5,
      status: 'picked',
      focalLength: '85mm',
      aperture: 'f/1.4'
    },
    {
      id: 'shot-02',
      title: 'Mandalay Palace Veranda Gaze',
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
      rating: 4,
      status: 'candidate',
      focalLength: '100mm',
      aperture: 'f/2.0'
    },
    {
      id: 'shot-03',
      title: 'Heritage Groom & Court Taikpon',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      rating: 5,
      status: 'picked',
      focalLength: '85mm',
      aperture: 'f/1.4'
    },
    {
      id: 'shot-04',
      title: 'Macro Thanaka & Jasmine Crown',
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      rating: 4,
      status: 'candidate',
      focalLength: '105mm Macro',
      aperture: 'f/2.8'
    },
    {
      id: 'shot-05',
      title: 'Ceremonial Tea Table Interaction',
      url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      rating: 3,
      status: 'rejected',
      focalLength: '50mm',
      aperture: 'f/1.8'
    },
    {
      id: 'shot-06',
      title: 'Golden Sunset Rim Silhouette',
      url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
      rating: 5,
      status: 'picked',
      focalLength: '135mm',
      aperture: 'f/1.8'
    }
  ]);
  const [showContactSheetModal, setShowContactSheetModal] = useState<boolean>(false);

  // FEATURE 5: EXIF & LAB PRINT SPECS
  const [printBleed, setPrintBleed] = useState<number>(3); // 3mm bleed
  const [printDpi, setPrintDpi] = useState<number>(300);
  const [paperStock, setPaperStock] = useState<string>('fuji-crystal-archive-silk');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setQuickToast(msg);
    setTimeout(() => setQuickToast(null), 2500);
  };

  // Dragging split slider
  const handleSplitMouseMove = (e: React.MouseEvent) => {
    if (!splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percent = (x / rect.width) * 100;
    if (isDraggingSplit) {
      setSplitPos(percent);
    }
    setLoupePos({
      x: Math.max(0, Math.min(100, (x / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
    });
  };

  // Lighting diagram interaction
  const handleDiagramClickOrDrag = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!diagramRef.current) return;
    const rect = diagramRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dx = mouseX - cx;
    const dy = mouseY - cy;
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;

    const dist = Math.min(125, Math.max(45, Math.hypot(dx, dy)));

    setLights((prev) =>
      prev.map((l) =>
        l.id === selectedLightId ? { ...l, angle: Math.round(deg), distance: Math.round(dist) } : l
      )
    );
  };

  // Synthesized Professional Studio Prompt based on all 5 Studio Modules
  const synthesizedProStudioPrompt = React.useMemo(() => {
    const activeKey = lights.find((l) => l.id === 'key');
    const activeFill = lights.find((l) => l.id === 'fill');
    const activeRim = lights.find((l) => l.id === 'rim');

    const lightingSpecs = `Studio lighting setup: ${activeKey?.modifier.replace(/-/g, ' ')} key light at ${activeKey?.angle}° (power ${activeKey?.power}/10, ${activeKey?.colorTemp}K), fill ${activeFill?.modifier.replace(/-/g, ' ')} at ${activeFill?.angle}° (power ${activeFill?.power}/10), razor-sharp ${activeRim?.colorTemp}K golden rim kicker at ${activeRim?.angle}°, true physical contact floor shadows`;

    const colorGradingSpecs = `Color profile: ${filmEmulsion.replace(/-/g, ' ')}, ${colorTempKelvin}K white balance, golden olive Burmese skin tones with natural subsurface scattering, zero oversaturation`;

    const cameraSpecs = `Camera: Hasselblad X2D 100C medium format, 85mm f/1.4 portrait prime lens, ISO 64, 1/250s, 16-bit ProPhoto RGB, 300 DPI museum lab resolution`;

    const subjectSpecs = `Master studio editorial fine art portrait: authentic Burmese noble subject in handwoven Acheik silk Lun Taya, genuine Thanaka bark micro-texture with natural epidermal pores, iris catchlights reflecting studio octabox, prestigious royal court dignity`;

    return `${subjectSpecs}. ${lightingSpecs}. ${colorGradingSpecs}. ${cameraSpecs} --ar 4:5 --style raw --v 6.1`;
  }, [lights, filmEmulsion, colorTempKelvin]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(synthesizedProStudioPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    showToast(isMm ? 'Professional Studio Prompt ကူးယူပြီးပါပြီ!' : 'Pro Studio Master Prompt copied!');
  };

  const handleRatingChange = (id: string, newRating: number) => {
    setClientShots((prev) => prev.map((s) => (s.id === id ? { ...s, rating: newRating } : s)));
    showToast(`Updated rating to ${newRating} stars`);
  };

  const handleStatusChange = (id: string, newStatus: 'picked' | 'rejected' | 'candidate') => {
    setClientShots((prev) => prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
    showToast(`Marked as ${newStatus}`);
  };

  return (
    <div className="min-h-screen bg-[#090c13] text-[#f0f3f8] px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 select-none font-sans">
      
      {/* Toast Alert */}
      {quickToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#ffd02f] text-[#090c13] font-sans text-xs font-black px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce border border-[#fcb900]">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{quickToast}</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              setActivePhoto(reader.result as string);
              showToast(isMm ? 'ဓာတ်ပုံ အောင်မြင်စွာ တင်ပြီးပါပြီ' : 'Client reference photo loaded');
            };
            reader.readAsDataURL(file);
          }
        }}
        accept="image/*"
        className="hidden"
      />

      {/* 🌟 1. PROFESSIONAL WORKSTATION TOP BAR */}
      <div className="bg-[#0f1420] border border-[#1e273a] rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-[#ffd02f] text-[#090c13] flex items-center justify-center font-bold text-xl shadow-md border border-[#fcb900]/40 shrink-0">
            <span className="material-symbols-outlined text-[24px]">wb_iridescent</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#ffd02f] font-black uppercase tracking-wider">
                COMMERCIAL PHOTOGRAPHY WORKSTATION
              </span>
              <span className="bg-[#1b2334] text-[#8e9cb5] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#2b3750]">
                Capture One & Lightroom Spec
              </span>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-normal text-white tracking-tight">
              {isMm ? 'ပရော်ဖက်ရှင်နယ် စတူဒီယို အလုပ်ခွင် (Pro Studio Suite)' : 'Professional Studio Master Workstation'}
            </h1>
          </div>
        </div>

        {/* Studio Specs HUD */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-4 bg-[#090c13] px-3.5 py-1.5 rounded-xl border border-[#1e273a] font-mono text-[11px] text-[#8e9cb5]">
            <span>CAMERA: <strong className="text-white">HASSELBLAD X2D 100C</strong></span>
            <span>•</span>
            <span>COLOR: <strong className="text-[#ffd02f]">16-BIT PROPHOTO</strong></span>
            <span>•</span>
            <span>LAB: <strong className="text-[#00b473]">300 DPI CMYK</strong></span>
          </div>

          {onNavigateView && (
            <button
              type="button"
              onClick={() => onNavigateView('studio-suite')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#1b2334] hover:bg-[#253047] border border-[#2b3750] text-xs font-bold text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] text-[#ffd02f]">grid_view</span>
              <span>8-Room Suite</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#090c13] text-xs font-black transition-all cursor-pointer shadow-md hover:scale-102"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>Load Client Shot</span>
          </button>
        </div>
      </div>

      {/* 🌟 2. PRECISION WORKSTATION TABS (5 MODULE SUITE) */}
      <div className="bg-[#0f1420] border border-[#1e273a] p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto shadow-md">
        {[
          { id: 'lighting' as WorkstationTab, icon: 'wb_incandescent', labelEn: '1. Studio Lighting Rig Diagram', labelMm: '၁။ အလင်းဇယား (Lighting Diagram)' },
          { id: 'split-compare' as WorkstationTab, icon: 'compare', labelEn: '2. Before/After Split Viewport', labelMm: '၂။ ပုံယှဉ်ကြည့်စနစ် (Split Compare)' },
          { id: 'color-grading' as WorkstationTab, icon: 'palette', labelEn: '3. 3-Way Color Grading Wheels', labelMm: '၃။ အရောင်ဘီးများ (Color Wheels)' },
          { id: 'session-proofing' as WorkstationTab, icon: 'collections_bookmark', labelEn: '4. Client Session & Contact Sheet', labelMm: '၄။ ဖောက်သည်အယ်လ်ဘမ် (Proofing)' },
          { id: 'exif-lab' as WorkstationTab, icon: 'print', labelEn: '5. EXIF Metadata & 300 DPI Lab', labelMm: '၅။ EXIF & 300 DPI Lab Print' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#1b2334] text-white border border-[#ffd02f]/40 shadow-xs'
                  : 'text-[#8e9cb5] hover:text-white hover:bg-[#141b2a]'
              }`}
            >
              <span className={`material-symbols-outlined text-[17px] ${isActive ? 'text-[#ffd02f]' : 'text-[#6b7794]'}`}>
                {tab.icon}
              </span>
              <span>{isMm ? tab.labelMm : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* 🌟 3. MAIN WORKBENCH VIEWPORT ACCORDING TO SELECTED TAB */}
      
      {/* ======================================================== */}
      {/* TAB 1: 3-POINT STUDIO LIGHTING RIG DIAGRAM               */}
      {/* ======================================================== */}
      {activeTab === 'lighting' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Interactive Overhead Lighting Simulator Canvas (7 Cols) */}
          <div className="lg:col-span-7 bg-[#0f1420] border border-[#1e273a] rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1c2333] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#ffd02f]">radar</span>
                <h3 className="font-serif text-lg font-normal text-white">
                  {isMm ? 'စတူဒီယို အပေါ်စီး အလင်းဖွဲ့စည်းမှု ဇယား (Overhead Lighting Rig)' : 'Overhead Studio Floor Plan & Strobe Angles'}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#8e9cb5]">Click/Drag Light to Position</span>
            </div>

            {/* Interactive SVG Studio Map */}
            <div className="relative bg-[#080b12] rounded-2xl border border-[#1b2334] aspect-square max-h-[460px] flex items-center justify-center overflow-hidden">
              <svg
                ref={diagramRef}
                viewBox="0 0 300 300"
                className="w-full h-full cursor-crosshair select-none"
                onMouseDown={() => setIsDraggingLight(true)}
                onMouseUp={() => setIsDraggingLight(false)}
                onMouseMove={(e) => {
                  if (isDraggingLight) handleDiagramClickOrDrag(e);
                }}
                onClick={handleDiagramClickOrDrag}
              >
                {/* Concentric distance rings */}
                <circle cx="150" cy="150" r="120" fill="none" stroke="#161e2e" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="150" cy="150" r="85" fill="none" stroke="#1c263a" strokeWidth="1" strokeDasharray="2 2" />
                <circle cx="150" cy="150" r="50" fill="none" stroke="#25324d" strokeWidth="1" />

                {/* 8-Axis Angle Grid */}
                <line x1="150" y1="20" x2="150" y2="280" stroke="#161e2e" strokeWidth="1" />
                <line x1="20" y1="150" x2="280" y2="150" stroke="#161e2e" strokeWidth="1" />
                <line x1="58" y1="58" x2="242" y2="242" stroke="#161e2e" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="58" y1="242" x2="242" y2="58" stroke="#161e2e" strokeWidth="1" strokeDasharray="2 2" />

                {/* Studio Infinity Cyclorama Backdrop */}
                <path d="M 40 40 Q 150 15 260 40" fill="none" stroke="#3b4866" strokeWidth="4" />
                <text x="150" y="32" fill="#6b7794" fontSize="8" textAnchor="middle" fontFamily="monospace">
                  INFINITY WALL (CYCLORAMA)
                </text>

                {/* Center Subject (Model) */}
                <g transform="translate(150, 150)">
                  <circle r="18" fill="#ffd02f" fillOpacity="0.2" stroke="#ffd02f" strokeWidth="2" />
                  <circle r="6" fill="#ffd02f" />
                  {/* Nose / Facing Indicator (Facing South / 180° towards camera) */}
                  <polygon points="0,18 -4,12 4,12" fill="#ffd02f" />
                  <text y="-22" fill="#ffd02f" fontSize="8" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                    SUBJECT
                  </text>
                </g>

                {/* Camera Rig at Bottom */}
                <g transform="translate(150, 275)">
                  <rect x="-16" y="-8" width="32" height="16" rx="4" fill="#1b2334" stroke="#4262ff" strokeWidth="1.5" />
                  <polygon points="0,-8 -6,0 6,0" fill="#4262ff" />
                  <text y="16" fill="#8e9cb5" fontSize="8" textAnchor="middle" fontFamily="monospace">
                    HASSELBLAD
                  </text>
                </g>

                {/* Render Light Sources */}
                {lights.map((l) => {
                  if (!l.active) return null;
                  const rad = ((l.angle - 90) * Math.PI) / 180;
                  const lx = 150 + Math.cos(rad) * l.distance;
                  const ly = 150 + Math.sin(rad) * l.distance;
                  const isSelected = selectedLightId === l.id;

                  return (
                    <g key={l.id} className="cursor-pointer">
                      {/* Ray line casting towards subject */}
                      <line
                        x1={lx}
                        y1={ly}
                        x2="150"
                        y2="150"
                        stroke={l.color}
                        strokeWidth={isSelected ? 2 : 1}
                        strokeDasharray={isSelected ? undefined : '3 3'}
                        strokeOpacity="0.7"
                      />

                      {/* Light cone beam */}
                      <polygon
                        points={`${lx},${ly} ${150 + Math.cos(rad + 0.3) * 30},${150 + Math.sin(rad + 0.3) * 30} ${150 + Math.cos(rad - 0.3) * 30},${150 + Math.sin(rad - 0.3) * 30}`}
                        fill={l.color}
                        fillOpacity="0.12"
                      />

                      {/* Light Head Body */}
                      <circle
                        cx={lx}
                        cy={ly}
                        r={isSelected ? 14 : 11}
                        fill="#090c13"
                        stroke={l.color}
                        strokeWidth={isSelected ? 3 : 2}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLightId(l.id);
                        }}
                      />
                      <circle cx={lx} cy={ly} r="4" fill={l.color} />

                      {/* Angle & Label */}
                      <text
                        x={lx}
                        y={ly > 150 ? ly + 20 : ly - 14}
                        fill={l.color}
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {l.id.toUpperCase()} ({l.angle}°)
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Quick Lighting Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-[10px] font-mono font-bold text-[#6b7794] uppercase">Studio Presets:</span>
              {[
                { label: 'Rembrandt 45° Key', keyAngle: 45, fillAngle: 315, rimAngle: 135 },
                { label: 'Butterfly (Glamour Top)', keyAngle: 180, fillAngle: 180, rimAngle: 0 },
                { label: 'Split Dramatic 90°', keyAngle: 90, fillAngle: 270, rimAngle: 160 },
                { label: 'Rim Halo (Kicker)', keyAngle: 60, fillAngle: 300, rimAngle: 180 }
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setLights((prev) =>
                      prev.map((l) => {
                        if (l.id === 'key') return { ...l, angle: p.keyAngle };
                        if (l.id === 'fill') return { ...l, angle: p.fillAngle };
                        if (l.id === 'rim') return { ...l, angle: p.rimAngle };
                        return l;
                      })
                    );
                    showToast(`Applied preset: ${p.label}`);
                  }}
                  className="bg-[#141b2a] hover:bg-[#1e273a] border border-[#232f47] text-white text-[11px] font-mono px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Light Source Inspector (5 Cols) */}
          <div className="lg:col-span-5 bg-[#0f1420] border border-[#1e273a] rounded-3xl p-6 flex flex-col gap-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1c2333] pb-3">
              <span className="font-mono text-xs font-bold text-[#ffd02f] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">tune</span>
                Light Inspector & Modifiers
              </span>
              <span className="font-mono text-xs text-white uppercase font-bold">
                {selectedLightId.toUpperCase()} LIGHT
              </span>
            </div>

            {/* Select active light tab */}
            <div className="grid grid-cols-4 gap-1.5 bg-[#090c13] p-1.5 rounded-xl border border-[#1e273a]">
              {lights.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setSelectedLightId(l.id)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedLightId === l.id
                      ? 'bg-[#1e273a] text-white shadow-xs'
                      : 'text-[#6b7794] hover:text-white'
                  }`}
                  style={{ borderBottom: selectedLightId === l.id ? `2px solid ${l.color}` : 'none' }}
                >
                  {l.id.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Active Light Parameters */}
            {(() => {
              const cur = lights.find((l) => l.id === selectedLightId) || lights[0];
              return (
                <div className="flex flex-col gap-4">
                  {/* Angle Dial Slider */}
                  <div className="bg-[#141b2a] p-3.5 rounded-xl border border-[#232f47] flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-[#8e9cb5]">Angle Azimuth</span>
                      <strong className="text-[#ffd02f]">{cur.angle}° Degree</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={cur.angle}
                      onChange={(e) =>
                        setLights((prev) =>
                          prev.map((l) => (l.id === cur.id ? { ...l, angle: Number(e.target.value) } : l))
                        )
                      }
                      className="w-full accent-[#ffd02f] h-1.5 bg-[#232f47] rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Power Strobe Ratio */}
                  <div className="bg-[#141b2a] p-3.5 rounded-xl border border-[#232f47] flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-[#8e9cb5]">Strobe Power Ratio</span>
                      <strong className="text-white">{cur.power} / 10 EV</strong>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.1"
                      value={cur.power}
                      onChange={(e) =>
                        setLights((prev) =>
                          prev.map((l) => (l.id === cur.id ? { ...l, power: Number(e.target.value) } : l))
                        )
                      }
                      className="w-full accent-[#ffd02f] h-1.5 bg-[#232f47] rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Light Modifier Box */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono font-bold text-[#8e9cb5]">Light Modifier (Shape & Texture)</label>
                    <select
                      value={cur.modifier}
                      onChange={(e) =>
                        setLights((prev) =>
                          prev.map((l) => (l.id === cur.id ? { ...l, modifier: e.target.value as any } : l))
                        )
                      }
                      className="bg-[#141b2a] border border-[#232f47] text-white text-xs px-3 py-2.5 rounded-xl font-mono outline-none"
                    >
                      <option value="octabox-120">120cm Octabox with Honeycomb Grid (Soft Catchlight)</option>
                      <option value="beauty-dish">22" White Beauty Dish with Sock (Crisp Contrast)</option>
                      <option value="parabolic-umbrella">Deep Silver Parabolic Umbrella (Wide Spread)</option>
                      <option value="honeycomb-grid">Narrow Honeycomb Grid Snoot (Edge Kicker)</option>
                      <option value="bare-bulb">Bare Bulb Strobe (Hard Vintage Direct Flash)</option>
                    </select>
                  </div>

                  {/* Color Temperature Kelvin */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#8e9cb5]">Color Temperature</span>
                      <span className="text-[#ffd02f] font-bold">{cur.colorTemp} Kelvin</span>
                    </div>
                    <input
                      type="range"
                      min="2800"
                      max="6500"
                      step="100"
                      value={cur.colorTemp}
                      onChange={(e) =>
                        setLights((prev) =>
                          prev.map((l) => (l.id === cur.id ? { ...l, colorTemp: Number(e.target.value) } : l))
                        )
                      }
                      className="w-full accent-[#ffd02f] h-1.5 bg-[#232f47] rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-[#6b7794]">
                      <span>2800K (Candlelight)</span>
                      <span>5200K (Daylight Lab)</span>
                      <span>6500K (Cool Sky)</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Quick Lighting Prompt Snippet */}
            <div className="bg-[#080b12] p-3 rounded-xl border border-[#1b2334] font-mono text-[11px] text-[#ffd02f] leading-relaxed">
              Active Optics: Key at {lights.find((l) => l.id === 'key')?.angle}° ({lights.find((l) => l.id === 'key')?.modifier.replace(/-/g, ' ')}), Fill at {lights.find((l) => l.id === 'fill')?.angle}°, Rim at {lights.find((l) => l.id === 'rim')?.angle}°
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: BEFORE / AFTER SPLIT-SCREEN VIEWPORT               */}
      {/* ======================================================== */}
      {activeTab === 'split-compare' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Interactive Split Viewport (8 Cols) */}
          <div className="lg:col-span-8 bg-[#0f1420] border border-[#1e273a] rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1c2333] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#ffd02f]">compare</span>
                <h3 className="font-serif text-lg font-normal text-white">
                  {isMm ? 'မူရင်း vs အပြီးသတ် စတူဒီယို ပုံယှဉ်ကြည့်စနစ် (Split Compare Viewport)' : 'Interactive Before / After Retouch Split Viewport'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGrid((p) => !p)}
                  className={`text-xs font-mono px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    showGrid ? 'bg-[#ffd02f] text-[#090c13] font-bold border-[#ffd02f]' : 'bg-[#141b2a] text-[#8e9cb5] border-[#232f47]'
                  }`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setShowLoupe((p) => !p)}
                  className={`text-xs font-mono px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    showLoupe ? 'bg-[#ffd02f] text-[#090c13] font-bold border-[#ffd02f]' : 'bg-[#141b2a] text-[#8e9cb5] border-[#232f47]'
                  }`}
                >
                  Loupe 100%
                </button>
              </div>
            </div>

            {/* Split Screen Container */}
            <div
              ref={splitContainerRef}
              onMouseMove={handleSplitMouseMove}
              onMouseDown={() => setIsDraggingSplit(true)}
              onMouseUp={() => setIsDraggingSplit(false)}
              className="relative aspect-4/5 rounded-2xl overflow-hidden bg-black border border-[#232f47] cursor-ew-resize select-none"
            >
              {/* Right Side: Final Retouched Artwork */}
              <img
                src={retouchedPhoto}
                alt="Retouched Final"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              {/* Left Side: Raw Source Reference (Clipped by splitPos) */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${splitPos}%` }}
              >
                <img
                  src={activePhoto}
                  alt="Raw Reference"
                  className="w-full h-full object-cover pointer-events-none"
                  style={{ width: splitContainerRef.current ? `${splitContainerRef.current.clientWidth}px` : '100%', maxWidth: 'none' }}
                />
              </div>

              {/* Draggable Divider Bar */}
              <div
                className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-2xl pointer-events-none"
                style={{ left: `${splitPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#ffd02f] text-[#090c13] flex items-center justify-center font-bold text-xs shadow-xl border-2 border-white">
                  <span className="material-symbols-outlined text-[16px]">code</span>
                </div>
              </div>

              {/* Floating Badges */}
              <div className="absolute top-3 left-3 z-10 bg-black/70 px-2.5 py-1 rounded-md text-[10px] font-mono text-white/90 border border-white/20">
                RAW SOURCE (INPUT)
              </div>
              <div className="absolute top-3 right-3 z-10 bg-[#ffd02f] text-[#090c13] px-2.5 py-1 rounded-md text-[10px] font-mono font-bold shadow-md">
                8K RETOUCHED (OUTPUT)
              </div>

              {/* Rule of Thirds Grid */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10">
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-white/20" />
                  <div className="border-r border-white/20" />
                  <div className="" />
                </div>
              )}

              {/* 100% Texture Loupe */}
              {showLoupe && (
                <div
                  className="absolute w-32 h-32 rounded-full border-2 border-[#ffd02f] shadow-2xl pointer-events-none overflow-hidden z-30"
                  style={{
                    left: `calc(${loupePos.x}% - 64px)`,
                    top: `calc(${loupePos.y}% - 64px)`,
                    backgroundImage: `url(${splitPos > loupePos.x ? activePhoto : retouchedPhoto})`,
                    backgroundPosition: `${loupePos.x}% ${loupePos.y}%`,
                    backgroundSize: '400%',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)'
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-[#ffd02f] rounded-full" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-[#8e9cb5] pt-1">
              <span>Drag slider left/right to compare micro-pores & Thanaka retention</span>
              <span className="text-[#ffd02f]">Split Divider: {Math.round(splitPos)}%</span>
            </div>
          </div>

          {/* Realism Fidelity Checkcard (4 Cols) */}
          <div className="lg:col-span-4 bg-[#0f1420] border border-[#1e273a] rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
            <span className="font-mono text-xs font-bold text-[#ffd02f] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              Commercial Realism Audit
            </span>

            <div className="flex flex-col gap-3 text-xs font-mono">
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47] flex items-center justify-between">
                <span>Thanaka Bark Grain</span>
                <span className="text-[#00b473] font-bold">100% Intact</span>
              </div>
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47] flex items-center justify-between">
                <span>Epidermal Micro-Pores</span>
                <span className="text-[#00b473] font-bold">Verified Sharp</span>
              </div>
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47] flex items-center justify-between">
                <span>Plastic Smoothing</span>
                <span className="text-[#00b473] font-bold">0% (Shield Active)</span>
              </div>
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47] flex items-center justify-between">
                <span>Lun Taya Silk Weave</span>
                <span className="text-[#ffd02f] font-bold">100-Shuttle Micro</span>
              </div>
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47] flex items-center justify-between">
                <span>Ground Shadow Physics</span>
                <span className="text-[#00b473] font-bold">Contact Occlusion</span>
              </div>
            </div>

            {/* Quick Swap Test Art */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#1c2333]">
              <span className="text-[10px] font-mono text-[#6b7794] uppercase font-bold">Swap Test Portraits:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { title: 'Queen', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80' },
                  { title: 'Bride', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80' },
                  { title: 'Noble', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80' }
                ].map((s) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => {
                      setRetouchedPhoto(s.url);
                      showToast(`Loaded test comparison: ${s.title}`);
                    }}
                    className="relative aspect-square rounded-lg overflow-hidden border border-[#232f47] hover:border-[#ffd02f] cursor-pointer group"
                  >
                    <img src={s.url} alt={s.title} className="w-full h-full object-cover group-hover:scale-105" />
                    <span className="absolute bottom-0.5 left-0.5 text-[9px] font-mono bg-black/70 px-1 rounded text-white">
                      {s.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: 3-WAY COLOR GRADING WHEELS & FILM EMULSION         */}
      {/* ======================================================== */}
      {activeTab === 'color-grading' && (
        <div className="bg-[#0f1420] border border-[#1e273a] rounded-3xl p-6 flex flex-col gap-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1c2333] pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#ffd02f]">palette</span>
              <h3 className="font-serif text-lg font-normal text-white">
                {isMm ? '၃-ဆင့် အရောင်ညှိ စနစ် (3-Way Color Grading: Lift, Gamma, Gain)' : '3-Way Color Wheels & Film Emulsion Curves'}
              </h3>
            </div>
            <span className="font-mono text-xs text-[#8e9cb5]">Cinema Grade Color Timing</span>
          </div>

          {/* 3 Color Wheels (Shadows, Midtones, Highlights) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Wheel 1: SHADOWS (Lift) */}
            <div className="bg-[#141b2a] p-4 rounded-2xl border border-[#232f47] flex flex-col items-center gap-3">
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-mono font-bold text-white uppercase">1. SHADOWS (LIFT)</span>
                <span className="text-[11px] font-mono text-[#5cd2e6]">{shadowsHue}° / {shadowsSat}%</span>
              </div>
              <div className="relative w-36 h-36 rounded-full border border-[#2b3952] flex items-center justify-center bg-gradient-to-tr from-[#101b2b] via-[#141b2a] to-[#25324d] shadow-inner cursor-pointer">
                <div
                  className="w-5 h-5 rounded-full bg-[#5cd2e6] shadow-md border-2 border-white cursor-pointer"
                  style={{
                    transform: `translate(${Math.cos((shadowsHue * Math.PI) / 180) * (shadowsSat * 1.2)}px, ${
                      Math.sin((shadowsHue * Math.PI) / 180) * (shadowsSat * 1.2)
                    }px)`
                  }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={shadowsHue}
                onChange={(e) => setShadowsHue(Number(e.target.value))}
                className="w-full accent-[#5cd2e6] h-1.5 bg-[#232f47] rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-[#6b7794]">Cool Blue Velvet Shadows</span>
            </div>

            {/* Wheel 2: MIDTONES (Gamma - Skin Tones) */}
            <div className="bg-[#141b2a] p-4 rounded-2xl border border-[#232f47] flex flex-col items-center gap-3">
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-mono font-bold text-white uppercase">2. MIDTONES (GAMMA - SKIN)</span>
                <span className="text-[11px] font-mono text-[#ffd02f]">{midtonesHue}° / {midtonesSat}%</span>
              </div>
              <div className="relative w-36 h-36 rounded-full border border-[#2b3952] flex items-center justify-center bg-gradient-to-tr from-[#2b2410] via-[#141b2a] to-[#453610] shadow-inner cursor-pointer">
                <div
                  className="w-5 h-5 rounded-full bg-[#ffd02f] shadow-md border-2 border-white cursor-pointer"
                  style={{
                    transform: `translate(${Math.cos((midtonesHue * Math.PI) / 180) * (midtonesSat * 1.2)}px, ${
                      Math.sin((midtonesHue * Math.PI) / 180) * (midtonesSat * 1.2)
                    }px)`
                  }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={midtonesHue}
                onChange={(e) => setMidtonesHue(Number(e.target.value))}
                className="w-full accent-[#ffd02f] h-1.5 bg-[#232f47] rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-[#6b7794]">Golden Burmese Honey Skin</span>
            </div>

            {/* Wheel 3: HIGHLIGHTS (Gain) */}
            <div className="bg-[#141b2a] p-4 rounded-2xl border border-[#232f47] flex flex-col items-center gap-3">
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-mono font-bold text-white uppercase">3. HIGHLIGHTS (GAIN)</span>
                <span className="text-[11px] font-mono text-[#ffb86c]">{highlightsHue}° / {highlightsSat}%</span>
              </div>
              <div className="relative w-36 h-36 rounded-full border border-[#2b3952] flex items-center justify-center bg-gradient-to-tr from-[#241c10] via-[#141b2a] to-[#36271a] shadow-inner cursor-pointer">
                <div
                  className="w-5 h-5 rounded-full bg-[#ffb86c] shadow-md border-2 border-white cursor-pointer"
                  style={{
                    transform: `translate(${Math.cos((highlightsHue * Math.PI) / 180) * (highlightsSat * 1.2)}px, ${
                      Math.sin((highlightsHue * Math.PI) / 180) * (highlightsSat * 1.2)
                    }px)`
                  }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={highlightsHue}
                onChange={(e) => setHighlightsHue(Number(e.target.value))}
                className="w-full accent-[#ffb86c] h-1.5 bg-[#232f47] rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-[#6b7794]">Warm Sunset Specular Roll-off</span>
            </div>

          </div>

          {/* Film Emulsion Simulator Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {[
              { id: 'hasselblad-hncs', label: 'Hasselblad HNCS', desc: 'True 16-Bit Neutral Colors' },
              { id: 'kodak-portra-400', label: 'Kodak Portra 400', desc: 'Soft Warm Pastel Skin Tones' },
              { id: 'fuji-pro-400h', label: 'Fuji Pro 400H', desc: 'Airy Pastel Emerald Greens' },
              { id: 'leica-monochrom', label: 'Leica Monochrom', desc: 'Architectural High Dynamic B&W' }
            ].map((film) => (
              <button
                key={film.id}
                type="button"
                onClick={() => {
                  setFilmEmulsion(film.id);
                  showToast(`Emulsion loaded: ${film.label}`);
                }}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  filmEmulsion === film.id
                    ? 'bg-[#1e273a] border-[#ffd02f] text-white shadow-md'
                    : 'bg-[#141b2a] border-[#232f47] text-[#8e9cb5] hover:text-white'
                }`}
              >
                <span className="text-xs font-mono font-bold block">{film.label}</span>
                <span className="text-[10px] opacity-75">{film.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CLIENT SESSION & CONTACT SHEET PROOFING           */}
      {/* ======================================================== */}
      {activeTab === 'session-proofing' && (
        <div className="bg-[#0f1420] border border-[#1e273a] rounded-3xl p-6 flex flex-col gap-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between border-b border-[#1c2333] pb-4 gap-3">
            <div>
              <span className="font-mono text-xs font-bold text-[#ffd02f] uppercase tracking-wider block">
                CLIENT SESSION REEL & PROOFING
              </span>
              <h3 className="font-serif text-xl font-normal text-white">
                {clientName} • <span className="text-sm font-mono text-[#8e9cb5]">{clientJobId}</span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowContactSheetModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#090c13] text-xs font-black transition-all cursor-pointer shadow-md"
              >
                <span className="material-symbols-outlined text-[16px]">grid_on</span>
                <span>Generate Client Contact Sheet (Proofing)</span>
              </button>
            </div>
          </div>

          {/* Multi-Shot Reel Grid with Ratings & Flags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientShots.map((shot) => (
              <div
                key={shot.id}
                className="bg-[#141b2a] border border-[#232f47] rounded-2xl overflow-hidden flex flex-col gap-2.5 p-3 group hover:border-[#ffd02f] transition-all"
              >
                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-black">
                  <img src={shot.url} alt={shot.title} className="w-full h-full object-cover group-hover:scale-103 transition-transform" />
                  
                  {/* Status Flag Badge */}
                  <span
                    className={`absolute top-2 left-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase shadow-md ${
                      shot.status === 'picked'
                        ? 'bg-[#00b473] text-black'
                        : shot.status === 'rejected'
                        ? 'bg-[#e63946] text-white'
                        : 'bg-[#ffd02f] text-black'
                    }`}
                  >
                    {shot.status}
                  </span>

                  <span className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-white">
                    {shot.focalLength} • {shot.aperture}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{shot.title}</span>
                  
                  {/* 1-5 Star Ratings */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => handleRatingChange(shot.id, star)}
                        className={`material-symbols-outlined text-[16px] cursor-pointer ${
                          star <= shot.rating ? 'text-[#ffd02f]' : 'text-[#364259]'
                        }`}
                      >
                        star
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pick / Reject Flag Buttons */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-[#1e273a]">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(shot.id, 'picked')}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                      shot.status === 'picked' ? 'bg-[#00b473] text-black' : 'bg-[#1b2334] text-[#8e9cb5] hover:text-white'
                    }`}
                  >
                    PICK (CLIENT APPROVED)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(shot.id, 'rejected')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                      shot.status === 'rejected' ? 'bg-[#e63946] text-white' : 'bg-[#1b2334] text-[#8e9cb5] hover:text-white'
                    }`}
                  >
                    REJECT
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: TECHNICAL EXIF & 300 DPI LAB PRINT                */}
      {/* ======================================================== */}
      {activeTab === 'exif-lab' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* EXIF Inspector Card (7 Cols) */}
          <div className="lg:col-span-7 bg-[#0f1420] border border-[#1e273a] rounded-3xl p-6 flex flex-col gap-5 shadow-xl">
            <span className="font-mono text-xs font-bold text-[#ffd02f] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">settings_photo_camera</span>
              Camera EXIF & Optical Sensor Inspector
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47]">
                <span className="text-[10px] text-[#6b7794] block">CAMERA BODY</span>
                <span className="text-sm font-bold text-white">HASSELBLAD X2D 100C</span>
              </div>
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47]">
                <span className="text-[10px] text-[#6b7794] block">OPTICAL SENSOR</span>
                <span className="text-sm font-bold text-white">100MP BSI CMOS (43.8×32.9mm)</span>
              </div>
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47]">
                <span className="text-[10px] text-[#6b7794] block">LENS PRIME</span>
                <span className="text-sm font-bold text-[#ffd02f]">XCD 85mm f/1.4 Portrait</span>
              </div>
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47]">
                <span className="text-[10px] text-[#6b7794] block">DYNAMIC RANGE</span>
                <span className="text-sm font-bold text-white">15 STOPS LATITUDE</span>
              </div>
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47]">
                <span className="text-[10px] text-[#6b7794] block">COLOR PROFILE</span>
                <span className="text-sm font-bold text-[#00b473]">HNCS 16-BIT RAW</span>
              </div>
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47]">
                <span className="text-[10px] text-[#6b7794] block">SHUTTER & ISO</span>
                <span className="text-sm font-bold text-white">1/250s Leaf Shutter • ISO 64</span>
              </div>
            </div>

            {/* Print Bleed & Margin Setup */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#1c2333]">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8e9cb5]">Print Bleed Allowance</span>
                <span className="text-[#ffd02f] font-bold">{printBleed} mm Safe Margin</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="1"
                value={printBleed}
                onChange={(e) => setPrintBleed(Number(e.target.value))}
                className="w-full accent-[#ffd02f] h-1.5 bg-[#232f47] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Paper Stock & Lab Proofing Specs (5 Cols) */}
          <div className="lg:col-span-5 bg-[#0f1420] border border-[#1e273a] rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
            <span className="font-mono text-xs font-bold text-[#ffd02f] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">print</span>
              Fine Art Paper Stock Specification
            </span>

            <div className="flex flex-col gap-2">
              {[
                { id: 'fuji-crystal-archive-silk', title: 'Fuji Crystal Archive Silk', gsm: '250 GSM', finish: 'Subtle Luster (Wedding Standard)' },
                { id: 'hahnemuhle-photo-rag', title: 'Hahnemühle Photo Rag 308', gsm: '308 GSM', finish: '100% Cotton Museum Grade' },
                { id: 'canson-infinity-baryta', title: 'Canson Infinity Baryta Prestige', gsm: '340 GSM', finish: 'Darkroom Gloss Traditional' }
              ].map((paper) => (
                <button
                  key={paper.id}
                  type="button"
                  onClick={() => {
                    setPaperStock(paper.id);
                    showToast(`Selected paper: ${paper.title}`);
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    paperStock === paper.id
                      ? 'bg-[#1e273a] border-[#ffd02f] text-white shadow-md'
                      : 'bg-[#141b2a] border-[#232f47] text-[#8e9cb5] hover:text-white'
                  }`}
                >
                  <div className="flex justify-between text-xs font-bold">
                    <span>{paper.title}</span>
                    <span className="text-[#ffd02f] font-mono">{paper.gsm}</span>
                  </div>
                  <span className="text-[10px] opacity-75">{paper.finish}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => showToast('Print Lab Job Card generated with 300 DPI CMYK specifications')}
              className="w-full mt-2 py-3 rounded-xl bg-[#ffd02f] hover:bg-[#fcb900] text-[#090c13] font-bold text-xs font-mono uppercase cursor-pointer shadow-md transition-all active:scale-95"
            >
              Export 300 DPI Lab Print Recipe
            </button>
          </div>

        </div>
      )}

      {/* 🌟 4. SYNTHESIZED PROFESSIONAL STUDIO MASTER PROMPT BAR */}
      <div className="bg-[#0f1420] border border-[#1e273a] rounded-3xl p-5 flex flex-col gap-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1c2333] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#ffd02f]">terminal</span>
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Commercial Studio Master Synthesized Prompt (Midjourney v6.1 & Flux)
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#00b473] bg-[#00b473]/10 px-2.5 py-0.5 rounded-full border border-[#00b473]/30">
            Real Optical Physics Synchronized
          </span>
        </div>

        <div className="bg-[#080b12] p-4 rounded-xl border border-[#1b2334] font-mono text-xs text-[#dce3f1] leading-relaxed break-words">
          {synthesizedProStudioPrompt}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="flex items-center gap-1.5 bg-[#ffd02f] hover:bg-[#fcb900] text-[#090c13] px-4 py-2 rounded-full font-bold text-xs cursor-pointer shadow-md transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isCopied ? 'check' : 'content_copy'}
              </span>
              <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Pro Studio Prompt'}</span>
            </button>

            {onSendToMatrix && (
              <button
                type="button"
                onClick={() => onSendToMatrix(synthesizedProStudioPrompt)}
                className="flex items-center gap-1.5 bg-[#1b2334] hover:bg-[#253047] border border-[#2b3750] text-white px-4 py-2 rounded-full font-bold text-xs cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[15px] text-[#ffd02f]">send</span>
                <span>Send to Prompt Matrix</span>
              </button>
            )}

            {onNavigateView && (
              <button
                type="button"
                onClick={() => onNavigateView('photo-to-text', activePhoto)}
                className="flex items-center gap-1.5 bg-[#1b2334] hover:bg-[#253047] border border-[#2b3750] text-[#8e9cb5] hover:text-white px-3.5 py-2 rounded-full font-bold text-xs cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[15px] text-[#4262ff]">auto_fix_normal</span>
                <span>Deconstruct in Photo-to-Text</span>
              </button>
            )}
          </div>

          {onSavePrompt && (
            <button
              type="button"
              onClick={() => onSavePrompt(synthesizedProStudioPrompt, { title: 'Commercial Studio Master', mode: 'pro-workstation' })}
              className="flex items-center gap-1.5 bg-[#141b2a] hover:bg-[#1e273a] border border-[#232f47] text-[#8e9cb5] hover:text-white px-3.5 py-2 rounded-full text-xs font-mono cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">bookmark</span>
              <span>Save to Collections</span>
            </button>
          )}
        </div>
      </div>

      {/* 🌟 5. CLIENT CONTACT SHEET PROOFING MODAL */}
      {showContactSheetModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1420] border border-[#2b3750] rounded-3xl max-w-4xl w-full p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#1c2333] pb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px] text-[#ffd02f]">grid_on</span>
                <div>
                  <h3 className="font-serif text-xl font-normal text-white">Client Proof Contact Sheet</h3>
                  <p className="font-mono text-xs text-[#8e9cb5]">
                    {clientName} • Job ID: {clientJobId} • 6-Up Proofing Deck
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowContactSheetModal(false)}
                className="p-1 rounded-full text-[#8e9cb5] hover:text-white hover:bg-[#1b2334] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* 6-Up Contact Sheet Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-[#080b12] p-4 rounded-2xl border border-[#1e273a]">
              {clientShots.map((shot, idx) => (
                <div key={shot.id} className="relative aspect-4/5 rounded-xl overflow-hidden bg-black border border-[#232f47] flex flex-col justify-between p-2.5">
                  <img src={shot.url} alt={shot.title} className="absolute inset-0 w-full h-full object-cover opacity-90" />
                  
                  {/* Proof Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-white/20 font-black text-2xl -rotate-45 select-none font-mono">
                      CLIENT PROOF
                    </span>
                  </div>

                  <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-white bg-black/60 px-2 py-0.5 rounded">
                    <span>#{idx + 1}</span>
                    <span className={shot.status === 'picked' ? 'text-[#00b473] font-bold' : 'text-[#ffd02f]'}>
                      {shot.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="relative z-10 text-[10px] font-mono text-white bg-black/70 p-1 rounded truncate">
                    {shot.title}
                  </div>
                </div>
              ))}
            </div>

            {/* Print & Download Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-[#8e9cb5]">
                Proof includes copyright protection & Hasselblad 16-bit color profile
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 rounded-full bg-[#1b2334] hover:bg-[#253047] text-white text-xs font-mono font-bold cursor-pointer transition-colors"
                >
                  Print Contact Sheet
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowContactSheetModal(false);
                    showToast('Contact sheet approved & exported to Client Deliverables folder');
                  }}
                  className="px-4 py-2 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#090c13] text-xs font-mono font-black cursor-pointer shadow-md"
                >
                  Done Proofing
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
