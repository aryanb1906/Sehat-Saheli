# 🤰 Sehat Saheli (सेहत सहेली)

**Bridging the Gap in Maternal Healthcare with AI & Compassion**

[![Live Demo](https://img.shields.io/badge/Live-Prototype-FF4081?style=for-the-badge&logo=vercel&logoColor=white)](https://sehat-saheli.vercel.app/)
[![Hackathon](https://img.shields.io/badge/GHCI_25-AI_Hackathon-8E24AA?style=for-the-badge)](https://ghcindia.anitab.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> *"Healthcare that speaks your language, understands your needs."*

---

## 📖 Table of Contents
- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [Future Roadmap](#-future-roadmap)
- [The Team](#-the-team)

---

## 🚩 The Problem
In rural India, maternal mortality remains a critical challenge due to:
1.  **Language Barriers:** Health information is often not available in local dialects.
2.  **Limited Access:** ASHA workers are overburdened, making frequent home visits difficult.
3.  **Lack of Awareness:** Early warning signs of high-risk pregnancies are often missed.

## 💡 Our Solution
**Sehat Saheli** is an AI-powered digital companion that empowers both expectant mothers and ASHA workers. It acts as a bridge, providing 24/7 medical guidance in native languages while streamlining patient management for healthcare workers.

---

## ✨ Key Features

### 🌐 Inclusive & Accessible
*   **Multilingual AI:** Fluent in **8+ Indian languages** (Hindi, Odia, Bengali, Telugu, Tamil, Marathi, Gujarati, English).
*   **Voice-First Design:** Speak to the app naturally—perfect for users with limited literacy.
*   **Offline-First:** Critical features work without internet, syncing data when connectivity returns.

### 🤰 For Mothers (The "Saheli" Experience)
*   **🤖 AI Health Assistant:** Instant answers to pregnancy queries via Google Gemini.
*   **📊 Smart Trackers:**
    *   *Kick Counter* & *Contraction Timer*
    *   *Nutrition Planner* (Local diet recommendations)
    *   *Vital Signs Log*
*   **🆘 SOS Emergency:** One-tap alert system sending GPS location to family & ASHA workers.
*   **🧠 Mental Wellness:** Guided meditation and emotional support tools.

### 👩‍⚕️ For ASHA Workers
*   **📋 Digital Register:** Replace paper logs with a smart patient database.
*   **⚠️ AI Risk Scoring:** Auto-detection of high-risk pregnancies based on reported symptoms.
*   **📅 Smart Scheduler:** Automated reminders for ANC visits and immunizations.

---

## 🛠️ Technology Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css) |
| **UI Components** | ![Shadcn/ui](https://img.shields.io/badge/Shadcn%2Fui-000000?style=flat&logo=shadcnui) ![Radix UI](https://img.shields.io/badge/Radix_UI-161618?style=flat&logo=radix-ui) |
| **AI & ML** | ![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat&logo=google-gemini) ![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=flat&logo=tensorflow) |
| **Backend** | ![Edge Runtime](https://img.shields.io/badge/Vercel_Edge-000000?style=flat&logo=vercel) ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs) |
| **Communication** | ![Twilio](https://img.shields.io/badge/Twilio-F22F46?style=flat&logo=twilio) |

---

## 🏗️ System Architecture

Sehat Saheli utilizes a **Serverless Edge Architecture** for maximum performance on low-bandwidth networks.

```mermaid
graph TD
    User[User (Mother/ASHA)] -->|Voice/Text| Client[Next.js PWA]
    Client -->|Offline Data| LocalDB[Local Storage]
    Client -->|API Requests| Edge[Vercel Edge Functions]
    
    subgraph Cloud Services
        Edge -->|Inference| AI[Google Gemini Pro]
        Edge -->|Alerts| SMS[Twilio Gateway]
        Edge -->|Sync| DB[Cloud Database]
    end
```

### Code Structure
*   `app/api/`: Edge-optimized API routes for Chat and SMS.
*   `lib/multilingual-content.ts`: Static dictionaries for offline localization.
*   `components/ui/`: Accessible, high-performance UI components.

---

## 🚀 Getting Started

To run the project locally:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/aryanb1906/Sehat-Saheli.git
    cd Sehat-Saheli
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Set up Environment Variables**
    Create a `.env.local` file:
    ```env
    GEMINI_API_KEY=your_google_api_key
    TWILIO_ACCOUNT_SID=your_sid
    TWILIO_AUTH_TOKEN=your_token
    TWILIO_PHONE_NUMBER=your_number
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

---

## 🔮 Future Roadmap

*   [ ] **Telemedicine Integration:** Video calls with doctors.
*   [ ] **IoT Integration:** Sync with smart wearables for vitals monitoring.
*   [ ] **Community Forum:** Anonymous peer support groups for mothers.
*   [ ] **Govt. Scheme Integration:** Direct enrollment in schemes like JSY/PMMVY.

---

## 👥 The Team

Built with ❤️ by **Team Sehat Saheli**

*   👨‍💻 **Aryan Bhargava** - Full Stack & AI Lead
*   👨‍💻 **Naman Surana** - Frontend & UX
*   👨‍💻 **Vaidik** - Backend & Architecture
*   👩‍💻 **Shrinkhala** - Research & Content

---
