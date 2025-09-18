# Card App (React + TypeScript + Vite)

Interactive flip-card app for memorizing foreign language vocabulary.

## Quick start

```bash
npm install
npm run dev
```

Open the app at the URL printed by Vite (usually `http://localhost:5173`).

## Scripts

- `npm run dev`: Start local dev server with HMR
- `npm run build`: Production build
- `npm run preview`: Preview the production build
- `npm run lint`: ESLint over the codebase

## Project structure

```
src/
  App.tsx                    # App root (renders a single Card)
  index.css                  # Global reset + CSS variables
  components/
    Card/
      Card.tsx               # Interactive flip card
      Card.css               # 3D flip + layout styles (rem-based)
    utils/
      decorateHint.tsx       # Hint highlighter (bolds matched terms)
  lib/
    data/cardsList.json      # Source data for cards
```

## Data model

`src/lib/data/cardsList.json` contains an array of cards with the following relevant fields used by the UI:

- `front`: the learning word/phrase (can include articles like "the" or infinitive "to ...")
- `back`: the translation/native-language word/phrase
- `hint`: example or context sentence
- `svg.url`: optional illustration URL rendered above the word

The component currently cycles through the list in order.

## Card behavior

- The card shows the front side first: image → word (`front`) → hint.
- First click (or Enter/Space) flips the card to show the back (translation).
- Second click advances to the next card and briefly hides back text for 0.5s to avoid visual flashing.
- Keyboard accessibility: the card is focusable and toggles on Enter/Space.

## Hint highlighting (decorateHint)

`decorateHint(front, hint)` returns React nodes where matched fragments are wrapped in `<b>`:

- Matches the full front phrase if it appears in the hint (multi‑word supported, e.g. "she savored").
- Matches the word even if the front is prefixed with `the` or `to` (e.g. front: "the acumen" → highlights "acumen").
- Matches inflections/containments (e.g. front: "drain" → highlights in "drained").
- If a verb is preceded by `to` in the hint (e.g. "to commence"), `to ` is bolded together with the word when appropriate.
- If immediately followed by a parenthetical POS (e.g. ` (noun),`), the parenthetical is bolded as part of the highlight.

Implementation lives in `src/components/utils/decorateHint.tsx`. It tokenizes the hint into word/non-word segments to preserve original spacing and punctuation, then reconstructs with bolded matches.

## Styling

- Global reset and theming variables defined in `:root` (`src/index.css`).
- Rem-based sizing (1rem = 16px) across the Card stylesheet.
- Colors and font sizes reference CSS variables; easy to theme/tune in one place.
- Preferred font stack begins with "Helvetica Neue", then system fallbacks.

Key variables in `src/index.css`:

- `--color-bg`, `--color-text`, `--color-border`, `--color-shadow`, `--color-hint`
- `--font-size-card-back`, `--font-size-card-word`, `--font-size-card-hint`

## Accessibility

- Card root has `role="button"`, `tabIndex=0`, and `aria-pressed` to reflect flip state.
- Enter/Space keyboard support mirrors click interactions.
- Images include `alt` tied to the front word; a placeholder renders if no image is available.

## Conventions

- TypeScript strict mode is enabled; avoid `any`.
- Keep UI state minimal and derived where possible (`useMemo` for data normalization, `useState` for index/flip state).
- Avoid inline styles in components; use CSS variables and classes. Bolded highlights rely on semantic `<b>` tags.

## Testing (future work)

- Unit tests for `decorateHint` cases (multi-word, prefixes, inflections, POS parentheticals).
- Interaction tests for flip and advance behavior (including 0.5s back-text hide).

## Roadmap ideas

- Persist progress and shuffle by spaced-repetition logic.
- Add controls for previous/next, and a progress indicator (e.g., 3/20).
- Theme switch (light/dark) by extending CSS variables.
- Offline caching of card images.
