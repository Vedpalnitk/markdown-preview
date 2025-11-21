# Agents Guide

GlassNote is a personal Markdown previewer meant to run on the web and package cleanly into an iOS container. Keep the glassy reading experience intact while reusing the existing components instead of inventing new primitives.

## Architecture Snapshot

- **UI stack:** Vite + React 19, Tailwind (CDN + typography plugin), glass gradient backgrounds defined in `App.tsx` and `index.html`.
- **Markdown rendering:** `components/MarkdownView.tsx` with `react-markdown`, `remark-gfm`, `remark-math`, `rehype-katex`, and Prism themes (`oneDark`/`oneLight`).
- **Controls:** `components/GlassDock.tsx` for creation/import/export/theme/view toggles; `components/NoteList.tsx` for grouped note navigation.
- **State + storage:** In-memory React state mirrored to `localStorage` via `services/storageService.ts` (key `glassnote_notes`); note IDs generated with `crypto.randomUUID`.
- **AI & export:** `services/geminiService.ts` (Gemini 2.5 Flash) for polish/summarize helpers and html2pdf.js (loaded in `index.html`) for PDF generation from `#pdf-content`.
- **Entry points:** `index.tsx` mounts `App.tsx`; typography and scroll styling live in `index.html`.

## Agent Profiles

### 1) Glass UI & Interaction Agent

Mission: Preserve the glass/conic-gradient look and responsive feel for both desktop web and wrapped iOS webviews.

- Backgrounds come from the `bgGradient` logic in `App.tsx`; color tweaks should stay within the existing conic gradients.
- Typography and scroll styling are defined in `index.html` (Inter + custom scrollbars). Do not swap fonts without adding them there.
- `GlassDock` owns global actions—extend it instead of adding floating buttons elsewhere. Keep the collapsed/expanded motion intact.
- `NoteList` slides in from the left; maintain the mobile overlay guard (`isListOpen` overlay in `App.tsx`) so touch interactions stay predictable on iOS.
- Respect the `Theme` enum; any new theme-aware styling must branch on `Theme.LIGHT`/`Theme.DARK` to keep PDF export predictable.

### 2) Notes & Data Agent (Local-First Steward)

Mission: Keep note storage simple, fast, and local-first while remaining safe in mobile webviews.

- All persistence flows through `services/storageService.ts`; update helpers there rather than writing to `localStorage` directly.
- The storage key is `glassnote_notes`; preserve schema `{ id, title, content, group, updatedAt }`.
- `createNewNote` seeds default content; adjust it there if onboarding text changes.
- Handle import/export state resets carefully: file input is controlled via `fileInputRef`; always clear the input value after reads to allow successive imports.
- Guard against unavailable `localStorage` if you introduce SSR or hybrid shells; initialization currently occurs inside `useEffect` to avoid server access.

### 3) Markdown Rendering Agent

Mission: Keep preview fidelity high and readable, including math, tables, and code, in both themes and in exported PDFs.

- `MarkdownView` owns all markdown rendering and code highlighting; extend component overrides there (tables, inline code, block code) instead of inline styling elsewhere.
- Keep `prose` class composition and `prose-invert` toggling aligned with `Theme`.
- For new markdown features, add `remark`/`rehype` plugins inside `MarkdownView` and ensure they are export-safe (work inside `#pdf-content`).
- PDF export relies on `id="markdown-content-area"` and `id="pdf-content"` to scope content; do not rename without updating `handleExportPdf`.

### 4) AI & Export Agent

Mission: Keep polish/export flows non-blocking and offline-friendly.

- `services/geminiService.ts` is stubbed for offline use; it should never block rendering or require env keys. If you reintroduce remote AI, keep the same graceful fallback behavior.
- `handleAiPolish` in `App.tsx` toggles `isAiLoading` and flips to Preview; keep UI responsive and error-safe.
- PDF export uses html2pdf with enforced A4 sizing and black-on-white overrides. Any layout changes inside `#pdf-content` must preserve page-break guards for prose, code, tables, and KaTeX blocks.

### 5) Ops & Packaging Agent

Mission: Keep the project easy to run locally and friendly to iOS/web packaging.

- Local commands: `npm install`, `npm run dev`, `npm run build`, `npm run preview`. Vite handles bundling; no server-side rendering.
- External assets (Tailwind CDN, KaTeX, html2pdf, import maps) are loaded in `index.html`. If you add new CDNs, mirror them in `vite.config.ts` if bundling breaks.
- For iOS shells (Capacitor/WebView/PWA), ensure `localStorage` permissions, file import via `<input type="file">`, and PDF downloads continue to work; avoid window globals beyond `html2pdf` to stay WebView-safe.
- When adjusting environment variables for AI, document the required key in README and keep it in `.env.*` templates.

## Collaboration & Guardrails

- Theme immutability: do not replace the glass/conic gradient background or override the blur/shadow language used in `App.tsx` and `GlassDock`.
- Single source of truth: all note mutations flow through `storageService`; all markdown rendering through `MarkdownView`; AI calls through `geminiService`.
- Export safety: changes that affect `#pdf-content` or `#markdown-content-area` must preserve print readability and page-break rules.
- Mobile parity: any new UI must be touch-friendly and respect the `isListOpen` overlay behavior; avoid hover-only affordances.
- Definition of done: update this guide if agent responsibilities shift, keep README/run steps accurate, and verify dark/light themes plus PDF export after UI changes.

## Quick Reference Commands

```bash
npm install
npm run dev       # Vite dev server
npm run build
npm run preview
```

Keep this guide close to the code so every agent knows the glass-first boundaries for web and iOS. 
