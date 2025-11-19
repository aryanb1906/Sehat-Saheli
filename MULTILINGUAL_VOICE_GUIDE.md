# SehatSaheli Multilingual Voice & Navigation Guide

## Overview
This guide explains how the multilingual voice system and navigation work in SehatSaheli.

## Voice Module - Multilingual Support

### Supported Languages
The voice module in `/mother/talk` supports **ALL 8 languages**:

1. **English** (en) - `en-IN`
2. **Hindi** (hi) - `hi-IN` - हिंदी
3. **Odia** (or) - `or-IN` - ଓଡ଼ିଆ
4. **Bengali** (bn) - `bn-IN` - বাংলা
5. **Telugu** (te) - `te-IN` - తెలుగు
6. **Tamil** (ta) - `ta-IN` - தமிழ்
7. **Marathi** (mr) - `mr-IN` - मराठी
8. **Gujarati** (gu) - `gu-IN` - ગુજરાતી

### How It Works

#### Voice Input (Speech Recognition)
When you click the microphone button:
- The system detects your selected language from the context
- Maps it to the correct locale code (e.g., Hindi → hi-IN)
- Uses the Web Speech Recognition API with that language
- Converts your speech to text in real-time

#### Voice Output (Speech Synthesis)
When you click the speaker button on AI responses:
- Uses the SpeechSynthesis API
- Selects a female voice when available for the chosen language
- Reads the text aloud in the selected language

### Code Implementation
Location: `app/mother/talk/page.tsx`

\`\`\`typescript
const langMap: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  or: "or-IN",
  bn: "bn-IN",
  te: "te-IN",
  ta: "ta-IN",
  mr: "mr-IN",
  gu: "gu-IN",
}
recognition.lang = langMap[language] || "en-IN"
\`\`\`

## Language Switching

### How to Change Language
1. Go to the language selection page from the landing page
2. Click on any supported language
3. The entire interface instantly switches to that language
4. All pages, buttons, labels, and content update automatically

### What Happens When You Switch
- The `LanguageContext` updates the selected language
- All components re-render with the new language content
- The selection is saved to `localStorage`
- Voice input/output automatically uses the new language

### Implementation Details
- **Context Provider**: `lib/language-context.tsx`
- **Content Translations**: `lib/multilingual-content.ts`
- **Language Selection Page**: `app/language/page.tsx`

## Navigation System

### Sidebar Menu
Every page (Mother & ASHA) now has a functional sidebar accessible via the menu icon (☰).

#### Mother Dashboard Sidebar Options:
- Home
- Talk to Saheli (Voice Chat)
- My Health Log
- Mental Health
- Emergency Call
- My Appointments
- Health Tips
- Pregnancy Tracker
- Medications
- Kick Counter
- Logout

#### ASHA Dashboard Sidebar Options:
- ASHA Dashboard
- My Patients
- Analytics Dashboard
- Logout

### Back Buttons
All pages now include a back button (←) in the header that:
- Takes you to the previous page
- Uses `router.back()` for natural navigation
- Styled consistently across all pages

### Pages with Back Buttons:
- ✅ Mother Dashboard (has menu instead)
- ✅ ASHA Dashboard (has menu instead)
- ✅ Talk to Saheli (`/mother/talk`)
- ✅ Health Log (`/mother/health-log`)
- ✅ Appointments (`/mother/appointments`)
- ✅ Mental Health (`/mother/mental-health`)
- ✅ Emergency (`/mother/emergency`)
- ✅ Health Tips (`/mother/tips`)
- ✅ Pregnancy Tracker (`/mother/pregnancy-tracker`)
- ✅ Medications (`/mother/medications`)
- ✅ Kick Counter (`/mother/kick-counter`)
- ✅ Analytics (`/asha/analytics`)
- ✅ Patient Detail (`/asha/patient/[id]`)

## User Flow

### First Time User:
1. **Landing Page** → Choose Demo Login
2. **Language Selection** → Select preferred language (e.g., Hindi)
3. **Role Selection** → Choose Mother or ASHA Worker
4. **Dashboard** → Interface in selected language with full navigation

### Language Change:
- Can be done anytime from the language switcher component
- All content immediately updates
- Voice module automatically switches

## Technical Architecture

### Components:
- `AppSidebar` - Sliding navigation menu
- `LanguageProvider` - Context for language state
- `LanguageSwitcher` - Dropdown to change languages

### State Management:
- Language preference stored in `localStorage`
- Context API provides language across all components
- Automatic persistence across sessions

## Testing the Multilingual System

1. **Test Language Switching**:
   - Start with English
   - Switch to Hindi
   - Verify all labels change
   - Check voice input works in Hindi

2. **Test Voice Module**:
   - Go to Talk to Saheli
   - Click microphone
   - Speak in your selected language
   - Verify it transcribes correctly

3. **Test Navigation**:
   - Open sidebar from any page
   - Navigate to different sections
   - Verify back buttons work
   - Check all options are accessible

## Browser Compatibility

### Speech Recognition Support:
- ✅ Chrome/Edge (Best support)
- ✅ Safari (iOS/Mac)
- ⚠️ Firefox (Limited)

### Speech Synthesis Support:
- ✅ All modern browsers
- ✅ All 8 languages supported
