// ─── GermanLink Business – eBay Import Types ─────────────────────────────────

export type SupportedLang = "de" | "fr" | "ln";

export interface TranslationEntry {
  title: string;
  description: string;
}

export interface ImportedProduct {
  source: "ebay";
  source_url: string;
  base_price: number;
  glb_price: number;
  currency: string;
  category: string;
  images: string[];
  translations: Record<SupportedLang, TranslationEntry>;
}

export type ImportStatus =
  | "idle"
  | "fetching"
  | "translating"
  | "done"
  | "error";

export interface ImportState {
  status: ImportStatus;
  product: ImportedProduct | null;
  error: string | null;
  progress: number; // 0–100
}
