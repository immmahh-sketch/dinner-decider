# Growing the dish dataset

The app ships with ~400 dishes. The engine and UI do **not** change as you add
more — only the JSON files grow.

## Where the data lives

- `src/data/home/<cuisine>.json` — cuisine ∈ italian, indian, east-asian, mexican,
  british, american, med, middle-eastern, french, other
- `src/data/takeaway/<type>.json` — type ∈ pizza, indian, chinese, burger, chippy,
  kebab, thai, sushi, mexican, fried-chicken
- `src/data/restaurant/<type>.json` — type ∈ italian, indian, asian, grill,
  gastropub, mexican, med, seafood, french

To add a whole new file, drop the JSON in the folder **and** add one `import` +
one spread line in `src/data/dishes.ts`.

## Schema

Every dish needs the shared fields:

```jsonc
{
  "id": "home-it-spag-bol",        // unique, kebab-case, prefix by venue
  "name": "Spaghetti Bolognese",
  "blurb": "One sentence, shown on the card.",
  "venue": "home",                  // home | takeaway | restaurant
  "cuisine": "italian",             // see types.ts Cuisine
  "protein": "beef",                // chicken beef lamb pork fish seafood veggie vegan egg mixed none
  "carb": "pasta",                  // pasta rice noodles potato bread pastry grains salad none
  "spicy": 0,                       // 0 none · 1 mild · 2 kick · 3 hot
  "richness": "hearty",             // light | medium | hearty
  "mood": ["comfort"],              // any of: comfort light fresh indulgent healthy fancy
  "format": "plate",                // bowl plate handheld sharing soup salad
  "diet": []                        // any of: vegetarian vegan pescatarian gluten-free dairy-free
}
```

**Home** dishes also need:

```jsonc
"effort": "medium",       // quick (<=30 min) | medium | showoff
"timeMinutes": 45,
"onePan": false,
"servings": 4,
"ingredients": ["400g spaghetti", "500g beef mince", "..."],
"method": ["Step one.", "Step two.", "..."]
```

**Takeaway** dishes also need: `"takeawayType": "pizza"`, `"searchTerm": "margherita pizza"`.

**Restaurant** dishes also need: `"restaurantType": "italian"`, `"priceTier": 2` (1 casual · 2 nice · 3 special), `"searchTerm": "..."`.

## Rules of thumb for good tags

- `diet`: a vegan dish should list **both** `"vegan"` and `"vegetarian"`. A fish dish
  that is otherwise dairy-free lists `"pescatarian"` + `"dairy-free"`.
- `mood`: 1–2 entries. `comfort`/`indulgent` vs `light`/`fresh`/`healthy` is what the
  mood question keys off.
- `spicy`: be honest — the spice question splits at ≤1, 1–2, ≥2.
- Keep `blurb` to one line; keep `method` steps short and instructional.

## Validate before committing

```bash
npm run data:check
```

It checks every enum, flags duplicate ids, missing ingredients/method on home
dishes, and missing `searchTerm` on eat-out dishes. Exit code is non-zero on any
error so it can gate CI.

## Reaching 1,000+

The fastest quality route is **variations of a real base recipe**: take an existing
home dish, copy it, swap the protein and the 2–3 ingredient lines that change, and
adjust the tags. E.g. "Chicken Katsu Curry" → "Pork Katsu", "Prawn Katsu",
"Halloumi Katsu" all share the real sauce method. Do this per cuisine and the home
count climbs quickly without inventing dubious methods.
