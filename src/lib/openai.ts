import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export const initializeOpenAI = (apiKey: string) => {
  if (!apiKey) {
    openaiClient = null;
    return;
  }

  openaiClient = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
};

export const chatWithProduct = async (
  productName: string,
  productDescription: string,
  chatHistory: Array<{ role: string; content: string }>,
  userQuestion: string
): Promise<string> => {
  if (!openaiClient) {
    throw new Error('OpenAI API key not configured. Please set it in admin settings.');
  }

  const systemPrompt = `Tu es un assistant virtuel pour une plateforme d'export de produits d'occasion d'Europe vers le Congo-Brazzaville.

Tu aides les clients à obtenir des informations sur les produits. Réponds en français de manière concise et professionnelle.

Produit: ${productName}
Description: ${productDescription}

Règles:
- Réponds uniquement aux questions sur ce produit spécifique
- Si tu ne sais pas, dis-le honnêtement
- Mentionne que c'est un produit d'occasion européen de qualité
- Les envois se font 1x par mois vers Brazzaville
- Sois amical et professionnel`;

  try {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userQuestion },
    ];

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer une réponse.';
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    throw new Error(error.message || 'Erreur lors de la communication avec l\'API');
  }
};
