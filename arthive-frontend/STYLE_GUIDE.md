# ARTHIVE Frontend Style Guide

This document captures the visual design tokens used across the ARTHIVE frontend. Reference this when styling new components so the app stays visually consistent.

## Theme

The app uses a dark theme with violet brand accents and orange star ratings. There is **no `tailwind.config.ts`** — we're on Tailwind v4 defaults and use arbitrary-value classes (e.g. `bg-[#1a1a24]`) for custom hex colors. Global background and base text color are set on `body` in `src/index.css` via `@layer base`.

## Color tokens

### Surfaces & text

| Role | Hex / value | Notes |
|---|---|---|
| Page background | `linear-gradient(180deg, #0a090c 0%, #050407 100%)` | Applied on `body` in `src/index.css`. `background-attachment: fixed` so it doesn't scroll. **Always darker than card surface.** |
| Card surface (boxes) | `#171519` | `bg-[#171519]` — used for nav, article, action card, reviews card, list cards, modals |
| Input / inner surface | `#0a090c` | `bg-[#0a090c]` — for text inputs, textareas, number inputs (matches the lighter end of the bg gradient) |
| Card border | white at 5% alpha | `border border-white/5` |
| Subtle divider / input border | white at 10% alpha | `border-white/10` |
| Primary text | white | `text-white` |
| Secondary text | gray-400 | `text-gray-400` |
| Tertiary / placeholder text | gray-500 | `text-gray-500` / `placeholder-gray-500` |
| Section-header label text | gray-400, `text-xs font-semibold uppercase tracking-wider` | For "SUMMARY", "DETAILS", "IN LISTS" subheads inside cards |

### Brand accent (violet)

| Role | Tailwind utility |
|---|---|
| ARTHIVE logo | `text-violet-500` |
| Active nav indicator (left border) | `border-l-2 border-violet-500` |
| Outline button (e.g. Community pill) | `border border-violet-500 text-violet-400 hover:bg-violet-500/10` |
| Filled button (e.g. Post review) | `bg-violet-500 hover:bg-violet-400 text-white` |
| Soft button (e.g. sidebar Search) | `bg-violet-500/20 text-violet-300 hover:bg-violet-500/30` |
| Link / load-more text | `text-violet-400 hover:text-violet-300` |

### Star ratings

| Role | Hex |
|---|---|
| Filled star | `#f59e0b` (amber) — inline `style={{ color: "#f59e0b" }}` |
| Empty star | `#3a3a4a` (dark gray, subtle on dark bg) — inline `style={{ color: "#3a3a4a" }}` |

### Content-type accent colors

Used for media-specific UI (buttons, tabs, cover-image borders) so a media item's type is recognizable at a glance. Reference helper: `src/lib/contentTypeColors.ts` exports `CONTENT_TYPE_COLORS` and `contentTypeColor(type)`.

| Content type (`media.contentType` value) | Color | Hex |
|---|---|---|
| `film` | Orange | `#EF8019` |
| `series` | Pink | `#FB44EF` |
| `book` | Light blue | `#3FE2FB` |
| `game` | Green | `#1DD07D` |
| _unknown / null fallback_ | Dark gray | `#3a3a4a` |

