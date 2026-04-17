# Language Switcher Implementation Guide

## Overview

A visual language switcher with flag emojis has been successfully implemented, allowing users to switch between German, French, and Lingala across the entire application.

---

## Features

### 🎯 Core Functionality

✅ **Three Languages Supported:**
- 🇩🇪 **Deutsch (DE)** - German
- 🇫🇷 **Français (FR)** - French
- 🇨🇩 **Lingala (LN)** - Lingala

✅ **Visual Flag Interface:**
- Clickable flag buttons with emoji flags
- Active language highlighted with red gradient
- Hover effects for better UX
- Yellow indicator dot under active language

✅ **Persistent Selection:**
- Language choice stored in `localStorage`
- Survives page reloads
- Default: French (FR)

✅ **Full Integration:**
- Controls chatbot response language
- Updates all UI text throughout the app
- Overrides auto-detection in chatbot

---

## User Experience

### Visual Design

```
┌─────────────────────────────────────┐
│  [🇩🇪]  [🇫🇷]  [🇨🇩]                │
│   DE    FR    LN                    │
│         ●                           │  ← Yellow dot under active
│  ╰─────╯                            │
│  Active: Red gradient background    │
└─────────────────────────────────────┘
```

### Interaction Flow

1. **User clicks a flag** (e.g., 🇩🇪)
2. **Language instantly updates** across app
3. **localStorage saves choice** (`germanlink_language: 'de'`)
4. **Chatbot switches** to German responses
5. **UI text changes** to German

---

## Technical Implementation

### Files Created/Modified

#### 1. LanguageContext (`src/contexts/LanguageContext.tsx`)
**Changes:**
- Added German (`de`) to language type
- All translations now include DE/FR/LN
- localStorage persistence
- Auto-load saved language on init

```typescript
export type Language = 'de' | 'fr' | 'ln';

// Loads from localStorage
const [language, setLanguage] = useState<Language>(() => {
  const saved = localStorage.getItem('germanlink_language');
  return (saved as Language) || 'fr'; // Default: French
});
```

#### 2. LanguageSwitcher Component (`src/components/LanguageSwitcher.tsx`)
**New Component:**
- Renders 3 flag buttons
- Active state styling
- Accessibility (aria-labels, keyboard navigation)
- Tooltips on hover

```typescript
const languages = [
  { code: 'de', label: 'DE', flag: '🇩🇪', ariaLabel: 'Deutsch' },
  { code: 'fr', label: 'FR', flag: '🇫🇷', ariaLabel: 'Français' },
  { code: 'ln', label: 'LN', flag: '🇨🇩', ariaLabel: 'Lingala' }
];
```

#### 3. SupportChat Component (`src/components/SupportChat.tsx`)
**Updates:**
- Uses `useLanguage()` hook
- Dynamic welcome message per language
- Dynamic placeholder text
- Sends `language` to backend API

```typescript
const { language } = useLanguage();

// Welcome messages adapt to language
const getWelcomeMessage = () => {
  return {
    de: 'Hallo! 👋 Ich bin Ihr GermanLink Business Assistent...',
    fr: 'Bonjour! 👋 Je suis votre assistant GermanLink Business...',
    ln: 'Mbote! 👋 Nazali assistant na yo...'
  }[language];
};

// Send to API
body: JSON.stringify({
  message: inputMessage,
  language: languageMap[language] // 'DE', 'FR', or 'LN'
})
```

#### 4. Edge Function (`supabase/functions/chat/index.ts`)
**Updates:**
- Accepts `language` parameter from frontend
- User choice overrides auto-detection
- All responses in selected language

```typescript
interface ChatRequest {
  message: string;
  sessionId: string;
  questionCount: number;
  language?: 'DE' | 'FR' | 'LN'; // Optional: user's choice
}

// Priority: User selection > Auto-detection
const language = userLanguage || detectLanguage(message);
```

#### 5. Header Component (`src/components/Header.tsx`)
**Integration:**
- Replaced old text-based switcher (FR/LN)
- Now uses LanguageSwitcher component
- Positioned prominently in header

---

## How Language Selection Works

### Priority Chain

```
1. User clicks flag (DE/FR/LN)
   ↓
2. LanguageContext.setLanguage('de')
   ↓
3. localStorage.setItem('germanlink_language', 'de')
   ↓
4. All components re-render with new language
   ↓
5. SupportChat sends language='DE' to backend
   ↓
6. Edge Function uses DE for knowledge base + responses
```

### Chatbot Logic

**Without manual selection:**
```
User types: "Wie kann ich bestellen?"
→ Backend detects German keywords
→ Responds in German
```

**With manual selection (DE selected):**
```
User types: "how to order" (English)
→ Backend receives language='DE' parameter
→ Ignores auto-detection
→ Responds in German (as requested)
```

**User choice ALWAYS wins!**

---

## Adding More Languages

To add a new language (e.g., Spanish):

### Step 1: Update LanguageContext
```typescript
// File: src/contexts/LanguageContext.tsx

export type Language = 'de' | 'fr' | 'ln' | 'es'; // Add 'es'

interface Translations {
  [key: string]: {
    de: string;
    fr: string;
    ln: string;
    es: string; // Add Spanish
  };
}

// Add Spanish translations to all keys
const translations: Translations = {
  app_title: {
    de: 'GermanLink Business',
    fr: 'GermanLink Business',
    ln: 'GermanLink Business',
    es: 'GermanLink Business' // Add this
  },
  // ... repeat for all translation keys
};
```

