import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  message: string;
  sessionId: string;
  questionCount: number;
  language?: 'DE' | 'FR' | 'LN';
}

interface KnowledgeMatch {
  content: string;
  language: 'DE' | 'FR' | 'LN';
  confidence: number;
}

const KNOWLEDGE_BASE = `
# GermanLink Business Knowledge Base

## FAQ - Frequently Asked Questions

### Q1: What is GermanLink Business?
**[DE]** GermanLink Business ist eine Plattform, die afrikanische Unternehmer mit authentischen deutschen Produkten verbindet. Wir liefern echte Made in Germany Waren direkt aus Deutschland in den Kongo und garantieren Qualität und Zuverlässigkeit für Ihr Geschäft.

**[FR]** GermanLink Business est une plateforme qui connecte les entrepreneurs africains avec des produits allemands authentiques. Nous livrons des produits originaux Made in Germany directement d'Allemagne au Congo, garantissant qualité et fiabilité pour votre business.

**[LN]** GermanLink Business ezali plateforme oyo ekokangisa ba entrepreneurs ya Afrique na biloko ya solo ya Allemagne. Tozali kokabola biloko ya original Made in Germany banda Allemagne kino na Congo, tozali kopesa garantie ya qualité mpe fiabilité pona business na yo.

---

### Q2: How do I place an order?
**[EN]** Browse our product catalog, add items to your cart, and proceed to checkout. You can pay securely using various payment methods. After confirmation, we'll process your order and arrange container shipping to Congo.

**[FR]** Parcourez notre catalogue de produits, ajoutez des articles à votre panier et procédez au paiement. Vous pouvez payer en toute sécurité avec différentes méthodes de paiement. Après confirmation, nous traiterons votre commande et organiserons l'expédition par conteneur au Congo.

**[LN]** Talá catalogue ya biloko na biso, bakisa biloko na panier na yo, mpe kende na paiement. Okoki kofuta na sécurité na ba méthodes ndenge na ndenge. Nsima ya confirmation, tokosala commande na yo mpe tokobongisa expédition ya container na Congo.

---

### Q3: What payment methods do you accept?
**[EN]** We accept bank transfers, credit cards (Visa, Mastercard), and secure online payment systems. All transactions are encrypted and protected for your safety.

**[FR]** Nous acceptons les virements bancaires, les cartes de crédit (Visa, Mastercard) et les systèmes de paiement en ligne sécurisés. Toutes les transactions sont cryptées et protégées pour votre sécurité.

**[LN]** Tondimaka ba virements bancaires, ba cartes de crédit (Visa, Mastercard), mpe ba systèmes ya kofuta na internet oyo ebatelami. Ba transactions nyonso ezali cryptées mpe ebatelami pona sécurité na yo.

---

### Q4: How long does shipping take?
**[EN]** Container shipping from Germany to Congo typically takes 4-8 weeks depending on the destination port and customs clearance. We provide tracking information and updates throughout the journey.

**[FR]** L'expédition par conteneur depuis l'Allemagne vers le Congo prend généralement 4 à 8 semaines selon le port de destination et le dédouanement. Nous fournissons des informations de suivi et des mises à jour tout au long du trajet.

**[LN]** Expédition ya container banda Allemagne kino na Congo eumaka ntango mingi 4 kino 8 ba semaines selon port ya destination mpe dédouanement. Tozali kopesa ba informations ya kolanda mpe ba mises à jour na mobembo mobimba.

---

### Q5: Are all products genuine Made in Germany?
**[EN]** Yes, 100%. All our products are sourced directly from verified German manufacturers and distributors. We guarantee authenticity and provide certificates of origin upon request.

**[FR]** Oui, à 100%. Tous nos produits proviennent directement de fabricants et distributeurs allemands vérifiés. Nous garantissons l'authenticité et fournissons des certificats d'origine sur demande.

**[LN]** Ee, 100%. Biloko nyonso ya biso euti directement na ba fabricants mpe ba distributeurs ya Allemagne oyo batalami. Tozali kopesa garantie ya authenticité mpe tokopesa ba certificats ya origine soki osengi.

---

### Q6: What is your return policy?
**[EN]** Due to the nature of container shipping, returns are limited. If you receive damaged or incorrect items, contact us within 7 days with photos. We'll arrange replacement or refund according to our terms.

**[FR]** En raison de la nature de l'expédition par conteneur, les retours sont limités. Si vous recevez des articles endommagés ou incorrects, contactez-nous dans les 7 jours avec des photos. Nous organiserons un remplacement ou un remboursement selon nos conditions.

**[LN]** Lokola expédition ya container ezali boye, ba retours ezali mingi te. Soki ozwi biloko oyo ebebi to biloko oyo ezali malamu te, benga biso na mikolo 7 na ba photos. Tokobongisa remplacement to remboursement selon ba conditions na biso.

---

### Q7: Do you offer bulk/wholesale pricing?
**[EN]** Yes! We specialize in bulk orders for businesses and entrepreneurs. Contact our sales team for volume discounts and custom container solutions. Minimum order quantities apply.

**[FR]** Oui! Nous nous spécialisons dans les commandes en gros pour les entreprises et les entrepreneurs. Contactez notre équipe commerciale pour des réductions sur volume et des solutions de conteneurs personnalisées. Des quantités minimales de commande s'appliquent.

**[LN]** Ee! Tozali na spécialisation ya ba commandes minene pona ba entreprises mpe ba entrepreneurs. Benga équipe na biso ya commerce pona ba réductions ya volume mpe ba solutions ya containers personnalisées. Ba quantités minimales ya commande esengeli.

---

### Q8: How can I track my order?
**[EN]** After your order is confirmed, you'll receive a tracking number via email. You can use this to monitor your shipment's progress from Germany to Congo. We also send regular status updates.

**[FR]** Après confirmation de votre commande, vous recevrez un numéro de suivi par email. Vous pouvez l'utiliser pour suivre la progression de votre expédition de l'Allemagne au Congo. Nous envoyons également des mises à jour régulières.

**[LN]** Nsima ya confirmation ya commande na yo, okozwa numéro ya kolanda na email. Okoki kosalela yango pona kolanda progression ya expédition na yo banda Allemagne kino na Congo. Tozali kotinda mpe ba mises à jour ya mbala na mbala.

---

### Q9: What products can I order?
**[EN]** We offer a wide range of German products: industrial equipment, construction materials, electronics, automotive parts, machinery, tools, medical equipment, and quality consumer goods. Browse our catalog or request specific items.

**[FR]** Nous proposons une large gamme de produits allemands: équipements industriels, matériaux de construction, électronique, pièces automobiles, machines, outils, équipements médicaux et biens de consommation de qualité. Parcourez notre catalogue ou demandez des articles spécifiques.

**[LN]** Tozali na gamme monene ya biloko ya Allemagne: ba équipements industriels, ba matériaux ya botongami, électronique, ba pièces ya mituka, ba machines, ba outils, ba équipements médicaux mpe biloko ya consommation ya qualité. Talá catalogue na biso to senga biloko spécifiques.

---

### Q10: Is my payment secure?
**[EN]** Absolutely. We use industry-standard encryption (SSL/TLS) and secure payment gateways. Your financial information is never stored on our servers. All transactions comply with international security standards.

**[FR]** Absolument. Nous utilisons un cryptage standard (SSL/TLS) et des passerelles de paiement sécurisées. Vos informations financières ne sont jamais stockées sur nos serveurs. Toutes les transactions respectent les normes de sécurité internationales.

**[LN]** Solo solo. Tozali kosalela cryptage standard (SSL/TLS) mpe ba passerelles ya paiement oyo ebatelami. Ba informations financières na yo ezali kobombama te na ba serveurs na biso. Ba transactions nyonso ezali kolanda ba normes ya sécurité internationales.

---

### Q11: Do you provide product warranties?
**[EN]** Yes. All products come with manufacturer warranties valid internationally. We provide warranty documentation and assist with claims if needed. Warranty periods vary by product type.

**[FR]** Oui. Tous les produits sont livrés avec des garanties fabricant valables internationalement. Nous fournissons la documentation de garantie et aidons avec les réclamations si nécessaire. Les périodes de garantie varient selon le type de produit.

**[LN]** Ee. Biloko nyonso ezali na ba garanties ya fabricant oyo ezali valable na mokili mobimba. Tozali kopesa documentation ya garantie mpe tozali kosunga na ba réclamations soki esengeli. Ba périodes ya garantie ekeseni selon type ya biloko.

---

### Q12: Can I request specific products not in the catalog?
**[EN]** Yes! We can source almost any German product for you. Submit a request with product details, and our team will provide a quote within 48 hours. Minimum order values may apply for custom requests.

**[FR]** Oui! Nous pouvons nous procurer presque tous les produits allemands pour vous. Soumettez une demande avec les détails du produit, et notre équipe fournira un devis dans les 48 heures. Des valeurs de commande minimales peuvent s'appliquer pour les demandes personnalisées.

**[LN]** Ee! Tokoki kozwa biloko nyonso ya Allemagne pona yo. Tinda demande na ba détails ya biloko, mpe équipe na biso ekopesa devis na ba heures 48. Ba valeurs minimales ya commande ekoki kozala pona ba demandes personnalisées.

---

### Q13: What are your business hours?
**[EN]** Our customer support is available Monday to Friday, 9:00 AM to 6:00 PM (Central European Time). For urgent inquiries, email us at support@germanlink.business or WhatsApp: +49-XXX-XXXXXXX.

**[FR]** Notre support client est disponible du lundi au vendredi, de 9h00 à 18h00 (heure d'Europe centrale). Pour les demandes urgentes, envoyez-nous un email à support@germanlink.business ou WhatsApp: +49-XXX-XXXXXXX.

**[LN]** Support na biso ya ba clients ezali disponible banda lundi kino vendredi, 9h00 kino 18h00 (heure ya Europe centrale). Pona ba demandes urgentes, tinda email na support@germanlink.business to WhatsApp: +49-XXX-XXXXXXX.

---

### Q14: Why choose German products?
**[EN]** German products are globally recognized for superior quality, durability, precision engineering, and reliability. They last longer, perform better, and provide excellent value for businesses seeking long-term success.

**[FR]** Les produits allemands sont mondialement reconnus pour leur qualité supérieure, leur durabilité, leur ingénierie de précision et leur fiabilité. Ils durent plus longtemps, fonctionnent mieux et offrent une excellente valeur pour les entreprises cherchant un succès à long terme.

**[LN]** Biloko ya Allemagne eyebani na mokili mobimba pona qualité supérieure, durabilité, ingénierie ya précision mpe fiabilité. Ekowumela ntango molayi, ezali kosala malamu mpe ezali kopesa valeur ya malamu pona ba entreprises oyo bazali koluka succès ya ntango molayi.

---

### Q15: How do customs and import taxes work?
**[EN]** Customs duties and import taxes vary by country and product type. These are the buyer's responsibility. We provide all necessary documentation (invoices, certificates of origin) to facilitate smooth customs clearance. Consult local customs authorities for exact rates.

**[FR]** Les droits de douane et taxes d'importation varient selon le pays et le type de produit. Ceux-ci sont à la charge de l'acheteur. Nous fournissons toute la documentation nécessaire (factures, certificats d'origine) pour faciliter le dédouanement. Consultez les autorités douanières locales pour les tarifs exacts.

**[LN]** Ba droits ya douane mpe ba taxes ya importation ekeseni selon mboka mpe type ya biloko. Yango ezali responsabilité ya mosombi. Tozali kopesa documentation nyonso oyo esengeli (ba factures, ba certificats ya origine) pona ko faciliter dédouanement. Tuna ba autorités douanières locales pona ba tarifs ya sikisiki.

---

### Q16: Contact Information
**[EN]**
- Email: support@germanlink.business
- WhatsApp: +49-XXX-XXXXXXX
- Address: GermanLink Business GmbH, Berlin, Germany
- Hours: Monday-Friday, 9:00-18:00 CET

**[FR]**
- Email: support@germanlink.business
- WhatsApp: +49-XXX-XXXXXXX
- Adresse: GermanLink Business GmbH, Berlin, Allemagne
- Horaires: Lundi-Vendredi, 9h00-18h00 CET

**[LN]**
- Email: support@germanlink.business
- WhatsApp: +49-XXX-XXXXXXX
- Adresse: GermanLink Business GmbH, Berlin, Allemagne
- Ba heures: Lundi-Vendredi, 9h00-18h00 CET
`;

