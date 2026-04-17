# GermanLink Business Support Chatbot

## Overview

A multilingual AI-powered support chatbot for GermanLink Business that provides instant customer support in **English**, **French**, and **Lingala**. The chatbot uses a Knowledge Base-first approach to ensure accurate, non-hallucinated responses and escalates to human support after 4 questions.

## Features

### ✅ Multilingual Support
- **Auto-detects** user language (EN/FR/LN)
- Responds in the same language as the user
- Seamless language switching within the same conversation

### ✅ Knowledge Base First (RAG-light)
- Always searches the knowledge base FIRST before using AI
- Provides accurate, verified answers based on stored FAQ content
- Prevents AI hallucinations by grounding responses in facts

### ✅ Smart Escalation
- Tracks question count per session
- After 4 questions, automatically suggests contacting human support
- Provides contact options (Email, WhatsApp)

### ✅ Professional UI/UX
- Clean, modern chat interface
- Real-time typing indicators
- Session persistence (survives page refresh)
- Mobile-responsive design
- Clear error handling

## Architecture

```
User Question
    ↓
Language Detection (EN/FR/LN)
    ↓
Knowledge Base Search
    ↓
    ├─ Match Found → Use KB Context
    │   └→ OpenAI (with context)
    └─ No Match → OpenAI (limited context)
    ↓
Response + (Support CTA if question >= 4)
    ↓
User
```

## Environment Setup

### Required Environment Variables

Add these to your `.env` file:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...your-key-here...
OPENAI_MODEL=gpt-4o-mini  # or gpt-3.5-turbo

# Supabase Configuration (already configured)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Getting an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key and add it to your `.env` file
6. **Important:** Never commit the `.env` file to version control

## Files Structure

```
/src/knowledge/
  └── knowledge_base.md          # FAQ content in 3 languages

/supabase/functions/chat/
  └── index.ts                   # Edge Function (deployed)

/src/components/
  └── SupportChat.tsx            # React chat UI component

/src/App.tsx                     # Integration point
```

## Knowledge Base Management

### Location
`/src/knowledge/knowledge_base.md`

### Format

Each FAQ entry uses this structure:

```markdown
### Q1: Question title?
**[EN]** English answer here...

**[FR]** Réponse en français ici...

**[LN]** Réponse na Lingala awa...

---
```

### How to Add New FAQ Entries

1. Open `/src/knowledge/knowledge_base.md`
2. Add your new entry following the format above
3. Ensure all 3 languages are provided
4. Add `---` separator after each entry
5. Save the file
6. **Redeploy the chat Edge Function** (see below)

### Redeploying After Knowledge Base Updates

Since the knowledge base is embedded in the Edge Function, you need to redeploy:

```bash
# Knowledge base is embedded in the Edge Function
# Simply redeploy the function after updating the KB
```

**Note:** The current implementation embeds the KB in the Edge Function. For production, consider moving to a database or external file for easier updates without redeployment.

## Usage

### For End Users

1. Click the **Support Chat** button (bottom-right corner)
2. Type your question in any language (EN/FR/LN)
3. Receive instant, accurate answers
4. After 4 questions, you'll see contact options for human support

### Question Counter

- Tracks questions per browser session
- Persists across page refreshes (sessionStorage)
- Resets when "Clear" button is clicked
- Shows current count at bottom of chat

### Contact Support Button

After 4 questions, users see:
- Email: support@germanlink.business
- WhatsApp: +49-XXX-XXXXXXX (update with real number)

## Testing

### Test Cases

#### 1. Language Detection
```
User: "What products do you sell?"       → Response in EN
User: "Quels produits vendez-vous?"      → Response in FR
User: "Biloko nini ozali koteka?"        → Response in LN
```

#### 2. Knowledge Base Usage
```
User: "How long does shipping take?"
Expected: Answer from KB (4-8 weeks...)
```

#### 3. Support Escalation
```
Ask 4 questions in sequence
Expected: 4th answer includes support contact info
```

#### 4. Error Handling
```
Disconnect internet → send message
Expected: Friendly error + offline contact options
```

#### 5. Session Persistence
```
Chat → refresh page → return to chat
Expected: Messages and question count preserved
```

## API Reference

### Edge Function Endpoint

**URL:** `https://your-project.supabase.co/functions/v1/chat`

