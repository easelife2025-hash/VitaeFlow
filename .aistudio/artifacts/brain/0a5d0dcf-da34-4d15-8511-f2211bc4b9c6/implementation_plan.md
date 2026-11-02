# Whole-Resume AI Context & Deep Rewriting Upgrade

This update upgrades every AI assistant in VitaeFlow so that AI analyzes your **entire resume context** at every step, substantially restructures bullet points and sentences (never repeating your original phrasing verbatim), and introduces a one-click **AI Polish Whole Resume** co-pilot to align your summary, experience bullets, and skills together.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product and UX decisions incorporate your confirmed preferences before implementation:

- **Confirmed Decision 1 — Keep Existing Section Tab Order with Whole-Resume AI Context**: We will preserve the familiar 8-tab layout (`Personal` → `Summary` → `Experience` → `Education` → `Skills` → `Projects` → `Certifications` → `Languages`), while automatically passing your **complete resume state** (all roles, companies, bullets, projects, education, skills, summary, and target job description) to every AI button regardless of which tab you are currently editing.
- **Confirmed Decision 2 — Full-Resume AI Polish Button & Co-Pilot Modal**: In addition to upgrading individual AI buttons, we will add an **AI Polish Whole Resume** button in the studio toolbar and editor header. It analyzes your entire resume at once and lets you review and apply coordinated improvements across your Summary, Experience Bullets, and Skills in one place.
- **Confirmed Decision 3 — Substantial Structural & Vocabulary Rewriting (Fact-True)**: Both the live Gemini prompts and the instant local fallback engine will deeply restructure sentence syntax, clause order (e.g., outcome-first vs. methodology-first vs. concise ATS), and executive vocabulary so every suggestion is visibly distinct from your original draft while keeping your real facts and numbers 100% intact.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Deep Structural Rewriting**: Eliminates near-duplicate AI outputs where suggestions looked identical to the input or only prepended a single word. Every generated variation now restructures phrasing, clause hierarchy, and vocabulary across 3 distinct angles (*Outcome-First Executive*, *Cross-Functional & Technical Execution*, and *High-Density Concise ATS*).
  2. **Whole-Resume Context Awareness**: Whenever you click **Rewrite**, **Polish**, **Generate Summary**, or **Suggest Skills**, the AI reads your entire resume—so a bullet rewrite in Experience knows your tech stack from Skills and your seniority from your headline, and your Summary reflects your latest bullets and projects.
  3. **One-Click "AI Polish Whole Resume" Co-Pilot**: A dedicated whole-resume optimizer that scans all sections together, rewrites your summary, upgrades experience/project bullets side-by-side, and suggests missing skills evidenced by your work history.
- **Target Audience / Persona**: Job seekers and professionals who want their rough or standard resume drafts transformed into executive-grade, ATS-aligned resume language that reads cohesively from top to bottom.
- **Key Value**: Delivers a clear, unmistakable upgrade between "Before" and "After" wording while maintaining strict truthfulness to the user's career history.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Substantial Bullet & Wording Rewriter Flow**:
     - Clicking **Rewrite** or **Polish** on any bullet or summary opens the AI modal with a **"Context Analyzed"** indicator showing that your target role, skills, and experience history are active context.
     - Displays 3 genuinely distinct variations:
       - *Outcome-First Impact*: Flips or restructures the sentence to spotlight measurable results, business value, or delivery impact.
       - *Executive & Domain Authority*: Elevates action verbs, technical/leadership vocabulary, and cross-functional framing using context from your resume.
       - *Concise ATS High-Density*: Strips filler words and passive clauses into a tight, high-signal ATS statement.
     - Each card displays a clear transformation note explaining how the structure and vocabulary were upgraded compared to the original text.
  2. **Whole-Resume AI Polish Flow**:
     - Clicking **AI Polish Whole Resume** in the studio toolbar opens a structured review modal.
     - Shows a **Holistic Summary Upgrade** (Before vs. After), **Experience & Project Bullet Upgrades** (Before vs. After cards with individual toggles), and **Evidenced Skill Additions** (skills mentioned in your experience/projects that are missing from your Skills list).
     - Users can toggle individual improvements or click **Apply Selected Improvements** to update the entire resume in one click.
