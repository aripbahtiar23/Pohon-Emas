# Gold Story Generator — MVP Rebuild

Transform the existing app into a focused, mobile-first PWA that generates a 1080×1920 Instagram Story for daily gold prices in under 10 seconds.

## Scope

Rebuild the form, preview, and page shell to match the new spec exactly. Keep PNG export (html-to-image) and pagination logic (overflow handling via shrink, not multi-slide — spec says "keep content inside 1080x1920").

## File changes

### 1. `src/index.css` — Design tokens
- Replace palette with spec HSL values:
  - `--story-bg: #F7F3EE` (warm cream)
  - `--story-text: #3A2E2A`
  - `--story-gold: #A67C52`
  - `--story-divider: #E5DFD9`
  - `--story-up: #2E7D32`
  - `--story-down: #C62828`
- Swap font import: **Playfair Display** (serif) + **Inter** (sans). Drop Cormorant Garamond + Great Vibes.
- Update `.font-serif` → Playfair Display.
- Keep app-chrome tokens but align primary to gold accent.

### 2. `src/components/StoryPreview.tsx` — Full rewrite
- Canvas: 1080×1920, bg `#F7F3EE`, horizontal margin 96px, top/bottom safe area 140px, center-aligned single column.
- Vertical content order:
  1. Brand name (Playfair, 28px, uppercase, letter-spacing 0.25em)
  2. Sub brand (Inter, 14px, muted)
  3. Headline "Harga Emas Hari Ini" (Playfair, 56px)
  4. Date (Inter, 16px)
  5. Product name (Inter, 18px, uppercase, letter-spacing)
  6. **Movement price** — conditional: render only if `movementValue > 0`. Format `↑ Naik 25.000` (green) or `↓ Turun 15.000` (red). Inter 20px medium, 16px margin top/bottom. If absent, collapse spacing entirely.
  7. Price table — 2 cols: weight (left, e.g. "0.5 GRAM") / price (right, "IDR 1.125.000"). Row gap 20–24px, 1px divider `#E5DFD9`.
  8. CTA WhatsApp (Inter)
  9. Location
  10. Price note (14px)
  11. Disclaimer (14px, muted)
- Spacing system: only 8/16/24/32px gaps.
- Overflow: when rows > 9, scale down font (20→16px) and row spacing (24→14px) tiered by row count. No multi-slide pagination — keep one canvas.
- Currency formatter: `1125000 → IDR 1.125.000`.

### 3. `src/components/StoryForm.tsx` — Full rewrite with new sections
- **Section 1 — Quick Setup**: product input with datalist suggestions (Antam, UBS, Galeri24); date picker (default today).
- **Section 2 — Price Table** (core, advanced UX):
  - Each row: weight (number) + unit dropdown (gram/kg/oz, default gram) + price (number, formatted with thousand separators on display).
  - Drag handle (lucide `GripVertical`) — implement with `@dnd-kit/core` + `@dnd-kit/sortable` (already common; install if missing).
  - Quick-add chips: `+0.5`, `+1`, `+2`, `+5`, `+10` gram (each adds a new empty-priced row at that weight).
  - Add row, duplicate row, delete row (with undo via sonner toast action).
  - Press Enter on price field → add new empty row + autofocus.
  - Default rows: 0.5, 1, 2, 3, 5, 10 gram (empty prices).
- **Section 3 — Contact**: WhatsApp (required, validation highlight).
- **Section 4 — Brand Settings** (collapsible via shadcn `Collapsible`): brand, sub brand, location.
- **Section 5 — Optional Footer** (collapsible): price note (default "Harga dapat berubah sewaktu-waktu"), disclaimer.
- **Movement price input** lives in Section 1 area: amount (number) + direction toggle (naik/turun) — empty/0 ⇒ hidden in story.
- Validation: invalid fields get red ring, never block typing. Generate button disabled only when required (whatsapp + ≥1 row with weight & price) missing.
- **Auto-save** all form state to `localStorage` under key `gold-story:data` on every change; hydrate on mount.

### 4. `src/pages/Index.tsx` — Page shell + generate flow
- Two-panel layout: `lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]`. Mobile: form on top, preview below (matches spec "Mobile: input on top, preview below").
- **Generate Story** primary button → snapshots current form `data` into a separate `previewData` state. Preview renders from `previewData` only (initially `null` ⇒ placeholder "Klik Generate Story untuk pratinjau").
- Download PNG: uses hidden 1080×1920 export canvas bound to `previewData`.
- Reset Data: clears form + localStorage + previewData.
- Keep scrollable scaled preview frame.
- Add subtle drop-shadow to preview frame for realism.

### 5. PWA setup (manifest only — no service worker)
Per Lovable PWA guidance, do **not** add `vite-plugin-pwa` / service workers (breaks iframe preview). Make it installable via manifest only:
- `public/manifest.webmanifest` already exists — update with name "Gold Story Generator", short_name, theme_color `#A67C52`, background_color `#F7F3EE`, `display: standalone`, icons (reuse existing or a generated gold icon).
- Add `<link rel="manifest">`, theme-color meta, apple-touch-icon to `index.html`.
- Tell user that "installable" works in published build, not in editor preview.

### 6. Dependencies
- Add `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` for drag-reorder.

## Out of scope (per spec)
Login, multi-template, auto price calc, stock, invoice, multi-slide pagination.

## QA after build
- Visual check at mobile viewport (594px wide): form on top, preview below, no overflow.
- Generate flow: edit → preview unchanged until click → click → preview matches.
- Movement price hidden when empty/0; green/red when set.
- Overflow: add 12 rows → fonts shrink, content stays inside 1920px.
- Download produces single 1080×1920 PNG.
- localStorage round-trip: refresh page → form repopulated.