Apply via inline style (Tailwind v4 arbitrary classes can't be dynamically composed safely):

```tsx
import { contentTypeColor } from "../lib/contentTypeColors"

const color = contentTypeColor(media.contentType)
<img style={{ border: `4px solid ${color}`, boxShadow: `0 0 24px ${color}33` }} />
```

## Selection-state buttons

Toggle buttons that drive a persistent on/off state (e.g. `ifFinished`, `ifFavorite`) should make the "on" state visually loud — not just a label change. Pattern used in `UserMediaReview`:

- **Off state**: `border-transparent text-gray-300 hover:text-white hover:bg-white/5` plus an outlined icon (e.g. `EyeOffIcon`, hollow `HeartIcon`).
- **On state**: filled color background at low alpha + matching colored border + colored text + subtle outer glow via `shadow-[0_0_18px_-4px_rgba(...,.35)]` + slight scale (`scale-[1.02]`) + filled icon variant. Wrapped in `transition-all duration-300` so the change animates.
- Reserve **emerald** for "completed / watched" toggles and **pink** for "favorite / like" toggles. Use static class strings (no template-literal Tailwind classes) so the JIT keeps them in the build.

Example shape (from `SelectionButton` helper in `UserMediaReview.tsx`):

```tsx
className={
    "group w-full py-3 px-4 text-sm rounded-lg border transition-all duration-300 flex items-center justify-center gap-2 " +
    (active
        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_18px_-4px_rgba(16,185,129,0.35)] scale-[1.02]"
        : "border-transparent text-gray-300 hover:text-white hover:bg-white/5")
}
```

Pair the label change with an icon swap (filled vs. outlined SVG) so the state is unambiguous when read at a glance.

## Animations

A few small keyframes live in `src/index.css` for reuse across modals:

| Class | What it does |
|---|---|
| `.arthive-fade-in` | Fades the element in over 180ms, and triggers a 200ms scale-in on its **direct children** via `> *` selector. Apply to a modal overlay (the `fixed inset-0` div); the inner panel animates automatically. |

Use this on **every modal overlay** so dialogs feel snappy and consistent — see `WriteReviewModal`, `DeleteReviewPopup`, and the Add-to-Lists overlay in `MediaInfoPage` for the canonical usage.

For inline interactive elements (stars, icon buttons), prefer Tailwind's `transition-all duration-200/300 ease-out` plus `hover:scale-110`/`scale-[1.02]` over keyframe animations. Add a glow with `filter: drop-shadow(...)` when an element becomes active.

## Star rating (`StarRatingMedia`)

- Half-star precision via two transparent click zones per star.
- Hover state previews the rating with `hoverRating` state — clears on `onMouseLeave` of the row.
- A 350ms `pulseStar` state scales the clicked star to `scale-125` then back.
- Active stars get an amber drop-shadow glow via inline `filter`.
- The fill overlay animates width changes with `transition: width 200ms ease-out` so half-step selections slide smoothly.

## Shape & spacing

| Role | Utility |
|---|---|
| Card radius | `rounded-2xl` |
| Pill / chip radius | `rounded-full` |
| Image / button radius | `rounded-lg` |
| Standard card padding | `p-6` |
| Page outer max width | `max-w-6xl` |
| Section gap | `gap-6` |

## Typography

Body uses the system font stack (set in `index.css`). Headings:

| Role | Utility |
|---|---|
| Page title (media title) | `text-3xl font-bold` |
| Section / card title | `text-xl font-semibold` |
| ARTHIVE banner | `text-3xl font-bold uppercase tracking-wide` |
| Metadata labels | `text-sm text-gray-400` |
| Body text | `text-gray-300 leading-relaxed` |

## Layout patterns

### App shell (`src/lib/ExplorePageNavBar.tsx`)

```
┌─────────────────────────────────────────────────────────┐
│ ARTHIVE banner                                          │
├──────────┬──────────────────────────────────────────────┤
│ profile  │                                              │
│ sidebar  │  <Outlet/>  (page content, max-w-6xl)        │
│ nav      │                                              │
│ search   │                                              │
├──────────┴──────────────────────────────────────────────┤
│ About · Community Policy · Press Kit · Contact          │
└─────────────────────────────────────────────────────────┘
```

Sidebar nav items render as full-width buttons with a 2px left border. Active route → `border-violet-500 bg-white/5 text-white`; inactive → `border-transparent text-gray-400 hover:text-white hover:bg-white/5`.

### MediaInfoPage 2×2 grid (`src/pages/MediaInfoPage.tsx`)

```
┌────────────────┬──────────────────────────────┐
│ Cover image    │  MediaInfoArticle            │
│ (w-72, type-   │  (title/year/creator/        │
│  colored 4px   │   summary/details/lists/     │
│  border)       │   community pill)            │
├────────────────┼──────────────────────────────┤
│ UserMediaReview│  MediaReviews                │
│ (actions card) │  (search + ReviewCard list)  │
└────────────────┴──────────────────────────────┘
```

Implemented as `grid grid-cols-[20rem_1fr] gap-6 items-start`.

## Component conventions

- All cards: `bg-[#171519] rounded-2xl border border-white/5 p-6` (use `p-8` for the main article card).
- Inputs: `bg-[#0a090c] border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50`. Use `rounded-lg` for textareas.
- Hover state on subtle buttons: `hover:bg-white/5 hover:text-white transition`.
- Modal overlay: `fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4` wrapping a `bg-[#171519] rounded-2xl border border-white/5 p-6 max-w-lg w-full` panel. Click-outside-to-close: attach `onClick={() => close()}` to the outer overlay and `onClick={(e) => e.stopPropagation()}` on the inner panel.
- Confirmation modals (destructive): use red filled button `bg-red-500/90 hover:bg-red-500 text-white` for the destructive action and a subtle ghost button for cancel.
- Dividers between list items (e.g. reviews): `border-b border-white/5 pb-4` rather than horizontal rules or `===` strings.
- Status chips (private/public, type tags): `text-xs px-2 py-0.5 rounded-full border` plus the relevant accent color at low alpha for fill (e.g. `bg-amber-500/10 border-amber-500/40 text-amber-300`).

## Files of interest

- `src/index.css` — global body background + base layer.
- `src/lib/contentTypeColors.ts` — content-type color helper.
- `src/lib/ExplorePageNavBar.tsx` — app shell (sidebar + banner + footer).
- `src/pages/MediaInfoPage.tsx` — canonical example of the 2×2 grid layout.
- `src/lib/MediaInfoArticle.tsx` — info card pattern (info-only, no cover). Uses section subheads + 2-col details grid for visual spread.
- `src/lib/UserMediaReview.tsx` — vertical actions card with star rating, selection-state buttons (eye / heart), and the `WriteReviewModal` centered review composer.
- `src/lib/StarRatingMedia.tsx` — half-star interactive rating with hover preview, click pulse, and animated fill.
- `src/pages/MediaReviewsPage.tsx` — searchable list card pattern.
- `src/lib/ReviewCard.tsx` — review row pattern (avatar + username + stars + content + counters).
- `src/lib/AddMediaToList.tsx` + `src/pages/AllUserListsPage.tsx` — list-picker pattern (ContentFilter pills, search, paginated list cards with type/tag chips).
- `src/lib/ContentFilter.tsx` — content-type filter pills, colored using `CONTENT_TYPE_COLORS`.
- `src/lib/NumberedPagination.tsx` — compact dark pagination control.
- `src/lib/DeleteReviewPopup.tsx` — destructive confirmation modal pattern (click-outside dismisses).

## Adding new content types

If a new content-type enum value is added on the backend:

1. Update the type union in `src/types/media_type.ts` and `src/types/review_type.ts`.
2. Add the new key + hex to `CONTENT_TYPE_COLORS` in `src/lib/contentTypeColors.ts`.
3. Update this style guide's content-type table.
