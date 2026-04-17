export type SupportedLanguage = 'de' | 'fr' | 'en' | 'ln';

export const detectLanguage = (text: string): SupportedLanguage => {
  const t = text.toLowerCase().trim();

  const lingalaWords = [
    'mbote', 'malamu', 'nalingi', 'nzoto', 'biso', 'mokolo',
    'ndeko', 'moto', 'eloko', 'ozali', 'nini', 'wapi', 'liwa',
    'lokola', 'sango', 'lotomo', 'koloba', 'kozwa', 'kopesa',
    'mingi', 'mpe', 'te', 'oyo', 'yo', 'ngai', 'bango',
    'motema', 'bilanga', 'mosala', 'liboso', 'nsima', 'boyei',
    'nakoki', 'lelo', 'luka', 'biloko', 'makambo', 'kokabola',
    'kofuta', 'ntalo', 'nini', 'moyens', 'kosolola'
  ];

  const frenchWords = [
    'bonjour', 'bonsoir', 'merci', 'oui', 'non', 'comment',
    'avez', 'vous', 'avoir', 'est', 'pour', 'avec', 'dans',
    'votre', 'notre', 'nous', 'les', 'des', 'une', 'que',
    'produit', 'livraison', 'prix', 'commander', 'salut',
    'suis', 'puis', 'bien', 'tout', 'sur', 'par', 'jai',
    'cherche', 'veux', 'aide', 'peut', 'quelles', 'sont'
  ];

  const germanWords = [
    'hallo', 'guten', 'tag', 'morgen', 'abend', 'danke',
    'bitte', 'haben', 'sie', 'produkt', 'preis', 'lieferung',
    'bestellen', 'zahlung', 'versand', 'ja', 'nein', 'ich',
    'ist', 'das', 'die', 'der', 'und', 'für', 'mit', 'nicht',
    'können', 'möchte', 'suche', 'gibt', 'wie', 'was', 'wo',
    'welche', 'gibt', 'funktioniert'
  ];

  const scores = { ln: 0, fr: 0, de: 0, en: 0 };
  const words = t.split(/\s+/);

  words.forEach(word => {
    const clean = word.replace(/[^a-zàâäéèêëîïôùûüç]/gi, '');
    if (lingalaWords.includes(clean)) scores.ln += 3;
    if (frenchWords.includes(clean)) scores.fr += 2;
    if (germanWords.includes(clean)) scores.de += 2;
  });

  const maxScore = Math.max(scores.ln, scores.fr, scores.de, scores.en);

  if (maxScore === 0) return 'fr';
  if (scores.ln === maxScore) return 'ln';
  if (scores.fr === maxScore) return 'fr';
  if (scores.de === maxScore) return 'de';
  return 'en';
};
