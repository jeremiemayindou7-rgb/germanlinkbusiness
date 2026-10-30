export interface SunshareProduct {
  title: string;
  title_de: string;
  title_fr: string;
  title_ln: string;
  description: string;
  description_de: string;
  description_fr: string;
  description_ln: string;
  price_eur: number;
  glb_price_eur: number;
  images: string[];
  url: string;
  wattage?: string;
  category: string;
  source_type: 'sunshare';
}

export type ImportStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ImportState {
  status: ImportStatus;
  product: SunshareProduct | null;
  error: string | null;
}
