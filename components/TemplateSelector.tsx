'use client';

import React from 'react';
import {
  Check,
  LayoutTemplate,
  Palette,
  SlidersHorizontal,
  Type,
  Sparkles,
} from 'lucide-react';
import {
  ResumeDraft,
  CustomColors,
  COLOR_PALETTES,
  FONT_OPTIONS,
  TEMPLATE_CATALOG,
  resolveResumeColors,
} from '@/lib/types';

interface TemplateSelectorProps {
  resume: ResumeDraft;
  onChangeResume: (updated: ResumeDraft) => void;
}

export default function TemplateSelector({
  resume,
  onChangeResume,
}: TemplateSelectorProps) {
  const colors = resolveResumeColors(resume);
  const activeFont = resume.fontFamily || 'inter';
  const decorativeHeading = Boolean(resume.decorativeHeading);

  const handleApplyPalette = (pal: (typeof COLOR_PALETTES)[number]) => {
    onChangeResume({
      ...resume,
      updatedAt: new Date().toISOString(),
      accentColor: pal.primary,
      customColors: {
        primary: pal.primary,
        accent: pal.accent,
        heading: pal.heading,
        paletteId: pal.id,
      },
    });
  };

  const handleUpdateColorChannel = (
    channel: keyof CustomColors,
    hex: string
  ) => {
    const nextColors: CustomColors = {
      ...colors,
      [channel]: hex,
      paletteId: 'custom',
    };
    onChangeResume({
      ...resume,
      updatedAt: new Date().toISOString(),
      accentColor: nextColors.primary,
      customColors: nextColors,
    });
  };

  return (
    <div className="space-y-5">
      {/* 1. Six Distinct Template Gallery Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="font-display text-base font-bold text-[#18181B] flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-[#6D5CE8]" />
            <span>Six Visually Distinct A4 Templates</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Every template features a distinct header geometry, section divider architecture, and layout flow. Switch anytime without losing data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEMPLATE_CATALOG.map((tpl) => {
            const isSelected = resume.templateId === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() =>
                  onChangeResume({
                    ...resume,
                    updatedAt: new Date().toISOString(),
                    templateId: tpl.id,
                  })
                }
                className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-[#6D5CE8] bg-[#6D5CE8]/5 ring-2 ring-[#6D5CE8]/15'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  {/* Mini Structural Wireframe Preview */}
                  <div className="h-28 rounded-xl border border-slate-200 bg-white p-3 mb-3 flex flex-col justify-between overflow-hidden">
                    {tpl.id === 'modern-violet' && (
                      <>
                        <div
                          className="border-b-2 pb-1.5 flex items-center justify-between"
                          style={{ borderColor: colors.primary }}
                        >
                          <div>
                            <div className="h-2.5 w-24 bg-slate-800 rounded" />
                            <div
                              className="h-1.5 w-16 rounded mt-1"
                              style={{ backgroundColor: colors.accent }}
                            />
                          </div>
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ borderColor: colors.primary }}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1">
                            <span
                              className="w-1 h-2.5 rounded-xs"
                              style={{ backgroundColor: colors.primary }}
                            />
                            <span className="h-1.5 w-14 bg-slate-700 rounded" />
                          </div>
                          <div className="h-1.5 w-full bg-slate-200 rounded" />
                          <div className="h-1.5 w-5/6 bg-slate-200 rounded" />
                        </div>
                      </>
                    )}

                    {tpl.id === 'executive-minimal' && (
                      <>
                        <div className="border-b-2 border-double border-slate-700 pb-1.5 flex flex-col items-center">
                          <div className="h-2.5 w-24 bg-slate-800 rounded" />
                          <div className="h-1.5 w-16 bg-slate-400 rounded mt-1" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="h-1.5 w-20 bg-slate-700 rounded" />
                          <div className="h-1.5 w-full bg-slate-200 rounded" />
                          <div className="h-1.5 w-3/4 bg-slate-200 rounded" />
                        </div>
                      </>
                    )}

                    {tpl.id === 'teal-split' && (
                      <div className="grid grid-cols-12 gap-2 h-full">
                        <div className="col-span-8 space-y-1.5 pr-1">
                          <div className="h-2.5 w-20 bg-slate-800 rounded" />
                          <div className="h-1.5 w-full bg-slate-200 rounded mt-2" />
                          <div className="h-1.5 w-5/6 bg-slate-200 rounded" />
                          <div className="h-1.5 w-4/5 bg-slate-200 rounded" />
                        </div>
                        <div
                          className="col-span-4 border-l border-slate-200 pl-2 py-1 space-y-1.5 rounded-r"
                          style={{ backgroundColor: `${colors.primary}12` }}
                        >
                          <div
                            className="h-2 w-10 rounded"
                            style={{ backgroundColor: colors.primary }}
                          />
                          <div className="h-1.5 w-full bg-slate-300 rounded" />
                          <div className="h-1.5 w-full bg-slate-300 rounded" />
                        </div>
                      </div>
                    )}

                    {tpl.id === 'creative-studio' && (
                      <>
                        <div
                          className="p-2 rounded-lg flex items-center justify-between"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <div className="space-y-1">
                            <div className="h-2 w-20 bg-white rounded" />
                            <div className="h-1.5 w-12 bg-white/70 rounded" />
                          </div>
                          <div className="w-5 h-5 rounded-full bg-white/30 border border-white" />
                        </div>
                        <div className="border-l-2 pl-2 ml-1 space-y-1.5" style={{ borderColor: colors.accent }}>
                          <div className="flex gap-1">
                            <span className="h-2 w-8 rounded bg-slate-200" />
                            <span className="h-2 w-8 rounded bg-slate-200" />
                          </div>
                          <div className="h-1.5 w-5/6 bg-slate-200 rounded" />
                        </div>
                      </>
                    )}

                    {tpl.id === 'professional-ats' && (
                      <>
                        <div className="border-b border-slate-800 pb-1 flex items-end justify-between">
                          <div className="h-2.5 w-20 bg-slate-900 rounded" />
                          <div className="h-1.5 w-12 bg-slate-400 rounded" />
                        </div>
                        <div className="space-y-1">
                          <div className="h-1.5 w-16 bg-slate-800 rounded" />
                          <div className="h-px w-full bg-slate-400" />
                          <div className="h-1.5 w-full bg-slate-200 rounded" />
                          <div className="h-1.5 w-11/12 bg-slate-200 rounded" />
                        </div>
                      </>
                    )}

                    {tpl.id === 'elegant-editorial' && (
                      <>
                        <div className="flex flex-col items-center pb-1">
                          <div className="h-2.5 w-24 bg-slate-800 rounded" />
                          <div className="flex items-center gap-1 w-20 my-1">
                            <span className="h-px flex-1 bg-slate-300" />
                            <span
                              className="text-[8px] leading-none"
                              style={{ color: colors.accent }}
                            >
                              ◆
                            </span>
                            <span className="h-px flex-1 bg-slate-300" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="h-1.5 w-full bg-slate-200 rounded" />
                          <div className="h-1.5 w-4/5 mx-auto bg-slate-200 rounded" />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-sm font-bold text-[#18181B]">
                      {tpl.name}
                    </h3>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#6D5CE8] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-[#6D5CE8] mt-0.5">
                    {tpl.subtitle}
                  </p>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
                  Best for: {tpl.recommendedFor}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Multi-Color Palettes & Custom Color Channels */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-display text-sm sm:text-base font-bold text-[#18181B] flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#6D5CE8]" />
            <span>Color Palettes & Custom Channels</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a curated designer palette or fine-tune Primary, Accent, and Heading colors individually.
          </p>
        </div>

        {/* 6 Palette Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {COLOR_PALETTES.map((pal) => {
            const isSelected =
              colors.primary.toLowerCase() === pal.primary.toLowerCase() &&
              colors.accent.toLowerCase() === pal.accent.toLowerCase();
            return (
              <button
                key={pal.id}
                type="button"
                onClick={() => handleApplyPalette(pal)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#6D5CE8] bg-[#6D5CE8]/5 font-bold text-[#18181B]'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex items-center -space-x-1 shrink-0">
                    <span
                      className="w-4 h-4 rounded-full border border-white"
                      style={{ backgroundColor: pal.primary }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-white"
                      style={{ backgroundColor: pal.accent }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-white"
                      style={{ backgroundColor: pal.heading }}
                    />
                  </div>
                  <span className="text-xs truncate">{pal.name}</span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[#6D5CE8] shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Primary / Accent / Heading Color Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <label className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2 cursor-pointer">
            <div>
              <span className="block text-[11px] font-bold text-[#18181B]">
                Primary Colour
              </span>
              <span className="font-mono text-xs text-slate-500 uppercase">
                {colors.primary}
              </span>
            </div>
            <input
              type="color"
              value={colors.primary}
              onChange={(e) =>
                handleUpdateColorChannel('primary', e.target.value)
              }
              className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
            />
          </label>

          <label className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2 cursor-pointer">
            <div>
              <span className="block text-[11px] font-bold text-[#18181B]">
                Accent Colour
              </span>
              <span className="font-mono text-xs text-slate-500 uppercase">
                {colors.accent}
              </span>
            </div>
            <input
              type="color"
              value={colors.accent}
              onChange={(e) =>
                handleUpdateColorChannel('accent', e.target.value)
              }
              className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
            />
          </label>

          <label className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2 cursor-pointer">
            <div>
              <span className="block text-[11px] font-bold text-[#18181B]">
                Heading Colour
              </span>
              <span className="font-mono text-xs text-slate-500 uppercase">
                {colors.heading}
              </span>
            </div>
            <input
              type="color"
              value={colors.heading}
              onChange={(e) =>
                handleUpdateColorChannel('heading', e.target.value)
              }
              className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
            />
          </label>
        </div>
      </div>

      {/* 3. Typography & Page Spacing Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="font-display text-sm font-bold text-[#18181B] flex items-center gap-2">
            <Type className="w-4 h-4 text-[#6D5CE8]" />
            <span>Resume Typography</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {FONT_OPTIONS.map((f) => {
              const isSelected = activeFont === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() =>
                    onChangeResume({
                      ...resume,
                      updatedAt: new Date().toISOString(),
                      fontFamily: f.id,
                    })
                  }
                  style={{ fontFamily: f.cssFamily }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#6D5CE8] bg-[#6D5CE8]/10 text-[#6D5CE8] font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-[#18181B]'
                  }`}
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
              onChangeResume({
                ...resume,
                updatedAt: new Date().toISOString(),
                decorativeHeading: !decorativeHeading,
              })
            }
            className={`w-full min-h-[40px] px-3 py-2 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
              decorativeHeading
                ? 'border-[#6D5CE8] bg-[#6D5CE8]/10 text-[#18181B]'
                : 'border-slate-200 text-slate-600 hover:text-[#18181B]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#6D5CE8] shrink-0" />
              <span className="text-xs font-semibold">
                Calligraphy Candidate Heading
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

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-display text-sm font-bold text-[#18181B] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#18B89A]" />
              <span>A4 Page Spacing & Density</span>
            </h3>
            <p className="text-xs text-slate-500">
              Adjust vertical rhythm to fit extensive career histories onto a single A4 page or expand whitespace.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() =>
                onChangeResume({
                  ...resume,
                  updatedAt: new Date().toISOString(),
                  compactMode: false,
                })
              }
              className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                !resume.compactMode
                  ? 'border-[#6D5CE8] bg-[#6D5CE8]/10 text-[#6D5CE8]'
                  : 'border-slate-200 text-slate-600 hover:text-[#18181B]'
              }`}
            >
              Standard Comfort
            </button>
            <button
              type="button"
              onClick={() =>
                onChangeResume({
                  ...resume,
                  updatedAt: new Date().toISOString(),
                  compactMode: true,
                })
              }
              className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                resume.compactMode
                  ? 'border-[#6D5CE8] bg-[#6D5CE8]/10 text-[#6D5CE8]'
                  : 'border-slate-200 text-slate-600 hover:text-[#18181B]'
              }`}
            >
              Compact 1-Page Fit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
