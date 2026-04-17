const lingalaDictionary: Record<string, string> = {
  'verkaufen': 'koteka',
  'kaufen': 'kosomba',
  'neu': 'ya sika',
  'gebraucht': 'esalelami',
  'preis': 'ntalo',
  'lieferung': 'kotinda',
  'qualität': 'bolamu',
  'professional': 'ya mosala',
  'profi': 'ya mosala',
  'maschine': 'masini',
  'traktor': 'traktɛrɛ',
  'motor': 'motɛrɛ',
  'elektronik': 'biloko ya motindo',
  'möbel': 'bamesa',
  'haus': 'ndako',
  'auto': 'motuka',
  'gut': 'malamu',
  'sehr gut': 'malamu mingi',
  'zustand': 'ezaleli',
  'jahre': 'bambula',
  'modell': 'modɛlɛ',
  'marke': 'marka',
  'farbe': 'langi',
  'robust': 'makasi',
  'premium': 'ya kitoko',
  'diesel': 'gazoile',
  'benzin': 'esanzi',
  'vendre': 'koteka',
  'acheter': 'kosomba',
  'neuf': 'ya sika',
  'occasion': 'esalelami',
  'prix': 'ntalo',
  'livraison': 'kotinda',
  'qualité': 'bolamu',
  'professionnel': 'ya mosala',
  'machine': 'masini',
  'tracteur': 'traktɛrɛ',
  'moteur': 'motɛrɛ',
  'voiture': 'motuka',
  'maison': 'ndako',
  'bon': 'malamu',
  'très bon': 'malamu mingi',
  'état': 'ezaleli',
  'ans': 'bambula',
  'modèle': 'modɛlɛ',
  'marque': 'marka',
  'couleur': 'langi',
  'vente': 'koteka',
  'robuste': 'makasi',
  'avec': 'na',
  'prise de force': 'makasi ya kotinda',
  'puissant': 'makasi',
  'excellent': 'malamu mpenza',
  'mini': 'moke',
  'petit': 'moke',
  'grand': 'monene',
  'utilisé': 'esalelami',
  'garantie': 'garantie'
};

export const translateToLingala = (frenchText: string): string => {
  if (!frenchText) return '';

  let result = frenchText;

  Object.entries(lingalaDictionary).forEach(([source, lingala]) => {
    const regex = new RegExp(`\\b${source}\\b`, 'gi');
    result = result.replace(regex, lingala);
  });

  return result;
};

export const categoryToLingala: Record<string, string> = {
  'Elektronik': 'Biloko ya motindo',
  'BA-ÉLECTRONIQUE': 'Biloko ya motindo',
  'Électronique': 'Biloko ya motindo',
  'Auto & Moto': 'Mituka & Moto',
  'MITUKA & MOTO': 'Mituka & Moto',
  'Haus': 'Ndako',
  'NDAKO': 'Ndako',
  'Maison': 'Ndako',
  'Kleidung': 'Bilamba',
  'BILAMBA': 'Bilamba',
  'Vêtements': 'Bilamba',
  'Möbel': 'Bamesa',
  'BAMESA': 'Bamesa',
  'Meubles': 'Bamesa',
  'Sonstiges': 'Mosusu',
  'MOSUSU': 'Mosusu',
  'Autres': 'Mosusu',
  'electronics': 'Biloko ya motindo',
  'auto_motor': 'Mituka & Moto',
  'household': 'Ndako',
  'clothing': 'Bilamba',
  'furniture': 'Bamesa',
  'other': 'Mosusu'
};

export const getCategoryLingala = (category: string): string => {
  if (!category) return '';
  return categoryToLingala[category] || categoryToLingala[category.toUpperCase()] || category;
};