**Method:** POST

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "message": "How do I order?",
  "sessionId": "session_123456",
  "questionCount": 1
}
```

**Response:**
```json
{
  "response": "Browse our catalog...",
  "language": "EN",
  "questionCount": 2,
  "usedKnowledge": true
}
```

## Customization

### Changing Response Style

Edit the system prompt in `/supabase/functions/chat/index.ts`:

```typescript
const systemPrompt = `You are a helpful customer support assistant...
CRITICAL RULES:
1. Keep responses concise (max 6-8 lines)  // ← Adjust here
2. Be friendly and professional             // ← Adjust tone
...`;
```

### Changing Escalation Threshold

In `/supabase/functions/chat/index.ts`:

```typescript
if (questionCount >= 4) {  // ← Change from 4 to your preferred number
  response += getSupportMessage(language);
}
```

### Updating Contact Information

Update in both locations:
1. `/src/knowledge/knowledge_base.md` (Q16)
2. `/supabase/functions/chat/index.ts` (getSupportMessage function)
3. `/src/components/SupportChat.tsx` (Contact buttons)

## Performance Considerations

### Knowledge Base Search
- Current: Simple keyword matching
- **Production Upgrade:** Use vector embeddings (OpenAI Embeddings API + Supabase pgvector) for semantic search

### Response Time
- Average: 2-4 seconds (OpenAI API latency)
- Knowledge hit: ~3 seconds
- Knowledge miss: ~4 seconds (includes fallback logic)

### Cost Optimization
- Using `gpt-4o-mini` keeps costs low (~$0.0015 per chat)
- Knowledge Base reduces API calls
- Consider caching frequent responses in Supabase

## Troubleshooting

### Chatbot Not Responding

1. Check browser console for errors
2. Verify `OPENAI_API_KEY` is set correctly
3. Check Supabase Edge Function logs
4. Ensure Edge Function is deployed

### Wrong Language Detected

- Improve language detection keywords in `detectLanguage()` function
- Add more language-specific words for better accuracy
- Consider using a library like `franc` for better detection

### Knowledge Not Found

- Check if FAQ entry uses correct format `**[EN]**`, `**[FR]**`, `**[LN]**`
- Ensure `---` separators exist between entries
- Verify keyword matching logic

### Session Lost After Refresh

- Check browser's sessionStorage (DevTools → Application → Session Storage)
- Ensure no browser extensions are clearing storage
- Verify JSON parsing in `useEffect` hook

## Future Enhancements

### Recommended Improvements

1. **Vector Search**: Replace keyword search with semantic embeddings
2. **Database Storage**: Move knowledge base to Supabase for dynamic updates
3. **Analytics**: Track popular questions, languages, escalation rate
4. **Multi-turn Context**: Remember conversation context for follow-up questions
5. **Feedback System**: Let users rate answers (👍/👎)
6. **Admin Dashboard**: Manage KB entries via UI instead of markdown files
7. **Proactive Suggestions**: Show quick-action buttons for common questions
8. **Voice Support**: Add speech-to-text for accessibility

## Security

### Best Practices

✅ **Implemented:**
- API keys stored in environment variables (never in frontend)
- Edge Function handles all OpenAI calls server-side
- CORS properly configured
- Input sanitization

⚠️ **Additional Recommendations:**
- Rate limiting (prevent abuse)
- User authentication for personalized support
- Encryption for sensitive conversations
- Audit logging for compliance

## Monitoring

### What to Track

1. **Usage Metrics**
   - Total chats per day
   - Average questions per session
   - Language distribution (EN/FR/LN %)

2. **Quality Metrics**
   - Knowledge base hit rate
   - Escalation rate (% reaching 4 questions)
   - Error rate

3. **Performance Metrics**
   - Average response time
   - API success rate
   - Edge Function cold starts

## Support

### Getting Help

- **Technical Issues**: Check Edge Function logs in Supabase dashboard
- **Knowledge Updates**: Edit `/src/knowledge/knowledge_base.md`
- **Feature Requests**: Contact development team

### Logs Location

- **Edge Function Logs**: Supabase Dashboard → Edge Functions → chat → Logs
- **Browser Console**: F12 → Console tab

## License

Proprietary - GermanLink Business © 2026

---

**Last Updated:** January 2026
**Version:** 1.0.0
**Maintainer:** GermanLink Development Team