function detectLanguage(text: string): 'DE' | 'FR' | 'LN' {
  const lowerText = text.toLowerCase();

  const lingalaWords = ['ezali', 'biloko', 'pona', 'na', 'mpe', 'tokoki', 'tozali', 'okoki', 'banda', 'kino', 'nyonso'];
  const frenchWords = ['comment', 'combien', 'puis-je', 'est-ce', 'sont', 'avez-vous', 'pouvez-vous', 'où', 'quand', 'pourquoi'];
  const germanWords = ['wie', 'was', 'können', 'haben', 'sind', 'wo', 'wann', 'warum', 'ist', 'welche'];

  let lingalaScore = 0;
  let frenchScore = 0;
  let germanScore = 0;

  lingalaWords.forEach(word => {
    if (lowerText.includes(word)) lingalaScore++;
  });

  frenchWords.forEach(word => {
    if (lowerText.includes(word)) frenchScore++;
  });

  germanWords.forEach(word => {
    if (lowerText.includes(word)) germanScore++;
  });

  if (lingalaScore > frenchScore && lingalaScore > germanScore) return 'LN';
  if (germanScore > frenchScore) return 'DE';
  return 'FR';
}

function searchKnowledge(query: string, language: 'DE' | 'FR' | 'LN'): KnowledgeMatch | null {
  const lowerQuery = query.toLowerCase();

  const keywords = lowerQuery.split(' ').filter(word => word.length > 3);

  const sections = KNOWLEDGE_BASE.split('---');

  let bestMatch: KnowledgeMatch | null = null;
  let bestScore = 0;

  for (const section of sections) {
    const langPattern = new RegExp(`\\*\\*\\[${language}\\]\\*\\*\\s*([^*]+)(?=\\*\\*\\[|$)`, 's');
    const match = section.match(langPattern);

    if (match) {
      const content = match[1].trim();
      let score = 0;

      keywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = section.match(regex);
        if (matches) {
          score += matches.length;
        }
      });

      if (score > bestScore && score > 0) {
        bestScore = score;
        bestMatch = {
          content,
          language,
          confidence: Math.min(score / keywords.length, 1.0)
        };
      }
    }
  }

  return bestMatch;
}

