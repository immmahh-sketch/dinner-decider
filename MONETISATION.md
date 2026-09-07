# Monetisation

Everything is scaffolded but nothing is wired to a live money/ads network yet.
Three revenue lines are planned:

| line | status | where |
| --- | --- | --- |
| Banner + interstitial ads | placeholder slot rendered | `src/components/AdBanner.tsx` |
| £2.99 "remove ads" one-time unlock | web-checkout + unlock code | `app/remove-ads.tsx` |
| Affiliate "order now" lead (Just Eat / Deliveroo / restaurant menu) | stub link | `src/lib/links.ts` → `orderNowUrl()` |

---

## 1. Ads (Google AdMob)

`AdBanner` currently renders a dashed placeholder and already respects the
`adsRemoved` pref. To go live:

```bash
npx expo install react-native-google-mobile-ads
```

`app.json` → add the config plugin and your real app IDs:

```json
[
  "react-native-google-mobile-ads",
  {
    "androidAppId": "ca-app-pub-XXXXXXXX~XXXXXXXX",
    "iosAppId": "ca-app-pub-XXXXXXXX~XXXXXXXX"
  }
]
```

Then in `AdBanner.tsx` replace the `<View>` with a real banner and keep the
`adsRemoved` guard:

```tsx
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const unitId = __DEV__ ? TestIds.BANNER : UNIT_IDS.banner; // put your real unit id in UNIT_IDS
return <BannerAd unitId={unitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />;
```

Google's test unit IDs are already in `UNIT_IDS` for development. An `EAS`
dev/production build is required — the native SDK does not run in Expo Go.

**Interstitial**: show one on the `results` screen roughly every 3rd decision.
`UNIT_IDS.interstitial` has the test id. Gate on `!adsRemoved`.

---

## 2. £2.99 "remove ads"

Apple StoreKit in-app purchases only work for apps distributed through the App
Store / TestFlight. A **Signulous-sideloaded build cannot use IAP**, so this is a
**web checkout + unlock code** instead:

1. Create a **Stripe Payment Link** or a **Gumroad** product for £2.99.
2. On payment success, email the buyer the unlock code (currently `DINNER2025`,
   set in `app/remove-ads.tsx` → `UNLOCK_CODE`). For anything beyond a hobby,
   generate per-purchase codes and verify them against a tiny serverless endpoint.
3. Point `CHECKOUT_URL` in `app/remove-ads.tsx` at the payment link.

`setAdsRemoved(true)` persists via AsyncStorage, so the unlock survives restarts
on that device.

---

## 3. Affiliate "order now" lead

`orderNowUrl(dish)` in `src/lib/links.ts` is a stub that currently returns a Google
search. The plan:

- Join the **Just Eat** / **Deliveroo** / **Uber Eats** affiliate or partner
  programme, get a tracking parameter.
- On the `results` screen for takeaway/restaurant dishes, add an **"Order now"**
  button next to "Find near me" that opens `orderNowUrl(dish)` with your tag.
- Longer term: resolve the dish + user location to a specific restaurant menu
  deep-link. That needs a places lookup (Google Places) and per-partner menu APIs.

Track taps (e.g. a `slot` param already threaded through `AdBanner`) so you can
see which dishes drive leads.
