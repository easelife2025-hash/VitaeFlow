'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Download,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  Palette,
  Type,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ResumeDraft,
  TemplateId,
  AccentColor,
  CustomColors,
  ResumeFontFamily,
  COLOR_PALETTES,
  FONT_OPTIONS,
  TEMPLATE_CATALOG,
  resolveResumeColors,
} from '@/lib/types';
import { computeAdaptiveRhythm } from '@/lib/pdf-export';

interface ResumePreviewProps {
  resume: ResumeDraft;
  onUpdateTemplate: (templateId: TemplateId) => void;
  onUpdateAccent: (accent: AccentColor) => void;
  onUpdateCustomColors?: (patch: Partial<CustomColors>) => void;
  onUpdateFontFamily?: (font: ResumeFontFamily) => void;
  onUpdateDecorativeHeading?: (enabled: boolean) => void;
  onExportPdf: () => void;
}

export default function ResumePreview({
  resume,
  onUpdateTemplate,
  onUpdateAccent,
  onUpdateCustomColors,
  onUpdateFontFamily,
  onUpdateDecorativeHeading,
  onExportPdf,
}: ResumePreviewProps) {
  const [zoom, setZoom] = useState<number>(100);
  const [showStyleDrawer, setShowStyleDrawer] = useState<boolean>(false);
  const previewViewportRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(794);
  const [sheetHeight, setSheetHeight] = useState<number>(1122);

  useEffect(() => {
    const viewportEl = previewViewportRef.current;
    const sheetEl = sheetRef.current;
    if (!viewportEl) return;

    const updateDimensions = () => {
      if (viewportEl) {
        const w = viewportEl.clientWidth;
        if (w > 0) setContainerWidth(w);
      }
      if (sheetEl) {
        const h = sheetEl.offsetHeight;
        if (h > 0) setSheetHeight(Math.max(1122, h));
      }
    };

    updateDimensions();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => updateDimensions());
      ro.observe(viewportEl);
      if (sheetEl) ro.observe(sheetEl);
      return () => ro.disconnect();
    }
  }, [resume, resume.templateId]);

  const autoFitScale =
    containerWidth > 0 && containerWidth < 794
      ? Math.max(0.34, containerWidth / 794)
      : 1;
  const effectiveScale = Number(((zoom / 100) * autoFitScale).toFixed(4));

  const {
    personalInfo,
    experience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    languages = [],
    templateId,
    fontFamily = 'inter',
    decorativeHeading = false,
  } = resume;

  const colors = useMemo(() => resolveResumeColors(resume), [resume]);
  const primaryColor = colors.primary;
  const accentColor = colors.accent;
  const headingColor = colors.heading;

  const selectedFontObj = useMemo(
    () => FONT_OPTIONS.find((f) => f.id === fontFamily) || FONT_OPTIONS[0],
    [fontFamily]
  );

  const rhythm = useMemo(() => computeAdaptiveRhythm(resume), [resume]);

  // Adaptive spacing classes based on content density so the A4 sheet fills naturally
  const sectionSpacingClass =
    rhythm.densityTier === 'spacious'
      ? 'space-y-7'
      : rhythm.densityTier === 'balanced'
        ? 'space-y-5'
        : 'space-y-3.5';

  const entrySpacingClass =
    rhythm.densityTier === 'spacious'
      ? 'space-y-4.5'
      : rhythm.densityTier === 'balanced'
        ? 'space-y-3.5'
        : 'space-y-2.5';

  const bulletSpacingClass =
    rhythm.densityTier === 'spacious'
      ? 'space-y-1.5'
      : rhythm.densityTier === 'balanced'
        ? 'space-y-1'
        : 'space-y-0.5';

  const bodyTextClass =
    rhythm.densityTier === 'compact'
      ? 'text-[13.2px] leading-[1.52]'
      : 'text-[14px] leading-[1.6]';

  const hasVisiblePhoto =
    Boolean(personalInfo.photoUrl) && personalInfo.photoShape !== 'hidden';

  const renderProfileAvatar = (sizeClass = 'w-20 h-20', borderColor = primaryColor) => {
    if (!hasVisiblePhoto || !personalInfo.photoUrl) return null;
    const isCircle = (personalInfo.photoShape || 'circle') === 'circle';
    return (
      <div
        className={`${sizeClass} shrink-0 overflow-hidden border-2 bg-white shadow-xs ${
          isCircle ? 'rounded-full' : 'rounded-2xl'
        }`}
        style={{ borderColor }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={personalInfo.photoUrl}
          alt={personalInfo.fullName || 'Candidate portrait'}
          className="w-full h-full object-cover"
          style={{
            transform: `scale(${(personalInfo.photoZoom ?? 100) / 100}) translate(${
              personalInfo.photoOffsetX ?? 0
            }%, ${personalInfo.photoOffsetY ?? 0}%)`,
          }}
        />
      </div>
    );
  };

  const handlePaletteSelect = (palette: (typeof COLOR_PALETTES)[number]) => {
    if (onUpdateCustomColors) {
      onUpdateCustomColors({
        primary: palette.primary,
        accent: palette.accent,
        heading: palette.heading,
        paletteId: palette.id,
      });
    } else {
      onUpdateAccent(palette.primary);
    }
  };

  const handleColorInput = (key: keyof CustomColors, val: string) => {
    if (onUpdateCustomColors) {
      onUpdateCustomColors({ [key]: val, paletteId: 'custom' });
    } else if (key === 'primary') {
      onUpdateAccent(val);
    }
  };

  // Heading font style helper
  const headingFontStyle: React.CSSProperties = {
    fontFamily: selectedFontObj.cssFamily,
  };

  const decorativeNameStyle: React.CSSProperties = decorativeHeading
    ? {
        fontFamily: 'var(--font-calligraphy), cursive',
        fontWeight: 400,
        letterSpacing: '0.02em',
      }
    : headingFontStyle;

  return (
    <div className="flex flex-col h-full">
      {/* Studio Toolbar (Hidden in print) */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-3 mb-4 shadow-xs space-y-3">
        {/* Top Row: 6 Template Switcher Pills + Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* 6 Template Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
            {TEMPLATE_CATALOG.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => onUpdateTemplate(tpl.id)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  templateId === tpl.id
                    ? 'bg-[#6D5CE8] text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-[#18181B]'
                }`}
              >
                {tpl.shortLabel}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Quick Color Swatches */}
            <div
              className="hidden sm:flex items-center gap-1.5"
              role="group"
              aria-label="Color palette presets"
            >
              {COLOR_PALETTES.slice(0, 4).map((pal) => {
                const isSelected =
                  primaryColor.toLowerCase() === pal.primary.toLowerCase();
                return (
                  <button
                    key={pal.id}
                    type="button"
                    title={pal.name}
                    aria-label={`Select ${pal.name} palette`}
                    onClick={() => handlePaletteSelect(pal)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                      isSelected
                        ? 'scale-110 ring-2 ring-offset-1 ring-slate-400'
                        : 'hover:scale-105 opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: pal.primary }}
                  >
                    {isSelected && (
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Toggle Full Colors & Fonts Drawer */}
            <button
              type="button"
              onClick={() => setShowStyleDrawer((prev) => !prev)}
              className={`min-h-[34px] px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                showStyleDrawer
                  ? 'border-[#6D5CE8] bg-[#6D5CE8]/10 text-[#6D5CE8]'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-[#6D5CE8]/40'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-[#6D5CE8]" />
              <span>Colors & Fonts</span>
              {showStyleDrawer ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Zoom Controls */}
            <div className="hidden xl:flex items-center gap-1 border-l border-slate-200 pl-2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(70, z - 10))}
                title="Zoom out"
                className="p-1 text-slate-500 hover:text-[#18181B] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono tabular-nums text-[11px] text-slate-600 w-10 text-center">
                {zoom}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(115, z + 10))}
                title="Zoom in"
                className="p-1 text-slate-500 hover:text-[#18181B] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onExportPdf}
              className="min-h-[34px] px-3 py-1.5 text-xs font-semibold text-white bg-[#6D5CE8] hover:bg-[#5B4AD6] rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Expandable Color & Typography Studio Panel */}
        {showStyleDrawer && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
            {/* Left: Palette Presets & Custom Primary / Accent / Heading Pickers */}
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#18181B] flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#6D5CE8]" />
                  <span>Professional Color Palettes</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COLOR_PALETTES.map((pal) => {
                  const isActive =
                    primaryColor.toLowerCase() === pal.primary.toLowerCase() &&
                    accentColor.toLowerCase() === pal.accent.toLowerCase();
                  return (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => handlePaletteSelect(pal)}
                      className={`px-2.5 py-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#6D5CE8] bg-[#6D5CE8]/5 font-semibold text-[#18181B]'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <span className="flex items-center -space-x-1 shrink-0">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white"
                          style={{ backgroundColor: pal.primary }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white"
                          style={{ backgroundColor: pal.accent }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white"
                          style={{ backgroundColor: pal.heading }}
                        />
                      </span>
                      <span className="truncate text-[11px]">{pal.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Individual Color Pickers */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <label className="p-2 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2 cursor-pointer">
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-500">
                      Primary
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#18181B] uppercase">
                      {primaryColor}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) =>
                      handleColorInput('primary', e.target.value)
                    }
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                </label>

                <label className="p-2 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2 cursor-pointer">
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-500">
                      Accent
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#18181B] uppercase">
                      {accentColor}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => handleColorInput('accent', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                </label>

                <label className="p-2 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2 cursor-pointer">
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-500">
                      Heading
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#18181B] uppercase">
                      {headingColor}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={headingColor}
                    onChange={(e) =>
                      handleColorInput('heading', e.target.value)
                    }
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                </label>
              </div>
            </div>

            {/* Right: Font Pairing & Decorative Calligraphy Heading Toggle */}
            <div className="md:col-span-5 space-y-2.5 md:border-l md:border-slate-100 md:pl-4">
              <span className="font-bold text-[#18181B] flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-[#18B89A]" />
                <span>Typography & Heading Style</span>
              </span>

              <div className="grid grid-cols-2 gap-1.5">
                {FONT_OPTIONS.map((f) => {
                  const isSel = fontFamily === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() =>
                        onUpdateFontFamily && onUpdateFontFamily(f.id)
                      }
                      className={`px-2.5 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSel
                          ? 'border-[#6D5CE8] bg-[#6D5CE8]/10 text-[#6D5CE8] font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                      style={{ fontFamily: f.cssFamily }}
                    >
                      <span className="block text-xs">{f.label}</span>
                      <span className="block text-[10px] text-slate-500 font-sans font-normal truncate">
                        {f.category}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() =>
                  onUpdateDecorativeHeading &&
                  onUpdateDecorativeHeading(!decorativeHeading)
                }
                className={`w-full px-3 py-2 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  decorativeHeading
                    ? 'border-[#6D5CE8] bg-[#6D5CE8]/10 text-[#18181B]'
                    : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:text-[#18181B]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#6D5CE8] shrink-0" />
                  <span className="text-[11px] font-semibold truncate">
                    Calligraphy Signature Heading
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    decorativeHeading
                      ? 'bg-[#6D5CE8] text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {decorativeHeading ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live A4 Sheet Container (794px x 1122px standard A4 aspect ratio, auto-scales on mobile screens) */}
      <div
        ref={previewViewportRef}
        className="flex-1 w-full overflow-x-hidden overflow-y-auto pb-8 flex justify-center"
      >
        <div
          style={{
            width:
              effectiveScale !== 1
                ? `${Math.round(794 * effectiveScale)}px`
                : '794px',
            height:
              effectiveScale !== 1
                ? `${Math.round(sheetHeight * effectiveScale)}px`
                : undefined,
            maxWidth: '100%',
          }}
          className="relative mx-auto transition-all duration-150"
        >
          <div
            ref={sheetRef}
            id="resume-print-area"
            className="print-only-container bg-white border border-slate-200 rounded-xl shadow-md transition-all duration-150 origin-top-left overflow-hidden flex flex-col relative"
            style={{
              width: '794px',
              minHeight: '1122px',
              fontFamily: selectedFontObj.cssFamily,
              transform:
                effectiveScale !== 1 ? `scale(${effectiveScale})` : undefined,
              transformOrigin: 'top left',
            }}
          >
          {/* Subtle Multi-Page A4 Break Guide at 1122px (Hidden in print) */}
          <div
            aria-hidden="true"
            className="no-print pointer-events-none absolute left-0 right-0 top-[1122px] border-t border-dashed border-slate-300/80 z-20 flex justify-end pr-3"
          >
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 bg-white px-1.5 -mt-2">
              A4 Page 1 / Page 2 Break
            </span>
          </div>

          {/* =====================================================================
              TEMPLATE 1: MODERN MINIMALIST (modern-violet)
             ===================================================================== */}
          {templateId === 'modern-violet' && (
            <div className={`flex-1 flex flex-col text-[#18181B] ${bodyTextClass}`}>
              {/* Top Decorative Primary Bar */}
              <div
                className="h-3 w-full shrink-0"
                style={{ backgroundColor: primaryColor }}
              />

              {/* Softly Tinted Header Band */}
              <div
                className="px-8 sm:px-11 pt-7 pb-6 border-b-2 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                style={{
                  borderColor: primaryColor,
                  backgroundColor: `${primaryColor}0D`,
                }}
              >
                <div className="min-w-0 flex-1">
                  <h1
                    className={`font-bold tracking-tight leading-tight ${
                      decorativeHeading
                        ? 'text-[38px] sm:text-[42px]'
                        : 'text-[29px] sm:text-[33px] font-extrabold'
                    }`}
                    style={{
                      color: headingColor,
                      ...decorativeNameStyle,
                    }}
                  >
                    {personalInfo.fullName || 'Your Name'}
                  </h1>
                  {personalInfo.jobTitle && (
                    <p
                      className="text-[15.5px] sm:text-[17px] font-bold mt-1"
                      style={{ color: accentColor, ...headingFontStyle }}
                    >
                      {personalInfo.jobTitle}
                    </p>
                  )}

                  {/* Contact Metadata Row */}
                  <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 mt-3.5 text-[12.8px] text-slate-600 font-medium">
                    {personalInfo.email && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {personalInfo.email}
                      </span>
                    )}
                    {personalInfo.phone && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">
                          •
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {personalInfo.phone}
                        </span>
                      </>
                    )}
                    {personalInfo.location && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">
                          •
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {personalInfo.location}
                        </span>
                      </>
                    )}
                    {personalInfo.website && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">
                          •
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          {personalInfo.website}
                        </span>
                      </>
                    )}
                    {personalInfo.linkedin && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">
                          •
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Linkedin className="w-3.5 h-3.5 text-slate-400" />
                          {personalInfo.linkedin}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {renderProfileAvatar('w-20 h-20 sm:w-22 sm:h-22', primaryColor)}
              </div>

              {/* Main Body Content */}
              <div
                className={`flex-1 flex flex-col justify-between px-8 sm:px-11 py-7 ${sectionSpacingClass}`}
              >
                <div className={sectionSpacingClass}>
                  {/* Helper for Modern Section Heading */}
                  {personalInfo.summary && (
                    <section>
                      <div className="mb-3 flex items-center gap-2.5 pb-1.5 border-b border-slate-200">
                        <span
                          aria-hidden="true"
                          className="w-1 h-4 rounded-xs shrink-0"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <h2
                          className="text-[13px] font-bold tracking-[0.08em] uppercase"
                          style={{ color: headingColor, ...headingFontStyle }}
                        >
                          Professional Summary
                        </h2>
                      </div>
                      <p className="text-slate-700 leading-[1.64]">
                        {personalInfo.summary}
                      </p>
                    </section>
                  )}

                  {skills.length > 0 && (
                    <section>
                      <div className="mb-3 flex items-center gap-2.5 pb-1.5 border-b border-slate-200">
                        <span
                          aria-hidden="true"
                          className="w-1 h-4 rounded-xs shrink-0"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <h2
                          className="text-[13px] font-bold tracking-[0.08em] uppercase"
                          style={{ color: headingColor, ...headingFontStyle }}
                        >
                          Core Competencies & Technical Skills
                        </h2>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 pt-0.5">
                        {skills.map((skill, idx) => (
                          <div
                            key={`${skill}-${idx}`}
                            className="flex items-center gap-2 text-[13.5px] font-semibold text-[#18181B]"
                          >
                            <span
                              aria-hidden="true"
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: accentColor }}
                            />
                            <span className="truncate">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {experience.length > 0 && (
                    <section>
                      <div className="mb-3 flex items-center gap-2.5 pb-1.5 border-b border-slate-200">
                        <span
                          aria-hidden="true"
                          className="w-1 h-4 rounded-xs shrink-0"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <h2
                          className="text-[13px] font-bold tracking-[0.08em] uppercase"
                          style={{ color: headingColor, ...headingFontStyle }}
                        >
                          Professional Experience
                        </h2>
                      </div>
                      <div className={entrySpacingClass}>
                        {experience.map((exp) => (
                          <div key={exp.id}>
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <h3
                                className="font-bold text-[15.5px]"
                                style={{ color: headingColor }}
                              >
                                {exp.role || 'Role Title'}
                              </h3>
                              <span className="font-mono tabular-nums text-[12.5px] font-semibold text-slate-500 shrink-0">
                                {exp.startDate} —{' '}
                                {exp.current ? 'Present' : exp.endDate}
                              </span>
                            </div>
                            <p
                              className="text-[13.5px] font-bold mt-0.5"
                              style={{ color: accentColor }}
                            >
                              {exp.company || 'Company Name'}
                              {exp.location ? `  •  ${exp.location}` : ''}
                            </p>
                            <ul
                              className={`mt-2 ${bulletSpacingClass} text-slate-700`}
                            >
                              {exp.bullets
                                .filter((b) => b.trim().length > 0)
                                .map((bullet, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2.5"
                                  >
                                    <span
                                      aria-hidden="true"
                                      className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                                      style={{ backgroundColor: primaryColor }}
                                    />
                                    <span className="flex-1">{bullet}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {projects.length > 0 && (
                    <section>
                      <div className="mb-3 flex items-center gap-2.5 pb-1.5 border-b border-slate-200">
                        <span
                          aria-hidden="true"
                          className="w-1 h-4 rounded-xs shrink-0"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <h2
                          className="text-[13px] font-bold tracking-[0.08em] uppercase"
                          style={{ color: headingColor, ...headingFontStyle }}
                        >
                          Selected Projects & Key Initiatives
                        </h2>
                      </div>
                      <div className={entrySpacingClass}>
                        {projects.map((proj) => (
                          <div key={proj.id}>
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <div className="flex flex-wrap items-baseline gap-2">
                                <h3
                                  className="font-bold text-[15px]"
                                  style={{ color: headingColor }}
                                >
                                  {proj.name}
                                </h3>
                                {proj.subtitle && (
                                  <span className="text-[13px] font-semibold text-slate-600">
                                    — {proj.subtitle}
                                  </span>
                                )}
                              </div>
                              {proj.link && (
                                <span
                                  className="font-mono text-[12px] font-medium"
                                  style={{ color: accentColor }}
                                >
                                  {proj.link}
                                </span>
                              )}
                            </div>
                            <ul
                              className={`mt-1.5 ${bulletSpacingClass} text-slate-700`}
                            >
                              {proj.bullets
                                .filter((b) => b.trim().length > 0)
                                .map((bullet, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2.5"
                                  >
                                    <span
                                      aria-hidden="true"
                                      className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                                      style={{ backgroundColor: primaryColor }}
                                    />
                                    <span className="flex-1">{bullet}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {education.length > 0 && (
                    <section>
                      <div className="mb-3 flex items-center gap-2.5 pb-1.5 border-b border-slate-200">
                        <span
                          aria-hidden="true"
                          className="w-1 h-4 rounded-xs shrink-0"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <h2
                          className="text-[13px] font-bold tracking-[0.08em] uppercase"
                          style={{ color: headingColor, ...headingFontStyle }}
                        >
                          Education
                        </h2>
                      </div>
                      <div className="space-y-3">
                        {education.map((edu) => (
                          <div
                            key={edu.id}
                            className="flex flex-wrap items-baseline justify-between gap-2"
                          >
                            <div>
                              <h3
                                className="font-bold text-[15px]"
                                style={{ color: headingColor }}
                              >
                                {edu.institution}
                              </h3>
                              <p className="text-[13.5px] text-slate-700 mt-0.5">
                                {[
                                  `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`,
                                  edu.location,
                                  edu.gpa ? `GPA: ${edu.gpa}` : '',
                                ]
                                  .filter(Boolean)
                                  .join('  •  ')}
                              </p>
                            </div>
                            <span className="font-mono tabular-nums text-[12.5px] font-semibold text-slate-500">
                              {edu.startDate} — {edu.endDate}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {(certifications.length > 0 || languages.length > 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-1">
                      {certifications.length > 0 && (
                        <section>
                          <div className="mb-3 flex items-center gap-2.5 pb-1.5 border-b border-slate-200">
                            <span
                              aria-hidden="true"
                              className="w-1 h-4 rounded-xs shrink-0"
                              style={{ backgroundColor: primaryColor }}
                            />
                            <h2
                              className="text-[13px] font-bold tracking-[0.08em] uppercase"
                              style={{
                                color: headingColor,
                                ...headingFontStyle,
                              }}
                            >
                              Certifications
                            </h2>
                          </div>
                          <div className="space-y-2">
                            {certifications.map((cert) => (
                              <div key={cert.id}>
                                <div
                                  className="font-bold text-[14px]"
                                  style={{ color: headingColor }}
                                >
                                  {cert.name}
                                </div>
                                <div className="text-[12.5px] text-slate-600 mt-0.5">
                                  {[
                                    cert.issuer,
                                    cert.date,
                                    cert.credentialId
                                      ? `ID: ${cert.credentialId}`
                                      : '',
                                  ]
                                    .filter(Boolean)
                                    .join(' · ')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {languages.length > 0 && (
                        <section>
                          <div className="mb-3 flex items-center gap-2.5 pb-1.5 border-b border-slate-200">
                            <span
                              aria-hidden="true"
                              className="w-1 h-4 rounded-xs shrink-0"
                              style={{ backgroundColor: primaryColor }}
                            />
                            <h2
                              className="text-[13px] font-bold tracking-[0.08em] uppercase"
                              style={{
                                color: headingColor,
                                ...headingFontStyle,
                              }}
                            >
                              Languages
                            </h2>
                          </div>
                          <div className="space-y-2">
                            {languages.map((lang) => (
                              <div
                                key={lang.id}
                                className="flex items-baseline justify-between text-[13.5px]"
                              >
                                <span
                                  className="font-bold"
                                  style={{ color: headingColor }}
                                >
                                  {lang.language}
                                </span>
                                <span className="text-slate-600 text-[13px]">
                                  {lang.proficiency}
                                </span>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TEMPLATE 2: EXECUTIVE CORPORATE (executive-minimal)
             ===================================================================== */}
          {templateId === 'executive-minimal' && (
            <div
              className={`flex-1 flex flex-col px-8 sm:px-12 py-10 text-[#18181B] ${sectionSpacingClass} ${bodyTextClass}`}
            >
              {/* Centered Classic Header with Double-Rule Border */}
              <div
                className="text-center pb-5 border-b-4 border-double flex flex-col items-center"
                style={{ borderColor: primaryColor }}
              >
                {hasVisiblePhoto && (
                  <div className="mb-3">
                    {renderProfileAvatar('w-20 h-20', primaryColor)}
                  </div>
                )}
                <h1
                  className={`tracking-tight ${
                    decorativeHeading
                      ? 'text-[38px] sm:text-[44px]'
                      : 'text-[30px] sm:text-[34px] font-extrabold'
                  }`}
                  style={{ color: headingColor, ...decorativeNameStyle }}
                >
                  {personalInfo.fullName || 'Your Name'}
                </h1>
                {personalInfo.jobTitle && (
                  <p
                    className="text-[14.5px] font-bold tracking-[0.12em] uppercase mt-1.5"
                    style={{ color: accentColor }}
                  >
                    {personalInfo.jobTitle}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-3 text-[12.5px] text-slate-600 font-medium">
                  {personalInfo.location && <span>{personalInfo.location}</span>}
                  {personalInfo.email && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{personalInfo.email}</span>
                    </>
                  )}
                  {personalInfo.phone && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {personalInfo.phone}
                      </span>
                    </>
                  )}
                  {personalInfo.linkedin && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{personalInfo.linkedin}</span>
                    </>
                  )}
                  {personalInfo.website && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{personalInfo.website}</span>
                    </>
                  )}
                </div>
              </div>

              {personalInfo.summary && (
                <section>
                  <p className="text-slate-700 leading-[1.65] text-center max-w-2xl mx-auto">
                    {personalInfo.summary}
                  </p>
                </section>
              )}

              {experience.length > 0 && (
                <section>
                  <h2
                    className="text-[13px] font-bold tracking-[0.12em] uppercase border-b pb-1.5 mb-3.5"
                    style={{
                      color: headingColor,
                      borderColor: `${primaryColor}55`,
                    }}
                  >
                    Professional Experience
                  </h2>
                  <div className={entrySpacingClass}>
                    {experience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3
                            className="font-bold text-[15.5px]"
                            style={{ color: headingColor }}
                          >
                            {exp.company}
                            <span
                              className="font-semibold"
                              style={{ color: accentColor }}
                            >
                              {' '}
                              — {exp.role}
                            </span>
                          </h3>
                          <span className="font-mono tabular-nums text-[12.5px] font-medium text-slate-500">
                            {exp.location ? `${exp.location} · ` : ''}
                            {exp.startDate} –{' '}
                            {exp.current ? 'Present' : exp.endDate}
                          </span>
                        </div>
                        <ul
                          className={`mt-2 ${bulletSpacingClass} list-disc list-outside ml-5 text-slate-700`}
                        >
                          {exp.bullets
                            .filter((b) => b.trim().length > 0)
                            .map((bullet, idx) => (
                              <li key={idx} className="pl-1">
                                {bullet}
                              </li>
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {projects.length > 0 && (
                <section>
                  <h2
                    className="text-[13px] font-bold tracking-[0.12em] uppercase border-b pb-1.5 mb-3.5"
                    style={{
                      color: headingColor,
                      borderColor: `${primaryColor}55`,
                    }}
                  >
                    Key Projects & Leadership Initiatives
                  </h2>
                  <div className={entrySpacingClass}>
                    {projects.map((proj) => (
                      <div key={proj.id}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3
                            className="font-bold text-[15px]"
                            style={{ color: headingColor }}
                          >
                            {proj.name}{' '}
                            {proj.subtitle && (
                              <span className="font-normal text-slate-600">
                                · {proj.subtitle}
                              </span>
                            )}
                          </h3>
                          {proj.link && (
                            <span
                              className="font-mono text-[12px]"
                              style={{ color: accentColor }}
                            >
                              {proj.link}
                            </span>
                          )}
                        </div>
                        <ul
                          className={`mt-1.5 ${bulletSpacingClass} list-disc list-outside ml-5 text-slate-700`}
                        >
                          {proj.bullets
                            .filter((b) => b.trim().length > 0)
                            .map((bullet, idx) => (
                              <li key={idx} className="pl-1">
                                {bullet}
                              </li>
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {education.length > 0 && (
                <section>
                  <h2
                    className="text-[13px] font-bold tracking-[0.12em] uppercase border-b pb-1.5 mb-3"
                    style={{
                      color: headingColor,
                      borderColor: `${primaryColor}55`,
                    }}
                  >
                    Education
                  </h2>
                  <div className="space-y-3">
                    {education.map((edu) => (
                      <div
                        key={edu.id}
                        className="flex flex-wrap items-baseline justify-between gap-2"
                      >
                        <div>
                          <h3
                            className="font-bold text-[15px]"
                            style={{ color: headingColor }}
                          >
                            {edu.institution}
                          </h3>
                          <p className="text-[13.5px] text-slate-700 mt-0.5">
                            {edu.degree}
                            {edu.field ? ` in ${edu.field}` : ''}
                            {edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
                          </p>
                        </div>
                        <span className="font-mono tabular-nums text-[12.5px] text-slate-500">
                          {edu.startDate} – {edu.endDate}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {skills.length > 0 && (
                <section>
                  <h2
                    className="text-[13px] font-bold tracking-[0.12em] uppercase border-b pb-1.5 mb-2.5"
                    style={{
                      color: headingColor,
                      borderColor: `${primaryColor}55`,
                    }}
                  >
                    Technical & Domain Competencies
                  </h2>
                  <p className="text-[13.5px] text-slate-800 leading-relaxed font-medium">
                    {skills.join('   ·   ')}
                  </p>
                </section>
              )}

              {(certifications.length > 0 || languages.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-1">
                  {certifications.length > 0 && (
                    <section>
                      <h2
                        className="text-[13px] font-bold tracking-[0.12em] uppercase border-b pb-1.5 mb-2.5"
                        style={{
                          color: headingColor,
                          borderColor: `${primaryColor}55`,
                        }}
                      >
                        Certifications
                      </h2>
                      <div className="space-y-2">
                        {certifications.map((cert) => (
                          <div key={cert.id} className="text-[13.5px]">
                            <span
                              className="font-bold"
                              style={{ color: headingColor }}
                            >
                              {cert.name}
                            </span>{' '}
                            <span className="text-slate-600">
                              — {cert.issuer}
                              {cert.date ? ` (${cert.date})` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {languages.length > 0 && (
                    <section>
                      <h2
                        className="text-[13px] font-bold tracking-[0.12em] uppercase border-b pb-1.5 mb-2.5"
                        style={{
                          color: headingColor,
                          borderColor: `${primaryColor}55`,
                        }}
                      >
                        Languages
                      </h2>
                      <p className="text-[13.5px] text-slate-700 leading-relaxed">
                        {languages
                          .map((l) => `${l.language} (${l.proficiency})`)
                          .join('   ·   ')}
                      </p>
                    </section>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              TEMPLATE 3: SPLIT COLUMN SIDEBAR (teal-split)
             ===================================================================== */}
          {templateId === 'teal-split' && (
            <div className={`flex-1 flex flex-col text-[#18181B] ${bodyTextClass}`}>
              {/* Top Accent Bar */}
              <div
                className="h-3 w-full shrink-0"
                style={{ backgroundColor: primaryColor }}
              />

              {/* Top Banner */}
              <div className="px-8 sm:px-10 pt-6 pb-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {renderProfileAvatar('w-16 h-16 sm:w-18 sm:h-18', primaryColor)}
                  <div>
                    <h1
                      className={`leading-tight ${
                        decorativeHeading
                          ? 'text-[36px] sm:text-[40px]'
                          : 'text-[28px] sm:text-[32px] font-extrabold tracking-tight'
                      }`}
                      style={{ color: headingColor, ...decorativeNameStyle }}
                    >
                      {personalInfo.fullName || 'Your Name'}
                    </h1>
                    <p
                      className="text-[15.5px] sm:text-[17px] font-bold mt-0.5"
                      style={{ color: accentColor }}
                    >
                      {personalInfo.jobTitle || 'Target Role Title'}
                    </p>
                  </div>
                </div>
                <div className="text-[12.5px] text-slate-600 space-y-1 sm:text-right font-medium">
                  {personalInfo.email && <div>{personalInfo.email}</div>}
                  {personalInfo.phone && (
                    <div className="font-mono tabular-nums">
                      {personalInfo.phone}
                    </div>
                  )}
                  {(personalInfo.location ||
                    personalInfo.website ||
                    personalInfo.linkedin) && (
                    <div>
                      {[
                        personalInfo.location,
                        personalInfo.website || personalInfo.linkedin,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  )}
                </div>
              </div>

              {/* 2-Column Asymmetric Split (Full Height) */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-12">
                {/* Main Left Column (8 cols) */}
                <div
                  className={`sm:col-span-8 p-7 sm:p-9 ${sectionSpacingClass}`}
                >
                  {personalInfo.summary && (
                    <section>
                      <h2
                        className="text-[12.5px] font-bold tracking-[0.08em] uppercase border-b border-slate-200 pb-1.5 mb-2.5"
                        style={{ color: primaryColor }}
                      >
                        Profile Summary
                      </h2>
                      <p className="text-slate-700 leading-[1.64]">
                        {personalInfo.summary}
                      </p>
                    </section>
                  )}

                  {experience.length > 0 && (
                    <section>
                      <h2
                        className="text-[12.5px] font-bold tracking-[0.08em] uppercase border-b border-slate-200 pb-1.5 mb-3"
                        style={{ color: primaryColor }}
                      >
                        Work Experience
                      </h2>
                      <div className={entrySpacingClass}>
                        {experience.map((exp) => (
                          <div key={exp.id}>
                            <div className="flex flex-wrap items-baseline justify-between gap-1">
                              <h3
                                className="font-bold text-[15px]"
                                style={{ color: headingColor }}
                              >
                                {exp.role}
                              </h3>
                              <span className="font-mono tabular-nums text-[12px] font-semibold text-slate-500">
                                {exp.startDate} —{' '}
                                {exp.current ? 'Present' : exp.endDate}
                              </span>
                            </div>
                            <p
                              className="text-[13px] font-bold mt-0.5"
                              style={{ color: accentColor }}
                            >
                              {exp.company}
                              {exp.location ? ` · ${exp.location}` : ''}
                            </p>
                            <ul
                              className={`mt-2 ${bulletSpacingClass} text-slate-700`}
                            >
                              {exp.bullets
                                .filter((b) => b.trim().length > 0)
                                .map((bullet, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2"
                                  >
                                    <span
                                      aria-hidden="true"
                                      className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                                      style={{ backgroundColor: primaryColor }}
                                    />
                                    <span className="flex-1">{bullet}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {projects.length > 0 && (
                    <section>
                      <h2
                        className="text-[12.5px] font-bold tracking-[0.08em] uppercase border-b border-slate-200 pb-1.5 mb-3"
                        style={{ color: primaryColor }}
                      >
                        Selected Projects
                      </h2>
                      <div className={entrySpacingClass}>
                        {projects.map((proj) => (
                          <div key={proj.id}>
                            <div className="flex flex-wrap items-baseline justify-between gap-1">
                              <h3
                                className="font-bold text-[14.5px]"
                                style={{ color: headingColor }}
                              >
                                {proj.name}
                              </h3>
                              {proj.link && (
                                <span
                                  className="font-mono text-[11.5px]"
                                  style={{ color: accentColor }}
                                >
                                  {proj.link}
                                </span>
                              )}
                            </div>
                            {proj.subtitle && (
                              <p className="text-[12.5px] font-medium text-slate-600">
                                {proj.subtitle}
                              </p>
                            )}
                            <ul
                              className={`mt-1.5 ${bulletSpacingClass} text-slate-700`}
                            >
                              {proj.bullets
                                .filter((b) => b.trim().length > 0)
                                .map((bullet, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2"
                                  >
                                    <span
                                      aria-hidden="true"
                                      className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                                      style={{ backgroundColor: primaryColor }}
                                    />
                                    <span className="flex-1">{bullet}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* Right Sidebar Column (4 cols with soft tint) */}
                <div
                  className={`sm:col-span-4 p-6 sm:p-7 sm:border-l sm:border-slate-200 ${sectionSpacingClass}`}
                  style={{ backgroundColor: `${primaryColor}0A` }}
                >
                  {skills.length > 0 && (
                    <section>
                      <h2
                        className="text-[12.5px] font-bold tracking-[0.08em] uppercase border-b border-slate-300 pb-1.5 mb-2.5"
                        style={{ color: primaryColor }}
                      >
                        Skills & Stack
                      </h2>
                      <ul className="space-y-1.5 text-[13px] text-[#18181B] font-semibold">
                        {skills.map((skill, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: accentColor }}
                            />
                            <span>{skill}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {education.length > 0 && (
                    <section>
                      <h2
                        className="text-[12.5px] font-bold tracking-[0.08em] uppercase border-b border-slate-300 pb-1.5 mb-2.5"
                        style={{ color: primaryColor }}
                      >
                        Education
                      </h2>
                      <div className="space-y-3">
                        {education.map((edu) => (
                          <div key={edu.id}>
                            <h3
                              className="font-bold text-[13.5px]"
                              style={{ color: headingColor }}
                            >
                              {edu.institution}
                            </h3>
                            <p className="text-[13px] text-slate-700 mt-0.5">
                              {edu.degree}
                              {edu.field ? ` in ${edu.field}` : ''}
                            </p>
                            <p className="font-mono tabular-nums text-[11.5px] text-slate-500 mt-0.5">
                              {edu.startDate} – {edu.endDate}
                            </p>
                            {edu.gpa && (
                              <p className="font-mono tabular-nums text-[11.5px] text-slate-600">
                                GPA: {edu.gpa}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {certifications.length > 0 && (
                    <section>
                      <h2
                        className="text-[12.5px] font-bold tracking-[0.08em] uppercase border-b border-slate-300 pb-1.5 mb-2.5"
                        style={{ color: primaryColor }}
                      >
                        Certifications
                      </h2>
                      <div className="space-y-2.5">
                        {certifications.map((cert) => (
                          <div key={cert.id}>
                            <div
                              className="font-bold text-[13px]"
                              style={{ color: headingColor }}
                            >
                              {cert.name}
                            </div>
                            <div className="text-[12px] text-slate-600 mt-0.5">
                              {[cert.issuer, cert.date]
                                .filter(Boolean)
                                .join(' · ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {languages.length > 0 && (
                    <section>
                      <h2
                        className="text-[12.5px] font-bold tracking-[0.08em] uppercase border-b border-slate-300 pb-1.5 mb-2.5"
                        style={{ color: primaryColor }}
                      >
                        Languages
                      </h2>
                      <div className="space-y-2">
                        {languages.map((lang) => (
                          <div key={lang.id}>
                            <div
                              className="font-bold text-[13px]"
                              style={{ color: headingColor }}
                            >
                              {lang.language}
                            </div>
                            <div className="text-[12px] text-slate-600">
                              {lang.proficiency}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TEMPLATE 4: CREATIVE STUDIO (creative-studio)
              Bold solid-color header block, visual timeline experience, badge pills
             ===================================================================== */}
          {templateId === 'creative-studio' && (
            <div className={`flex-1 flex flex-col text-[#18181B] ${bodyTextClass}`}>
              {/* Bold Creative Banner Block */}
              <div
                className="px-8 sm:px-11 py-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <span
                    className="inline-block text-[10px] font-mono uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-md bg-white/15 text-white/95"
                  >
                    Curriculum Vitae
                  </span>
                  <h1
                    className={`leading-tight text-white ${
                      decorativeHeading
                        ? 'text-[38px] sm:text-[44px]'
                        : 'text-[30px] sm:text-[35px] font-extrabold tracking-tight'
                    }`}
                    style={decorativeNameStyle}
                  >
                    {personalInfo.fullName || 'Your Name'}
                  </h1>
                  {personalInfo.jobTitle && (
                    <p className="text-[16px] font-semibold text-white/90">
                      {personalInfo.jobTitle}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 text-[12.5px] text-white/85">
                    {personalInfo.email && <span>{personalInfo.email}</span>}
                    {personalInfo.phone && (
                      <span className="font-mono tabular-nums">
                        {personalInfo.phone}
                      </span>
                    )}
                    {personalInfo.location && (
                      <span>{personalInfo.location}</span>
                    )}
                    {personalInfo.website && <span>{personalInfo.website}</span>}
                    {personalInfo.linkedin && (
                      <span>{personalInfo.linkedin}</span>
                    )}
                  </div>
                </div>

                {renderProfileAvatar('w-22 h-22 sm:w-24 sm:h-24', '#FFFFFF')}
              </div>

              {/* Creative Body with Timeline Experience & Visual Skill Chips */}
              <div className={`flex-1 px-8 sm:px-11 py-7 ${sectionSpacingClass}`}>
                {personalInfo.summary && (
                  <section
                    className="p-4 rounded-xl border-l-4"
                    style={{
                      backgroundColor: `${primaryColor}08`,
                      borderColor: accentColor,
                    }}
                  >
                    <p className="text-slate-700 leading-[1.64]">
                      {personalInfo.summary}
                    </p>
                  </section>
                )}

                {skills.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: accentColor }}
                      />
                      <h2
                        className="text-[13px] font-bold tracking-[0.1em] uppercase"
                        style={{ color: headingColor }}
                      >
                        Core Capabilities & Toolkit
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-lg text-[12.5px] font-bold border"
                          style={{
                            backgroundColor: `${primaryColor}0D`,
                            borderColor: `${primaryColor}30`,
                            color: headingColor,
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {experience.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3.5">
                      <span
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: accentColor }}
                      />
                      <h2
                        className="text-[13px] font-bold tracking-[0.1em] uppercase"
                        style={{ color: headingColor }}
                      >
                        Career Timeline & Impact
                      </h2>
                    </div>
                    <div
                      className={`border-l-2 pl-5 ml-1 ${entrySpacingClass}`}
                      style={{ borderColor: `${primaryColor}35` }}
                    >
                      {experience.map((exp) => (
                        <div key={exp.id} className="relative">
                          <span
                            aria-hidden="true"
                            className="w-3 h-3 rounded-full border-2 border-white absolute -left-[27px] top-1"
                            style={{ backgroundColor: primaryColor }}
                          />
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h3
                              className="font-bold text-[15.5px]"
                              style={{ color: headingColor }}
                            >
                              {exp.role}
                            </h3>
                            <span
                              className="font-mono tabular-nums text-[11.5px] font-bold px-2 py-0.5 rounded"
                              style={{
                                backgroundColor: `${accentColor}15`,
                                color: accentColor,
                              }}
                            >
                              {exp.startDate} —{' '}
                              {exp.current ? 'Present' : exp.endDate}
                            </span>
                          </div>
                          <p
                            className="text-[13.5px] font-bold mt-0.5"
                            style={{ color: primaryColor }}
                          >
                            {exp.company}
                            {exp.location ? ` · ${exp.location}` : ''}
                          </p>
                          <ul
                            className={`mt-2 ${bulletSpacingClass} text-slate-700`}
                          >
                            {exp.bullets
                              .filter((b) => b.trim().length > 0)
                              .map((bullet, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <span
                                    aria-hidden="true"
                                    className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                                    style={{ backgroundColor: accentColor }}
                                  />
                                  <span className="flex-1">{bullet}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {projects.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: accentColor }}
                      />
                      <h2
                        className="text-[13px] font-bold tracking-[0.1em] uppercase"
                        style={{ color: headingColor }}
                      >
                        Featured Projects
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {projects.map((proj) => (
                        <div
                          key={proj.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h3
                              className="font-bold text-[14.5px]"
                              style={{ color: headingColor }}
                            >
                              {proj.name}
                              {proj.subtitle && (
                                <span className="font-normal text-slate-600">
                                  {' '}
                                  — {proj.subtitle}
                                </span>
                              )}
                            </h3>
                            {proj.link && (
                              <span
                                className="font-mono text-[11.5px] font-semibold"
                                style={{ color: accentColor }}
                              >
                                {proj.link}
                              </span>
                            )}
                          </div>
                          <ul
                            className={`mt-1.5 ${bulletSpacingClass} text-slate-700`}
                          >
                            {proj.bullets
                              .filter((b) => b.trim().length > 0)
                              .map((bullet, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span
                                    aria-hidden="true"
                                    className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                                    style={{ backgroundColor: primaryColor }}
                                  />
                                  <span className="flex-1">{bullet}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Bottom Grid: Education, Certifications, Languages */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                  {education.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-sm"
                          style={{ backgroundColor: accentColor }}
                        />
                        <h2
                          className="text-[13px] font-bold tracking-[0.1em] uppercase"
                          style={{ color: headingColor }}
                        >
                          Education
                        </h2>
                      </div>
                      <div className="space-y-2.5">
                        {education.map((edu) => (
                          <div key={edu.id}>
                            <h3
                              className="font-bold text-[14px]"
                              style={{ color: headingColor }}
                            >
                              {edu.institution}
                            </h3>
                            <p className="text-[13px] text-slate-700">
                              {edu.degree}
                              {edu.field ? ` in ${edu.field}` : ''}
                            </p>
                            <p className="font-mono tabular-nums text-[11.5px] text-slate-500">
                              {edu.startDate} – {edu.endDate}
                              {edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {(certifications.length > 0 || languages.length > 0) && (
                    <section className="space-y-4">
                      {certifications.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="w-2.5 h-2.5 rounded-sm"
                              style={{ backgroundColor: accentColor }}
                            />
                            <h2
                              className="text-[13px] font-bold tracking-[0.1em] uppercase"
                              style={{ color: headingColor }}
                            >
                              Certifications
                            </h2>
                          </div>
                          <div className="space-y-1.5">
                            {certifications.map((c) => (
                              <div key={c.id} className="text-[13px]">
                                <span
                                  className="font-bold"
                                  style={{ color: headingColor }}
                                >
                                  {c.name}
                                </span>{' '}
                                <span className="text-slate-600">
                                  ({c.issuer})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {languages.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-sm"
                              style={{ backgroundColor: accentColor }}
                            />
                            <h2
                              className="text-[13px] font-bold tracking-[0.1em] uppercase"
                              style={{ color: headingColor }}
                            >
                              Languages
                            </h2>
                          </div>
                          <p className="text-[13px] text-slate-700">
                            {languages
                              .map((l) => `${l.language} (${l.proficiency})`)
                              .join(' · ')}
                          </p>
                        </div>
                      )}
                    </section>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TEMPLATE 5: PROFESSIONAL ATS STANDARD (professional-ats)
              Traditional institutional ATS layout, crisp full-width solid rules
             ===================================================================== */}
          {templateId === 'professional-ats' && (
            <div
              className={`flex-1 flex flex-col px-8 sm:px-12 py-9 text-[#18181B] ${sectionSpacingClass} ${bodyTextClass}`}
            >
              {/* Classic Left/Right Institutional Header */}
              <div
                className="pb-4 border-b-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
                style={{ borderColor: primaryColor }}
              >
                <div className="flex items-center gap-4">
                  {renderProfileAvatar('w-16 h-16', primaryColor)}
                  <div>
                    <h1
                      className={`uppercase tracking-tight ${
                        decorativeHeading
                          ? 'text-[36px] normal-case'
                          : 'text-[28px] sm:text-[31px] font-extrabold'
                      }`}
                      style={{ color: headingColor, ...decorativeNameStyle }}
                    >
                      {personalInfo.fullName || 'Your Name'}
                    </h1>
                    {personalInfo.jobTitle && (
                      <p
                        className="text-[14.5px] font-bold mt-0.5"
                        style={{ color: accentColor }}
                      >
                        {personalInfo.jobTitle}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-[12.5px] text-slate-700 sm:text-right space-y-0.5 font-medium">
                  <div>
                    {[personalInfo.location, personalInfo.phone]
                      .filter(Boolean)
                      .join('  |  ')}
                  </div>
                  <div>
                    {[
                      personalInfo.email,
                      personalInfo.linkedin,
                      personalInfo.website,
                    ]
                      .filter(Boolean)
                      .join('  |  ')}
                  </div>
                </div>
              </div>

              {personalInfo.summary && (
                <section>
                  <h2
                    className="text-[12.5px] font-extrabold uppercase tracking-[0.08em] border-b pb-1 mb-2"
                    style={{ color: headingColor, borderColor: primaryColor }}
                  >
                    Professional Summary
                  </h2>
                  <p className="text-slate-800 leading-[1.6]">
                    {personalInfo.summary}
                  </p>
                </section>
              )}

              {experience.length > 0 && (
                <section>
                  <h2
                    className="text-[12.5px] font-extrabold uppercase tracking-[0.08em] border-b pb-1 mb-3"
                    style={{ color: headingColor, borderColor: primaryColor }}
                  >
                    Work Experience
                  </h2>
                  <div className={entrySpacingClass}>
                    {experience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3
                            className="font-bold text-[15px]"
                            style={{ color: headingColor }}
                          >
                            {exp.role}
                          </h3>
                          <span className="font-mono tabular-nums text-[12.5px] font-bold text-slate-700">
                            {exp.startDate} –{' '}
                            {exp.current ? 'Present' : exp.endDate}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-baseline justify-between gap-2 text-[13.5px] font-semibold mb-1.5">
                          <span style={{ color: accentColor }}>
                            {exp.company}
                          </span>
                          {exp.location && (
                            <span className="text-slate-600 text-[12.5px]">
                              {exp.location}
                            </span>
                          )}
                        </div>
                        <ul
                          className={`${bulletSpacingClass} list-disc list-outside ml-5 text-slate-800`}
                        >
                          {exp.bullets
                            .filter((b) => b.trim().length > 0)
                            .map((bullet, idx) => (
                              <li key={idx}>{bullet}</li>
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {education.length > 0 && (
                <section>
                  <h2
                    className="text-[12.5px] font-extrabold uppercase tracking-[0.08em] border-b pb-1 mb-2.5"
                    style={{ color: headingColor, borderColor: primaryColor }}
                  >
                    Education
                  </h2>
                  <div className="space-y-2.5">
                    {education.map((edu) => (
                      <div
                        key={edu.id}
                        className="flex flex-wrap items-baseline justify-between gap-2"
                      >
                        <div>
                          <span
                            className="font-bold text-[14.5px]"
                            style={{ color: headingColor }}
                          >
                            {edu.institution}
                          </span>
                          <span className="text-slate-700 text-[13.5px]">
                            {' '}
                            — {edu.degree}
                            {edu.field ? ` in ${edu.field}` : ''}
                            {edu.gpa ? ` (GPA: ${edu.gpa})` : ''}
                          </span>
                        </div>
                        <span className="font-mono tabular-nums text-[12.5px] font-bold text-slate-700">
                          {edu.startDate} – {edu.endDate}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {projects.length > 0 && (
                <section>
                  <h2
                    className="text-[12.5px] font-extrabold uppercase tracking-[0.08em] border-b pb-1 mb-2.5"
                    style={{ color: headingColor, borderColor: primaryColor }}
                  >
                    Projects
                  </h2>
                  <div className={entrySpacingClass}>
                    {projects.map((proj) => (
                      <div key={proj.id}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3
                            className="font-bold text-[14.5px]"
                            style={{ color: headingColor }}
                          >
                            {proj.name}
                            {proj.subtitle ? ` — ${proj.subtitle}` : ''}
                          </h3>
                          {proj.link && (
                            <span className="font-mono text-[12px] text-slate-600">
                              {proj.link}
                            </span>
                          )}
                        </div>
                        <ul
                          className={`mt-1 ${bulletSpacingClass} list-disc list-outside ml-5 text-slate-800`}
                        >
                          {proj.bullets
                            .filter((b) => b.trim().length > 0)
                            .map((bullet, idx) => (
                              <li key={idx}>{bullet}</li>
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {skills.length > 0 && (
                <section>
                  <h2
                    className="text-[12.5px] font-extrabold uppercase tracking-[0.08em] border-b pb-1 mb-2"
                    style={{ color: headingColor, borderColor: primaryColor }}
                  >
                    Technical Skills & Core Competencies
                  </h2>
                  <p className="text-[13.5px] text-slate-800 leading-relaxed">
                    <strong style={{ color: headingColor }}>
                      Core Skills:{' '}
                    </strong>
                    {skills.join(', ')}
                  </p>
                </section>
              )}

              {(certifications.length > 0 || languages.length > 0) && (
                <section>
                  <h2
                    className="text-[12.5px] font-extrabold uppercase tracking-[0.08em] border-b pb-1 mb-2"
                    style={{ color: headingColor, borderColor: primaryColor }}
                  >
                    Certifications & Languages
                  </h2>
                  <div className="space-y-1.5 text-[13.5px] text-slate-800">
                    {certifications.length > 0 && (
                      <p>
                        <strong style={{ color: headingColor }}>
                          Certifications:{' '}
                        </strong>
                        {certifications
                          .map(
                            (c) =>
                              `${c.name} (${c.issuer}${c.date ? `, ${c.date}` : ''})`
                          )
                          .join('; ')}
                      </p>
                    )}
                    {languages.length > 0 && (
                      <p>
                        <strong style={{ color: headingColor }}>
                          Languages:{' '}
                        </strong>
                        {languages
                          .map((l) => `${l.language} (${l.proficiency})`)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* =====================================================================
              TEMPLATE 6: ELEGANT EDITORIAL (elegant-editorial)
              Ornamental diamond section dividers, refined frame, editorial grace
             ===================================================================== */}
          {templateId === 'elegant-editorial' && (
            <div
              className={`flex-1 flex flex-col px-9 sm:px-13 py-10 text-[#18181B] ${sectionSpacingClass} ${bodyTextClass}`}
            >
              {/* Elegant Framed Header */}
              <div className="text-center space-y-2 pb-6 border-b border-slate-200 flex flex-col items-center">
                {hasVisiblePhoto && (
                  <div className="mb-2">
                    {renderProfileAvatar('w-20 h-20', accentColor)}
                  </div>
                )}
                <h1
                  className={`tracking-wide ${
                    decorativeHeading
                      ? 'text-[40px] sm:text-[46px]'
                      : 'text-[31px] sm:text-[36px] font-bold'
                  }`}
                  style={{ color: headingColor, ...decorativeNameStyle }}
                >
                  {personalInfo.fullName || 'Your Name'}
                </h1>
                {personalInfo.jobTitle && (
                  <p
                    className="text-[14px] font-semibold tracking-[0.18em] uppercase"
                    style={{ color: primaryColor }}
                  >
                    {personalInfo.jobTitle}
                  </p>
                )}
                <div className="flex items-center justify-center gap-3 w-48 mx-auto py-1">
                  <span
                    className="h-px flex-1"
                    style={{ backgroundColor: `${primaryColor}50` }}
                  />
                  <span
                    className="text-[10px]"
                    style={{ color: accentColor }}
                  >
                    ◆
                  </span>
                  <span
                    className="h-px flex-1"
                    style={{ backgroundColor: `${primaryColor}50` }}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 text-[12.5px] text-slate-600">
                  {personalInfo.email && <span>{personalInfo.email}</span>}
                  {personalInfo.phone && (
                    <>
                      <span style={{ color: accentColor }}>◇</span>
                      <span className="font-mono tabular-nums">
                        {personalInfo.phone}
                      </span>
                    </>
                  )}
                  {personalInfo.location && (
                    <>
                      <span style={{ color: accentColor }}>◇</span>
                      <span>{personalInfo.location}</span>
                    </>
                  )}
                  {personalInfo.website && (
                    <>
                      <span style={{ color: accentColor }}>◇</span>
                      <span>{personalInfo.website}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Helper for Ornamental Section Divider */}
              {personalInfo.summary && (
                <section>
                  <p className="text-slate-700 leading-[1.7] text-center italic max-w-2xl mx-auto">
                    &ldquo;{personalInfo.summary}&rdquo;
                  </p>
                </section>
              )}

              {experience.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="h-px flex-1"
                      style={{ backgroundColor: `${primaryColor}35` }}
                    />
                    <h2
                      className="text-[12.5px] font-bold tracking-[0.18em] uppercase flex items-center gap-2 shrink-0"
                      style={{ color: headingColor }}
                    >
                      <span
                        className="text-[9px]"
                        style={{ color: primaryColor }}
                      >
                        ◆
                      </span>
                      <span>Professional Experience</span>
                      <span
                        className="text-[9px]"
                        style={{ color: primaryColor }}
                      >
                        ◆
                      </span>
                    </h2>
                    <span
                      className="h-px flex-1"
                      style={{ backgroundColor: `${primaryColor}35` }}
                    />
                  </div>

                  <div className={entrySpacingClass}>
                    {experience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3
                            className="font-bold text-[15.5px]"
                            style={{ color: headingColor }}
                          >
                            {exp.role}
                          </h3>
                          <span className="font-mono tabular-nums text-[12px] text-slate-500">
                            {exp.startDate} —{' '}
                            {exp.current ? 'Present' : exp.endDate}
                          </span>
                        </div>
                        <p
                          className="text-[13.5px] font-semibold italic mt-0.5"
                          style={{ color: accentColor }}
                        >
                          {exp.company}
                          {exp.location ? `, ${exp.location}` : ''}
                        </p>
                        <ul
                          className={`mt-2 ${bulletSpacingClass} text-slate-700`}
                        >
                          {exp.bullets
                            .filter((b) => b.trim().length > 0)
                            .map((bullet, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2.5"
                              >
                                <span
                                  aria-hidden="true"
                                  className="text-[10px] mt-1 shrink-0"
                                  style={{ color: primaryColor }}
                                >
                                  ◆
                                </span>
                                <span className="flex-1">{bullet}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {projects.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-3.5">
                    <span
                      className="h-px flex-1"
                      style={{ backgroundColor: `${primaryColor}35` }}
                    />
                    <h2
                      className="text-[12.5px] font-bold tracking-[0.18em] uppercase flex items-center gap-2 shrink-0"
                      style={{ color: headingColor }}
                    >
                      <span
                        className="text-[9px]"
                        style={{ color: primaryColor }}
                      >
                        ◆
                      </span>
                      <span>Selected Works & Projects</span>
                      <span
                        className="text-[9px]"
                        style={{ color: primaryColor }}
                      >
                        ◆
                      </span>
                    </h2>
                    <span
                      className="h-px flex-1"
                      style={{ backgroundColor: `${primaryColor}35` }}
                    />
                  </div>
                  <div className={entrySpacingClass}>
                    {projects.map((proj) => (
                      <div key={proj.id}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3
                            className="font-bold text-[15px]"
                            style={{ color: headingColor }}
                          >
                            {proj.name}
                            {proj.subtitle && (
                              <span className="font-normal italic text-slate-600">
                                {' '}
                                — {proj.subtitle}
                              </span>
                            )}
                          </h3>
                          {proj.link && (
                            <span
                              className="font-mono text-[12px]"
                              style={{ color: accentColor }}
                            >
                              {proj.link}
                            </span>
                          )}
                        </div>
                        <ul
                          className={`mt-1.5 ${bulletSpacingClass} text-slate-700`}
                        >
                          {proj.bullets
                            .filter((b) => b.trim().length > 0)
                            .map((bullet, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2.5"
                              >
                                <span
                                  aria-hidden="true"
                                  className="text-[10px] mt-1 shrink-0"
                                  style={{ color: primaryColor }}
                                >
                                  ◆
                                </span>
                                <span className="flex-1">{bullet}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {skills.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="h-px flex-1"
                      style={{ backgroundColor: `${primaryColor}35` }}
                    />
                    <h2
                      className="text-[12.5px] font-bold tracking-[0.18em] uppercase flex items-center gap-2 shrink-0"
                      style={{ color: headingColor }}
                    >
                      <span
                        className="text-[9px]"
                        style={{ color: primaryColor }}
                      >
                        ◆
                      </span>
                      <span>Areas of Expertise</span>
                      <span
                        className="text-[9px]"
                        style={{ color: primaryColor }}
                      >
                        ◆
                      </span>
                    </h2>
                    <span
                      className="h-px flex-1"
                      style={{ backgroundColor: `${primaryColor}35` }}
                    />
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[13.5px] font-medium text-slate-800">
                    {skills.map((skill, idx) => (
                      <span key={idx} className="inline-flex items-center gap-2">
                        {idx > 0 && (
                          <span
                            className="text-[10px]"
                            style={{ color: accentColor }}
                          >
                            ·
                          </span>
                        )}
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-1">
                {education.length > 0 && (
                  <section>
                    <h2
                      className="text-[12.5px] font-bold tracking-[0.15em] uppercase border-b pb-1.5 mb-2.5"
                      style={{
                        color: headingColor,
                        borderColor: `${primaryColor}40`,
                      }}
                    >
                      Education
                    </h2>
                    <div className="space-y-2.5">
                      {education.map((edu) => (
                        <div key={edu.id}>
                          <h3
                            className="font-bold text-[14.5px]"
                            style={{ color: headingColor }}
                          >
                            {edu.institution}
                          </h3>
                          <p className="text-[13.5px] text-slate-700 italic">
                            {edu.degree}
                            {edu.field ? ` in ${edu.field}` : ''}
                          </p>
                          <p className="font-mono tabular-nums text-[12px] text-slate-500">
                            {edu.startDate} – {edu.endDate}
                            {edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {(certifications.length > 0 || languages.length > 0) && (
                  <section className="space-y-3">
                    {certifications.length > 0 && (
                      <div>
                        <h2
                          className="text-[12.5px] font-bold tracking-[0.15em] uppercase border-b pb-1.5 mb-2"
                          style={{
                            color: headingColor,
                            borderColor: `${primaryColor}40`,
                          }}
                        >
                          Credentials & Honors
                        </h2>
                        <div className="space-y-1.5">
                          {certifications.map((c) => (
                            <div key={c.id} className="text-[13.5px]">
                              <span
                                className="font-bold"
                                style={{ color: headingColor }}
                              >
                                {c.name}
                              </span>{' '}
                              <span className="text-slate-600">
                                — {c.issuer}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {languages.length > 0 && (
                      <div>
                        <h2
                          className="text-[12.5px] font-bold tracking-[0.15em] uppercase border-b pb-1.5 mb-1.5"
                          style={{
                            color: headingColor,
                            borderColor: `${primaryColor}40`,
                          }}
                        >
                          Languages
                        </h2>
                        <p className="text-[13.5px] text-slate-700">
                          {languages
                            .map((l) => `${l.language} (${l.proficiency})`)
                            .join(' · ')}
                        </p>
                      </div>
                    )}
                  </section>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
