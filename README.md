# Sehat Saheli 🤰🏥

**Empowering Maternal Healthcare with AI & Community Support**

> **MVP developed for GHCI 25 AI Hackathon**

Sehat Saheli is a comprehensive digital health platform designed to bridge the gap between expectant mothers and healthcare systems in rural India. By empowering ASHA (Accredited Social Health Activist) workers with digital tools and providing mothers with AI-driven guidance, we aim to reduce maternal mortality rates and improve health outcomes.

---

## 🚀 Key Features

### 👩‍👧 For Expectant Mothers
- **AI Health Assistant:** 24/7 multilingual chat support for pregnancy queries using Google Gemini.
- **Pregnancy Tracker:** Week-by-week development updates and visual guides.
- **Health Tools:** Kick counter, contraction timer, and vital signs logging.
- **SOS Emergency:** One-tap alerts to family and local ASHA workers with location sharing.
- **Multilingual Support:** Full interface and content available in local languages.

### 👩‍⚕️ For ASHA Workers
- **Digital Patient Management:** Streamlined records for all assigned expectant mothers.
- **High-Risk Identification:** AI-assisted flagging of high-risk pregnancies based on symptoms.
- **Visit Scheduler:** Automated reminders for home visits and check-ups.
- **Training Modules:** Interactive guides to stay updated with medical best practices.

---

## 🛠️ Technology Stack

### Frontend & User Interface
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn/ui](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

### Backend & Infrastructure
- **Runtime:** Next.js Edge Runtime for low-latency API responses.
- **API:** RESTful API routes integrated within Next.js.

### AI & Automation
- **Generative AI:** [Google Gemini Pro](https://deepmind.google/technologies/gemini/) (via `@google/generative-ai`) for:
  - Intelligent Symptom Checking
  - Natural Language Chatbot
  - Real-time Translation
- **Communication:** [Twilio API](https://www.twilio.com/) for automated SMS notifications and alerts.

---

## 🏗️ System Architecture

Sehat Saheli utilizes a modern, serverless-first architecture:

1.  **Client Layer:** Responsive Web Application (PWA ready) optimized for mobile devices, ensuring accessibility even on low-end smartphones.
2.  **Edge Layer:** API routes run on the Edge (Vercel/Next.js Edge), ensuring near-instant response times for critical features like SOS and Chat.
3.  **AI Service Layer:** Interacts with Google Gemini API to process natural language queries and analyze medical symptoms securely.
4.  **Notification Service:** Asynchronous jobs trigger Twilio SMS gateways for reminders and emergency alerts.

---

## 💾 Data Model & Storage

*Current MVP Implementation:*
For the hackathon MVP, the application uses a robust in-memory simulation (`lib/demo-database.ts`) to demonstrate full functionality without requiring complex database setup during judging.

*Production Design:*
- **Users:** (Mothers/ASHA) with role-based access control (RBAC).
- **HealthRecords:** Time-series data for vitals, visits, and symptoms.
- **Appointments:** Relational mapping between Mothers and Doctors/ASHA workers.
- **Content:** CMS-driven educational content for easy localization.

---

## 🤖 AI / ML / Automation Components

1.  **Multilingual AI Chatbot:**
    -   Leverages Google Gemini to understand context and sentiment.
    -   Provides medically relevant (non-diagnostic) advice in the user's native language.
    -   Implements retry logic and fallback mechanisms for reliability.

2.  **Symptom Analyzer:**
    -   Analyzes reported symptoms against a medical knowledge base using LLMs.
    -   Categorizes urgency (Normal, Watch, Emergency) to guide user action.

3.  **Automated Reminders:**
    -   Cron-like scheduling for ANC (Antenatal Care) appointments and medication reminders.

---

## 🔒 Security & Compliance

- **Data Privacy:** All health data is treated with strict confidentiality.
- **Secure Communication:** HTTPS/TLS encryption for all data in transit.
- **Environment Security:** API keys (Gemini, Twilio) are managed via server-side environment variables, never exposed to the client.
- **Edge Security:** Serverless functions isolate execution environments.

---

## 📈 Scalability & Performance

- **Edge Computing:** Logic runs closer to the user, reducing latency in rural areas with poor connectivity.
- **Static Site Generation (SSG):** Educational content is pre-rendered for instant loading.
- **Component Architecture:** Modular React components allow for easy feature expansion and maintenance.

---

## 👥 Team Members

- **Aryan Bhargava**
- **Naman Surana**
- **Vaidik**
- **Shrinkhala**

---

*Built with ❤️ for a healthier future.*
