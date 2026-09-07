# Dinner Decider 🍽️

A fun "what should I have for dinner?" app. Spin the wheel, answer a short branching
quiz, and the list of every dinner it knows gets narrowed — Guess Who style — until
you have a shortlist of 10 or fewer to pick from.

- **Cook at home** → full ingredients list (with *add to shopping list*) and method.
- **Takeaway** → opens a Google Maps "near me" search for that dish.
- **Restaurant** → opens a Google Maps "near me" search for places that serve it.

Built with **Expo SDK 57 / React Native 0.86 / Expo Router**.

---

## Run it

```bash
npm install
npx expo start
```

Press `i` for the iOS simulator, or scan the QR with **Expo Go** (the ad placeholder
and web-checkout links work; native ad SDKs do not run in Expo Go).

Useful scripts:

| command | what it does |
| --- | --- |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run data:check` | validates every dish JSON file against the schema |
| `npx expo export --platform ios --no-bytecode` | full Metro bundle smoke test |

---

## Project layout

```
app/                     expo-router screens
  index.tsx              welcome — fortune wheel + "Dinner Decider" reveal
  how-it-works.tsx       4-step explainer + "Don't show again" toggle
  question.tsx           the branching quiz (one screen, driven by the store)
  peek.tsx               "N ideas left — view now or keep going?" interstitial
  results.tsx            the shortlist (≤10, tappable)
  dish/[id].tsx          cook-at-home detail: ingredients + method + add-to-list
  shopping-list.tsx      the shopping list menu
  remove-ads.tsx         £2.99 remove-ads + settings

src/
  engine/
    types.ts             the Dish data model + tag vocabulary
    questions.ts          the decision tree (questions, options, keep() predicates)
    filter.ts             the Guess Who elimination engine
  data/
    home/*.json           ~150 cook-at-home recipes (ingredients + method), by cuisine
    takeaway/*.json        ~136 takeaway dishes, by takeaway type
    restaurant/*.json      ~110 restaurant dishes, by venue type
    dishes.ts              merges every JSON file into one deck
  store/
    decider.ts            in-memory quiz state (zustand)
    prefs.ts              persisted: "don't show again", "ads removed"
    shoppingList.ts       persisted shopping list
  components/             Wheel, DishCard, Button, AdBanner, TopBar
  lib/links.ts            Google Maps / web-search / (future) affiliate links
scripts/validate-data.mjs  the data linter
.eas/build/unsigned-ipa.yml custom build workflow for a Signulous-ready .ipa
```

## How the elimination works

Every dish is a card. `poolFor(allDishes, answeredSteps)` folds each answered
option's `keep(dish)` predicate over the deck. After each question we check the
count: **≤ 10 → show the shortlist**, otherwise show the peek screen and continue.

If an answer would empty the pool, that answer is **kept on record but ignored**
so the user never hits a dead end (the peek screen tells them).

See [DATA.md](./DATA.md) to grow the dataset and [MONETISATION.md](./MONETISATION.md)
to switch on real ads and the paid unlock.

## Building the sideload IPA

See [BUILDING.md](./BUILDING.md) for the full EAS + Signulous walkthrough.
