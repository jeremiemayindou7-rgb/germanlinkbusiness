import type { Language } from '../contexts/LanguageContext';

export interface Product {
  id: string;
  name: string;
  name_de?: string;
  name_fr?: string;
  name_ln?: string;
  description: string;
  description_de?: string;
  description_fr?: string;
  description_ln?: string;
  category: string;
  category_de?: string;
  category_fr?: string;
  category_ln?: string;
  sale_price: number;
  [key: string]: any;
}

export const getProductField = (
  product: Product,
  field: 'name' | 'description' | 'category',
  lang: Language
): string => {
  const translated = product[`${field}_${lang}` as keyof Product] as string | undefined;
  const german = product[`${field}_de` as keyof Product] as string | undefined || product[field];
  const original = product[field];

  return translated || german || original || '';
};

export const autoTranslateProduct = async (
  product: Product,
  targetLang: 'fr' | 'ln'
): Promise<{ name: string; description: string; category: string }> => {
  const sourceLang = 'de';

  const translateText = async (text: string): Promise<string> => {
    try {
      const apiLang = targetLang === 'ln' ? 'fr' : targetLang;

      const res = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: apiLang,
          format: 'text'
        })
      });

      if (!res.ok) throw new Error('Translation API failed');
      const data = await res.json();
      return data.translatedText || text;

    } catch (err) {
      console.warn('[Translation] Failed, using original:', err);
      return text;
    }
  };

  const [name, description, category] = await Promise.all([
    translateText(product.name_de || product.name),
    translateText(product.description_de || product.description),
    translateText(product.category_de || product.category)
  ]);

  return { name, description, category };
};

export const categoryTranslations: Record<string, Record<Language, string>> = {
  'ELECTRONICS': {
    de: 'Elektronik',
    fr: 'Électronique',
    ln: 'Ba-électronique'
  },
  'BA-ÉLECTRONIQUE': {
    de: 'Elektronik',
    fr: 'Électronique',
    ln: 'Ba-électronique'
  },
  'AUTO': {
    de: 'Auto & Motorrad',
    fr: 'Auto & Moto',
    ln: 'Mituka & Moto'
  },
  'AUTO & MOTOR': {
    de: 'Auto & Motorrad',
    fr: 'Auto & Moto',
    ln: 'Mituka & Moto'
  },
  'MITUKA & MOTO': {
    de: 'Auto & Motorrad',
    fr: 'Auto & Moto',
    ln: 'Mituka & Moto'
  },
  'HOUSEHOLD': {
    de: 'Haushalt',
    fr: 'Maison',
    ln: 'Ndako'
  },
  'NDAKO': {
    de: 'Haushalt',
    fr: 'Maison',
    ln: 'Ndako'
  },
  'CLOTHING': {
    de: 'Kleidung',
    fr: 'Vêtements',
    ln: 'Bilamba'
  },
  'BILAMBA': {
    de: 'Kleidung',
    fr: 'Vêtements',
    ln: 'Bilamba'
  },
  'FURNITURE': {
    de: 'Möbel',
    fr: 'Meubles',
    ln: 'Bamesa'
  },
  'BAMESA': {
    de: 'Möbel',
    fr: 'Meubles',
    ln: 'Bamesa'
  },
  'OTHER': {
    de: 'Sonstiges',
    fr: 'Autres',
    ln: 'Mosusu'
  },
  'MOSUSU': {
    de: 'Sonstiges',
    fr: 'Autres',
    ln: 'Mosusu'
  }
};

export const getCategoryTranslation = (category: string | undefined, lang: Language): string => {
  if (!category) return '';

  const upperCategory = category.toUpperCase();
  const translation = categoryTranslations[upperCategory];

  if (translation) {
    return translation[lang];
  }

  return category;
};