async function callOpenAI(userMessage: string, context: string | null, language: 'DE' | 'FR' | 'LN'): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const languageNames = {
    'DE': 'German',
    'FR': 'French',
    'LN': 'Lingala'
  };

  const systemPrompt = `You are a helpful customer support assistant for GermanLink Business, a platform that sells authentic German products to Congo.

CRITICAL RULES:
1. NEVER hallucinate or invent information
2. If you don't have certain information from the provided context, say "I'm not certain about that" and recommend contacting support
3. Keep responses concise (max 6-8 lines unless user asks for details)
4. Be friendly and professional
5. ALWAYS respond in ${languageNames[language]}
6. Do NOT invent prices, delivery times, addresses, or policies
7. If the context doesn't contain the answer, admit it honestly

${context ? `Use ONLY this verified information to answer:\n${context}` : 'No specific context provided. Be honest if you cannot answer with certainty.'}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI error:', error);
    throw error;
  }
}

function getSupportMessage(language: 'DE' | 'FR' | 'LN'): string {
  const messages = {
    'DE': '\n\nFür weitere Unterstützung kontaktieren Sie bitte unseren Support:\n📧 support@germanlink.business\n📱 WhatsApp: +49-XXX-XXXXXXX',
    'FR': '\n\nPour plus d\'assistance, veuillez contacter notre support:\n📧 support@germanlink.business\n📱 WhatsApp: +49-XXX-XXXXXXX',
    'LN': '\n\nPona lisalisi mosusu, benga support na biso:\n📧 support@germanlink.business\n📱 WhatsApp: +49-XXX-XXXXXXX'
  };
  return messages[language];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, sessionId, questionCount, language: userLanguage }: ChatRequest = await req.json();

    if (!message || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const language = userLanguage || detectLanguage(message);

    const knowledgeMatch = searchKnowledge(message, language);

    let response: string;

    if (knowledgeMatch && knowledgeMatch.confidence > 0.3) {
      response = await callOpenAI(message, knowledgeMatch.content, language);
    } else {
      response = await callOpenAI(message, null, language);
    }

    if (questionCount >= 4) {
      response += getSupportMessage(language);
    }

    return new Response(
      JSON.stringify({
        response,
        language,
        questionCount: questionCount + 1,
        usedKnowledge: knowledgeMatch !== null
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
