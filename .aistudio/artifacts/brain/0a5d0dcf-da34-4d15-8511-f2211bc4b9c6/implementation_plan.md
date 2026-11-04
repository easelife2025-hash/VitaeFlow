# Startup Brand Marquee Ticker Plan (`PopularEmployersSection`)

## Goal
Transform the **Popular Employers Section** (`/components/PopularEmployersSection.tsx`) into a sleek, authentic startup-style **infinite scrolling marquee ticker** showcasing only the official colored brand logos and wordmarks for **Google**, **Microsoft**, **Amazon**, **Meta**, and **Apple** inside glowing brand-tinted cards—with the benchmark box and role subtitles completely removed.

---

## Key Changes

### 1. Remove Benchmark Box & Role Subtitle Clutter
- Completely remove the bottom **Benchmark Role / Core Competencies / Compare My Resume in Job Matcher** container.
- Remove the role subtitle text (`Senior Frontend Software`, `Principal Product &`, etc.) from inside the brand cards so each card cleanly showcases only the company's official colored logo and wordmark.

### 2. Smooth Infinite Scrolling Startup Marquee (`motion/react`)
- Implement a seamless, continuous horizontal marquee loop (`x: ['0%', '-50%']` with linear infinite animation) that glides smoothly across both mobile and desktop screens without ever freezing on mobile touch scroll.
- Add soft left and right edge gradient fade masks (`from-white via-white/80 to-transparent`) so brand cards emerge and dissolve smoothly at the viewport edges like flagship SaaS landing pages.

### 3. Official Brand Colors, Tinted Borders & Ambient Glows
Each marquee card will permanently display its authentic brand palette, matching border, and subtle brand glow:
- **Google**: Official multi-color wordmark (`G` `#4285F4`, `o` `#EA4335`, `o` `#FBBC05`, `g` `#4285F4`, `l` `#34A853`, `e` `#EA4335`) with a 4-color top accent strip, `#4285F4`/35 border, and soft blue/green glow.
- **Microsoft**: 4-quadrant official color emblem (`#F25022` Red, `#7FBA00` Green, `#00A4EF` Blue, `#FFB900` Yellow) + crisp `#0078D4` / `#262626` wordmark, `#00A4EF`/35 border, and cyan/blue glow.
- **Amazon**: Bold lowercase `amazon` wordmark (`#232F3E`) with the signature `#FF9900` orange curved smile bar underneath, `#FF9900`/40 border, and warm amber glow.
- **Meta**: Vibrant `#0081FB` infinity emblem + `#0668E1` wordmark with `#0081FB`/35 border and Meta blue glow.
- **Apple**: Sleek `#1D1D1F` & `#0071E3` Cupertino emblem + wordmark with `#0071E3`/35 border and subtle blue/slate glow.

---

## Files to Modify
1. `/components/PopularEmployersSection.tsx` — Replace the static grid and benchmark box with the continuous infinite-scrolling brand marquee ticker featuring clean official colored brand logos and wordmarks.
