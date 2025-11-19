# Sehat Saheli 🤰🏥

**Empowering Maternal Healthcare with AI & Community Support**

> **MVP developed for GHCI 25 AI Hackathon**
>
> 🌐 **Live Prototype:** [https://sehat-saheli.vercel.app/](https://sehat-saheli.vercel.app/)

Sehat Saheli is a comprehensive digital health platform designed to bridge the gap between expectant mothers and healthcare systems in rural India. By empowering ASHA (Accredited Social Health Activist) workers with digital tools and providing mothers with AI-driven guidance, we aim to reduce maternal mortality rates and improve health outcomes.

---

## 🚀 Key Features

### 🌐 Multilingual & Accessible
-   **"Your Health, Your Language":** Supports **8+ Indian languages** (Hindi, Odia, Bengali, Telugu, Tamil, Marathi, Gujarati, English).
-   **Voice-First Interface:** AI voice assistance designed for users with low literacy levels.
-   **Offline Capability:** Fully functional without an internet connection ("Works Offline"), syncing data when connectivity is restored—crucial for rural areas with limited connectivity.

### 👩‍👧 For Expectant Mothers (The "Saheli" Experience)
-   **Personalized Dashboard:** Features a daily health status indicator ("Low Risk"), pregnancy week tracking, and personalized greetings (e.g., "Namaste, Priya!").
-   **AI Health Assistant:** 24/7 chat support for pregnancy queries using Google Gemini.
-   **Comprehensive Health Tracking:**
    -   **Baby Kick Counter:** Monitor fetal movement health.
    -   **Nutrition Tracker:** Diet planning and logging.
    -   **Vital Signs:** Track blood pressure, weight, and other key metrics.
    -   **Labor Signs Tracker:** Identify and log early signs of labor.
-   **Mental Health Support:** Dedicated section for emotional well-being.
-   **SOS Emergency:** One-tap "Emergency Call" button to alert family and ASHA workers immediately.
-   **Family Sharing:** Keep loved ones informed about the pregnancy journey.

### 👩‍⚕️ For ASHA Workers
-   **Digital Patient Management:** Streamlined records for all assigned expectant mothers.
-   **AI Risk Detection:** Early warning system that identifies high-risk pregnancies based on symptoms and vitals.
-   **Visit Scheduler:** Automated reminders for home visits and check-ups.

---

## 🏗️ System & Code Architecture

Sehat Saheli is built on a modern, scalable, and performance-oriented stack, designed to run efficiently even on low-end devices.

### 1. High-Level Architecture
The application follows a **Serverless Edge Architecture**:
-   **Client:** A Progressive Web App (PWA) built with Next.js, capable of caching resources for offline usage.
-   **Edge API Layer:** Backend logic runs on Vercel Edge Functions for minimal latency.
-   **AI Engine:** Integrates Google Gemini Pro for natural language processing and medical triage logic.

### 2. Code Structure (Next.js App Router)
The codebase is organized for modularity and maintainability:

-   **`app/`**: Contains the file-system based routing.
    -   `api/`: Backend endpoints (e.g., `/chat`, `/sms`) running on Edge Runtime.
    -   `mother/` & `asha/`: Distinct route groups for different user roles.
    -   `language/`: Localization logic and language selection screens.
-   **`components/`**: Reusable UI elements.
    -   `ui/`: Atomic components (Buttons, Cards, Inputs) built with Shadcn UI.
    -   Feature-specific components like `language-switcher.tsx` and `app-sidebar.tsx`.
-   **`lib/`**: Core utilities.
    -   `language-context.tsx`: Global state management for multilingual support.
    -   `demo-database.ts`: In-memory data simulation for the MVP.
    -   `multilingual-content.ts`: Static content dictionaries for offline support.

### 3. Data Flow
1.  **User Input:** Voice or Text input from the UI.
2.  **Processing:**
    -   **Local:** Immediate UI updates (Optimistic UI).
    -   **Edge:** API routes process sensitive logic (e.g., symptom analysis).
    -   **AI:** Prompts sent to Google Gemini for context-aware responses.
3.  **Storage:** Data is persisted locally (for offline access) and synced to the backend when online.

---

## 🛠️ Technology Stack

### Frontend & User Interface
-   **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [Shadcn/ui](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
-   **Icons:** [Lucide React](https://lucide.dev/)

### Backend & Infrastructure
-   **Runtime:** Next.js Edge Runtime for low-latency API responses.
-   **Hosting:** [Vercel](https://vercel.com/).

### AI & Automation
-   **Generative AI:** [Google Gemini Pro](https://deepmind.google/technologies/gemini/) (via `@google/generative-ai`) for:
  - Intelligent Symptom Checking
  - Natural Language Chatbot
  - Real-time Translation
-   **Communication:** [Twilio API](https://www.twilio.com/) for automated SMS notifications and alerts.

---

## 💾 Data Model & Storage

*Current MVP Implementation:*
For the hackathon MVP, the application uses a robust in-memory simulation (`lib/demo-database.ts`) to demonstrate full functionality without requiring complex database setup during judging.

*Production Design:*
-   **Users:** (Mothers/ASHA) with role-based access control (RBAC).
-   **HealthRecords:** Time-series data for vitals, visits, and symptoms.
-   **Offline Sync:** Uses `localStorage` / `IndexedDB` for offline capability, syncing with a cloud database (e.g., PostgreSQL/MongoDB) upon reconnection.

---

## 🔒 Security & Compliance

-   **Data Privacy:** All health data is treated with strict confidentiality.
-   **Secure Communication:** HTTPS/TLS encryption for all data in transit.
-   **Environment Security:** API keys (Gemini, Twilio) are managed via server-side environment variables, never exposed to the client.
-   **Edge Security:** Serverless functions isolate execution environments.

---

## 👥 Team Members

-   **Aryan Bhargava**
-   **Naman Surana**
-   **Vaidik**
-   **Shrinkhala**

---

*Built with ❤️ for a healthier future.*
