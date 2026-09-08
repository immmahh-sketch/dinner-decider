// Type surface for the plain-ESM recipe template module (shared with the
// Node generator). Only what the app actually calls is declared.

export interface BuiltRecipe {
  blurb: string;
  ingredients: string[];
  method: string[];
  servings: number;
}

export function buildRecipe(input: {
  tech: string;
  sauce: string;
  protein: string;
  carb: string;
  veg?: (string | number)[];
  servings?: number;
}): BuiltRecipe | null;

export const CARB_LINE: Record<string, string>;
export const CARB_SHORT: Record<string, string>;
export const VEG: string[];
export const PROTEINS: Record<string, { word: string; key: string; diet: string[]; qty: string }>;
export const SAUCES: Record<string, { word: string; cuisine: string; spicy: number; ing: string[]; tags: string[] }>;
export const TECHNIQUES: Record<
  string,
  {
    word: string;
    mins: number;
    effort: string;
    onePan: boolean;
    richness: string;
    format: string;
    mood: string[];
    method: (p: string, s: string, c: string, v: string) => string[];
  }
>;