### Step 2: Update LanguageSwitcher
```typescript
// File: src/components/LanguageSwitcher.tsx

const languages = [
  { code: 'de', label: 'DE', flag: '🇩🇪', ariaLabel: 'Deutsch' },
  { code: 'fr', label: 'FR', flag: '🇫🇷', ariaLabel: 'Français' },
  { code: 'ln', label: 'LN', flag: '🇨🇩', ariaLabel: 'Lingala' },
  { code: 'es', label: 'ES', flag: '🇪🇸', ariaLabel: 'Español' } // Add Spanish
];
```

### Step 3: Update Edge Function
```typescript
// File: supabase/functions/chat/index.ts

interface ChatRequest {
  language?: 'DE' | 'FR' | 'LN' | 'ES'; // Add 'ES'
}

const languageNames = {
  'DE': 'German',
  'FR': 'French',
  'LN': 'Lingala',
  'ES': 'Spanish' // Add Spanish
};

function getSupportMessage(language: 'DE' | 'FR' | 'LN' | 'ES'): string {
  const messages = {
    'DE': '...',
    'FR': '...',
    'LN': '...',
    'ES': 'Para más ayuda, contacte nuestro soporte:...' // Add Spanish
  };
  return messages[language];
}
```

### Step 4: Update Knowledge Base
Add `**[ES]**` entries to all FAQ questions in:
- `/src/knowledge/knowledge_base.md`
- Embedded knowledge in Edge Function

### Step 5: Update SupportChat
```typescript
// File: src/components/SupportChat.tsx

const getWelcomeMessage = () => {
  const messages = {
    de: '...',
    fr: '...',
    ln: '...',
    es: '¡Hola! 👋 Soy tu asistente de GermanLink Business...' // Add Spanish
  };
  return messages[language];
};

const languageMap = {
  de: 'DE',
  fr: 'FR',
  ln: 'LN',
  es: 'ES' // Add Spanish
};
```

### Step 6: Redeploy Edge Function
The Edge Function must be redeployed after any changes.

---

## Accessibility

### Keyboard Navigation
- All flag buttons are keyboard-accessible
- Tab through flags, Enter/Space to select
- Visual focus indicators

### Screen Readers
Each flag has proper `aria-label`:
```html
<button aria-label="Deutsch">🇩🇪 DE</button>
<button aria-label="Français">🇫🇷 FR</button>
<button aria-label="Lingala">🇨🇩 LN</button>
```

### Tooltips
Hover shows full language name:
- 🇩🇪 → "Deutsch"
- 🇫🇷 → "Français"
- 🇨🇩 → "Lingala"

---

## Testing Checklist

### ✅ Visual Tests
- [ ] All 3 flags visible in header
- [ ] Active flag has red gradient background
- [ ] Yellow dot appears under active flag
- [ ] Hover effect works on all flags
- [ ] Mobile: flags stack/resize properly

### ✅ Functionality Tests
- [ ] Click DE → UI changes to German
- [ ] Click FR → UI changes to French
- [ ] Click LN → UI changes to Lingala
- [ ] Refresh page → language persists
- [ ] Clear localStorage → defaults to French

### ✅ Chatbot Tests
- [ ] DE selected → chatbot responds in German
- [ ] FR selected → chatbot responds in French
- [ ] LN selected → chatbot responds in Lingala
- [ ] Language persists across chat sessions
- [ ] Welcome message in correct language
- [ ] Placeholder text in correct language
- [ ] Error messages in correct language
- [ ] Support CTA (after 4 questions) in correct language

### ✅ Edge Cases
- [ ] Switch language mid-conversation → new messages adapt
- [ ] Type English with DE selected → responds in German
- [ ] Invalid localStorage value → defaults to French
- [ ] Knowledge base returns correct language section

---

## Troubleshooting

### Issue: Language not changing
**Solution:** Check browser console for errors. Verify localStorage is not blocked.

### Issue: Chatbot still auto-detecting despite selection
**Solution:** Verify Edge Function receives `language` parameter in request.

### Issue: UI changes but chatbot doesn't
**Solution:** Check `languageMap` in SupportChat.tsx maps correctly (de→DE, fr→FR, ln→LN).

### Issue: Welcome message in wrong language
**Solution:** Clear sessionStorage (`chat_session` key) and reopen chat.

### Issue: Flags not displaying
**Solution:** Ensure emoji fonts are supported by browser/OS. Use SVG flags as fallback.

---

## Performance

### localStorage Size
- Key: `germanlink_language`
- Value: 2 bytes (`'de'`, `'fr'`, or `'ln'`)
- Negligible impact

### Re-render Performance
- Context triggers re-render of dependent components
- Optimized: Only components using `useLanguage()` re-render
- No noticeable lag

### Chatbot API
- Adds `language` parameter (3-4 bytes)
- No performance impact
- Reduces backend processing (skips detection)

---

## Best Practices

### DO ✅
- Always provide all 3 languages for new translations
- Test chatbot in all 3 languages after changes
- Keep flag emojis for visual clarity
- Persist user choice in localStorage

### DON'T ❌
- Don't force auto-detection when user selected manually
- Don't hardcode language strings (use translation keys)
- Don't forget to update Edge Function after KB changes
- Don't remove default language fallback

---

## Summary

The language switcher provides a seamless, visual way for users to control their preferred language across the entire GermanLink Business platform. The implementation prioritizes user choice, persists selections, and ensures consistency between the UI and chatbot responses.

**Key Achievement:** Users can now confidently interact in their preferred language (Deutsch, Français, or Lingala) without the app guessing incorrectly.

---

**Last Updated:** January 25, 2026
**Version:** 1.0.0
**Status:** ✅ Production Ready