- **Visual Identity & Theme**:
  - Preserves VitaeFlow's studio palette: crisp alabaster canvas (`#F8FAFC`), pure white structural surfaces (`#FFFFFF`), Royal Violet primary actions (`#6D5CE8`), and Emerald Teal verification accents (`#18B89A`).
  - Clean side-by-side or stacked `Original` vs. `AI Restructured` comparison blocks using subtle hairline borders (`border-slate-200`) and tabular numerals (`tabular-nums`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Clause-Reordering & Vocabulary Transformation in Both Gemini and Fallback Engines**:
  - *Chosen Approach*: Upgrade the server-side Gemini schema/prompts to enforce <40% verbatim phrase overlap with the original draft while preserving all factual entities and numbers, AND upgrade the deterministic fallback rewriter to parse action clauses + impact/metric clauses (`driving...`, `reducing...`, `increasing...`, `to ship...`, `by X%`) and genuinely invert/restructure them into 3 distinct professional sentences.
  - *Why*: Previously, when a request fell back or when the model was overly conservative, Variation 1 returned the original sentence unchanged and Variation 2 simply prepended `"Orchestrated and "`. Restructuring the clauses guarantees a dramatic, high-value improvement every single time.
- **Decision 2 — Full-Resume Context Payload on Every AI Endpoint**:
  - *Chosen Approach*: Extend the context provider and editor handlers so `AiBulletModal`, `generate-summary`, `suggest-skills`, and the new `polish-resume` endpoint all receive a compact snapshot of the active `ResumeDraft`.
  - *Why*: Allows the AI to connect the dots across sections regardless of the order in which the user fills out the tabs.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        ResumeContext (Active ResumeDraft)                  │
│   Personal · Summary · Experience · Education · Skills · Projects · JD     │
└───────────────┬────────────────────────────────────────┬───────────────────┘
                │ Full Resume Context Snapshot           │
                ▼                                        ▼
┌───────────────────────────────────────┐  ┌─────────────────────────────────┐
│     Individual Section AI Actions     │  │   AI Polish Whole Resume Modal  │
│  • AiBulletModal (Rewrite / Polish)   │  │  • Holistic Summary Upgrade     │
│  • Summary Generator (ResumeEditor)   │  │  • All Experience Bullet Diffs  │
│  • Skill Suggester (ResumeEditor)     │  │  • Missing Evidenced Skills     │
└───────────────┬───────────────────────┘  └──────────────┬──────────────────┘
                │                                         │
                ▼                                         ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                   Server-Side AI Proxy Routes (/api/ai/*)                  │
│  • /api/ai/enhance-bullet   (Full-resume context + deep clause rewrite)    │
│  • /api/ai/generate-summary (Cross-section synthesis + JD alignment)       │
│  • /api/ai/suggest-skills   (Extracts implied skills from roles/projects)  │
│  • /api/ai/polish-resume    (Holistic whole-resume optimization pass)      │
└───────────────┬─────────────────────────────────────────┬──────────────────┘
                │                                         │
                ▼                                         ▼
┌───────────────────────────────────────┐  ┌─────────────────────────────────┐
│   Low-Latency Gemini Fallback Chain   │  │  Deep Structural Fact-Safe      │
│   (gemini-flash-latest / 3.8-flash)   │  │  Clause Rewriter Engine         │
└───────────────────────────────────────┘  └─────────────────────────────────┘
```

- **Data Model & State**:
  - **Whole-Resume Context Snapshot**: Passed automatically from `ResumeContext` to `AiBulletModal` and all `/api/ai/*` routes (`targetRole`, `summary`, `skills`, `experience`, `projects`, `education`, `certifications`, and `jobDescriptionDraft`).
  - **Whole-Resume Polish Result (`WholeResumePolishResult`)**: Contains `improvedSummary`, `summaryReasoning`, `bulletUpgrades` (array of `{ section: 'experience' | 'projects', itemId, bulletIndex, roleOrName, original, improved, changeSummary }`), and `recommendedSkills` (array of `{ skill, reason }`).
- **Interactive Component & State Mapping**:
  - **AI Bullet & Wording Modal**: Displays active resume context summary, lets users switch between *Action & Outcome*, *Polished Wording*, *Ownership Focus*, and *Concise ATS*, and shows how each variation restructured the original sentence.
  - **AI Polish Whole Resume Modal**: Triggered from the studio toolbar or editor AI strip; supports checking/unchecking individual bullet rewrites, summary replacement, and skill additions before committing changes to `activeResume` with a single click.
