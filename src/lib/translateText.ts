export const translateText = async (
  text: string,
  from: string,
  to: string
): Promise<string> => {
  if (!text || text.trim() === '') return '';
  if (from === to) return text;

  try {
    console.log(`[Translation] Translating ${from}→${to}:`, text.substring(0, 50));

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}&de=info@germanlink.de`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`MyMemory API error: ${res.status}`);
    }

    const data = await res.json();
    console.log('[Translation] Response:', data);

    if (data.responseStatus !== 200) {
      throw new Error(`Translation failed: ${data.responseDetails}`);
    }

    const translated = data.responseData?.translatedText;

    if (!translated || translated === text) {
      throw new Error('Translation returned same text — likely failed');
    }

    console.log(`[Translation] ✅ Success ${from}→${to}:`, translated.substring(0, 50));
    return translated;

  } catch (err) {
    console.error(`[Translation] ❌ Failed ${from}→${to}:`, err);
    throw err;
  }
};

export const translateLongText = async (
  text: string,
  from: string,
  to: string
): Promise<string> => {
  if (!text || text.trim() === '') return '';

  const MAX_CHARS = 450;

  if (text.length <= MAX_CHARS) {
    return translateText(text, from, to);
  }

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > MAX_CHARS) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());

  console.log(`[Translation] Long text split into ${chunks.length} chunks`);

  const translated = await Promise.all(
    chunks.map(chunk => translateText(chunk, from, to))
  );

  return translated.join(' ');
};
