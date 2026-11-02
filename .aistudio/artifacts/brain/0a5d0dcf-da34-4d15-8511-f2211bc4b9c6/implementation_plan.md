# VitaeFlow CV Studio Upgrade — Implementation Plan

## 1. Overview & Goals
Upgrade the VitaeFlow Resume Builder into a modern, customizable CV Studio while preserving all existing AI tools, saved `localStorage` resumes, routes, and data structures:

1. **Profile Photo Upload & Framing Studio**:
   - Optional profile photo upload (`dataURL` persisted in `personalInfo`) inside the Personal Info editor section.
   - Instant framing controls: **Circular**, **Rounded-Square**, or **Hidden** toggle, plus **Zoom (`1x–2.5x`)** and **Horizontal/Vertical Position (`X/Y`)** sliders.
2. **Typography & Decorative Heading System**:
   - Load `Lato`, `Inter`, `Roboto`, `Playfair Display`, and `Cormorant Garamond` / `Great Vibes` via `next/font/google`.
   - Allow users to choose clean body/heading font pairings (`Inter`, `Lato`, `Roboto`, `Playfair Display`) and an optional **Calligraphy / Editorial Signature Heading** toggle that styles candidate name/section flourishes while keeping body text 100% readable and ATS-clear.
3. **Six Visually & Structurally Distinct A4 Templates**:
   - **Modern (`modern-violet`)**: Minimalist layout with top accent bar, left vertical accent pills on section headers, and 3-column competency grid.
   - **Executive (`executive-minimal`)**: Authoritative corporate design with centered header, double-rule dividers, and refined serif/display hierarchy.
   - **Split Column (`teal-split`)**: Asymmetric two-column layout with a full-height tinted sidebar for contact, skills, education, certifications, and languages.
   - **Creative (`creative-studio`)**: Bold tinted header banner with integrated avatar frame, visual skill pills/bars, timeline-accented experience blocks, and modern badge cards.
   - **Professional (`professional-ats`)**: Traditional high-density ATS-first layout with classic full-width solid bottom rules, compact left/right date alignment, and inline semicolon/dot skill groupings.
   - **Elegant (`elegant-editorial`)**: Sophisticated editorial layout with centered diamond/ornamental section dividers, refined typography, and balanced whitespace.
4. **Multi-Color Palettes & Custom Color Pickers**:
   - Curated professional color palettes (Royal Violet, Emerald Teal, Executive Charcoal, Sapphire Navy, Burgundy Wine, Forest Slate) plus individual custom color pickers for **Primary**, **Accent**, and **Heading** colors.
   - Accessible **both** inside the Resume Builder live preview toolbar and on the dedicated `/templates` page, updating the live A4 preview and PDF export immediately.
5. **Navigation Redesign & Internal Footer Removal**:
   - Replace the fixed bottom navigation (`MobileNav`) with a **collapsible left sidebar on desktop** and a **slide-out drawer on mobile**.
   - Add a **visible Back button** (`router.back()` with smart fallback to `/dashboard` or `/`) in the top workspace bar of every internal page (`/dashboard`, `/resume-builder`, `/ats-checker`, `/job-matcher`, `/templates`, `/settings`).
   - Render the large promotional `Footer` **only on the Home/Landing page (`/`)**, keeping all internal workspace pages clean and distraction-free.
6. **A4 Formatting, Multi-Page Indicators & 1:1 PDF Export**:
   - Enhance A4 sheet spacing, visual page-break guides, responsive mobile scaling, and `jsPDF` vector export so all 6 templates, custom colors (primary, accent, heading), and profile photos export cleanly.

---

## 2. Planned File Changes

### A. Data Model & State (`lib/types.ts`, `lib/sample-data.ts`, `context/ResumeContext.tsx`)
- Extend `TemplateId` to support all 6 templates while keeping backward compatibility with existing saved resumes:
  `'modern-violet' | 'executive-minimal' | 'teal-split' | 'creative-studio' | 'professional-ats' | 'elegant-editorial'`
- Add typography & color customization types to `ResumeDraft`:
  - `fontFamily?: 'inter' | 'lato' | 'roboto' | 'playfair'`
  - `decorativeHeading?: boolean`
  - `customColors?: { primary: string; accent: string; heading: string; paletteId?: string }`
- Extend `PersonalInfo` with optional photo fields:
  - `photoUrl?: string`
  - `photoShape?: 'circle' | 'square' | 'hidden'`
  - `photoZoom?: number`
  - `photoOffsetX?: number`
  - `photoOffsetY?: number`
- Normalize loaded drafts in `ResumeContext.tsx` so previously saved resumes automatically receive sensible defaults.

### B. Typography & Layout Shell (`app/layout.tsx`, `components/Header.tsx`, `components/CollapsibleSidebar.tsx`, `components/Footer.tsx`)
- Load Google Fonts (`Lato`, `Inter`, `Roboto`, `Playfair_Display`, `Great_Vibes`) in `app/layout.tsx` and expose CSS font variables.
- Create `components/CollapsibleSidebar.tsx` providing:
  - Desktop collapsible left navigation rail (expanded width `248px`, collapsed icon rail `68px`) on internal workspace routes.
  - Mobile slide-out navigation drawer triggered from the header.
- Update `components/Header.tsx` to include:
  - Mobile drawer trigger button on non-landing pages.
  - Visible **Back** button with navigation history on all internal routes (`/dashboard`, `/resume-builder`, `/ats-checker`, `/job-matcher`, `/templates`, `/settings`).
- Update `components/Footer.tsx` to return `null` on internal routes (`pathname !== '/'`) and remove `MobileNav` from `app/layout.tsx`.

### C. Profile Photo Upload & Framing Controls (`components/ResumeEditor.tsx`)
- In the **Personal Info** editor tab, add a dedicated **Profile Photo (Optional)** studio block:
  - Upload image file (client-side canvas resize/compression to clean dataURL for fast `localStorage` persistence) or remove photo.
  - Shape selector: **Circular**, **Rounded Square**, or **Hidden**.
  - Sliders for **Zoom (`100%–220%`)**, **Horizontal Pan (`-50%` to `+50%`)**, and **Vertical Pan (`-50%` to `+50%`)**.

### D. Six Distinct Templates, Font & Color Customizer (`components/ResumePreview.tsx`, `components/TemplateSelector.tsx`, `app/templates/page.tsx`, `lib/pdf-export.ts`)
- Upgrade `ResumePreview.tsx`:
  - Top studio toolbar with quick template switcher (all 6 templates), expandable **Colors & Fonts** popover/panel (curated palettes + Primary / Accent / Heading color pickers + Font family selector + Decorative Calligraphy Heading toggle), zoom controls, and A4 page-break guide indicator.
  - Render all 6 distinct template architectures with dynamic CSS variables for `--resume-primary`, `--resume-accent`, `--resume-heading`, body font, heading font, and framed profile photo.
- Upgrade `TemplateSelector.tsx` and `app/templates/page.tsx` with interactive wireframe previews for all 6 templates, full color palette & custom hex/picker controls, and typography pairing selectors.
- Upgrade `lib/pdf-export.ts` to support all 6 template layouts, custom Primary/Accent/Heading colors, font mappings, and embedded profile photo rendering (circular or rounded-square clipped image) in `jsPDF`.

---

## 3. Verification Plan
- Run `compile_applet` to verify TypeScript types and Next.js production build succeed with zero errors.
- Verify existing `localStorage` drafts load without issues and all 6 templates, photo controls, fonts, custom colors, back button, and collapsible sidebar work across desktop and mobile viewports.
