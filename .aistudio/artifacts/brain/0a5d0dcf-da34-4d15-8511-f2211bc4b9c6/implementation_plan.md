# Startup Brand Animation & Official Colors Plan (`PopularEmployersSection`)

## Goal
Transform the **Popular Employers Section** (`Google`, `Microsoft`, `Amazon`, `Meta`, `Apple` in `/components/PopularEmployersSection.tsx`) into a flagship startup-grade interactive showcase featuring always-on official brand colors, brand-tinted borders and ambient glows, spring-physics card animations, an auto-cycling spotlight with a live progress bar, and smooth benchmark card transitions.

---

## Key Visual & Motion Upgrades

### 1. Official Brand Colors & Always-On Brand Identity
Instead of monochrome gray logos that only darken on click, each employer card will permanently showcase its authentic brand palette, accompanied by a subtle brand-tinted border, surface tint, and ambient glow:
- **Google**: Official multi-color wordmark (`G` `#4285F4`, `o` `#EA4335`, `o` `#FBBC05`, `g` `#4285F4`, `l` `#34A853`, `e` `#EA4335`) with a `#4285F4` / `#34A853` brand-tinted border and soft blue ambient glow.
- **Microsoft**: 4-quadrant official color emblem (`#F25022` Red, `#7FBA00` Green, `#00A4EF` Blue, `#FFB900` Yellow) paired with crisp typography and a `#00A4EF` brand glow and border.
- **Amazon**: Bold lowercase `amazon` wordmark (`#111827`) with the signature `#FF9900` Amazon Orange smile indicator bar underneath and warm `#FF9900` border/glow accents.
- **Meta**: Official `#0081FB` Meta Blue infinity loop mark + wordmark with a vibrant `#0081FB` border and ambient radial glow.
- **Apple**: Sleek `#1D1D1F` Apple mark + wordmark accented with Cupertino `#0071E3` / `#1D1D1F` glass border and subtle spotlight sheen.

### 2. Startup-Grade Spring Animations (`motion/react`)
- **Shared `layoutId` Active Spotlight Ring**: A spring-animated highlight frame (`layoutId="employer-active-ring"`) glides smoothly across the 5 cards as the active company changes.
- **Auto-Cycling Spotlight with Pause-on-Hover**: Automatically cycles through Google, Microsoft, Amazon, Meta, and Apple every **4.2 seconds** so the section feels alive immediately on page load, pausing automatically whenever the user hovers or clicks inside the section.
- **Live Brand Progress Bar**: The active card displays a smooth animated progress bar along its bottom edge in the company's signature brand color.
- **Tactile Spring Hover & Tap Physics**: Each card responds with `whileHover={{ y: -5, scale: 1.02 }}` and `whileTap={{ scale: 0.98 }}` using crisp spring physics (`stiffness: 380, damping: 26`).

### 3. Animated Benchmark Preview Card (`AnimatePresence`)
- When switching between employers (either via auto-cycle or user click), the benchmark preview card below smoothly crossfades and slides (`AnimatePresence mode="wait"`) with:
  - A dynamic top accent border and ambient radial glow matching the selected company's official brand color.
  - Staggered spring entrance animations for the company's core competency chips (`Systems Scale`, `Cloud Architecture`, `Ownership & Metrics`, etc.).
  - A brand-accented **"Load [Company] Preset"** CTA button that takes the user directly into the Resume Builder with that company's benchmark pre-selected.

---

## Files to Modify
1. `/components/PopularEmployersSection.tsx` — Upgrade employer data with official brand color tokens, multi-color brand wordmarks/marks, `motion/react` spring cards, auto-cycling spotlight timer with pause-on-hover, `layoutId` active indicator, and `AnimatePresence` benchmark card transitions.
