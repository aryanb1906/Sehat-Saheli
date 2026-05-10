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
- [Latest Platform Update (March 2026)](#-latest-platform-update-march-2026)
- [Critical Hardening Log (March 30, 2026)](#-critical-hardening-log-march-30-2026)
- [Key Features](#-key-features)
- [End-to-End Product Workflow](#-end-to-end-product-workflow)
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

## 🚀 Latest Platform Update (March 2026)

This release includes both the previously completed platform foundations and the latest production updates delivered today.

### ✅ Highlights Added Today

1. **Voice Assistant 2.0**
    - Dedicated settings panel: language override, auto-listen toggle, speaking speed.
    - Voice intent analytics logging with success/failure trends.
    - Expanded intents for mother + ASHA workflows:
      - Appointments, medications, lab reports, community navigation.
      - ASHA dashboard, patients, tasks, analytics navigation.
    - New voice APIs:
      - `POST /api/voice-assistant/parse`
      - `POST/GET /api/voice-assistant/analytics`

2. **Care Governance and Safety Layer**
    - Privacy consent controls API with version history and revoke flows.
    - Referral workflow API with SLA breach detection and escalation readiness.
    - Audit logging APIs for admin-grade activity monitoring.
    - Idempotency safeguards for mutation endpoints.
    - Structured observability helpers with timing/error instrumentation.

3. **Clinical Decision Support APIs**
    - Maternal risk assessment endpoint (`/api/maternal-risk`) with trend-aware scoring and action plans.
    - Medication safety endpoint (`/api/medication-safety`) with pregnancy-safe guidance labels.

4. **Offline Reliability Enhancements**
    - Offline write queue client with automatic replay on reconnect.
    - Conflict detection + lightweight resolver UI for failed sync operations.

5. **Role and Security Hardening**
    - Stronger role guards in middleware for mother/ASHA/doctor/admin route boundaries.
    - API auth utilities and standardized API error responses.

6. **Localization + UX Continuity**
    - Mother dashboard and sidebar labels aligned to multilingual content keys.
    - Hindi/English display consistency in primary dashboard actions and test selectors.

7. **Hospital Finder & GPS Map Integration**
    - GPS-first location detection with auto-detection on browser permission grant.
    - Integrated Leaflet + OpenStreetMap tiles with custom, scalable bounds-aware markers.
    - Real-time facility fetch from Overpass API, cached server-side to minimize rate limits.
    - Fallback Nominatim city-search geocoding when GPS is denied or unavailable.

### ✅ Existing Foundations Preserved

- NextAuth authentication and role-aware access model.
- Prisma + PostgreSQL data model integration.
- Real-time and persistent chat infrastructure.
- Video consultation persistence layer.
- PWA + performance baseline (manifest, service worker, web vitals).

### 🧪 Validation Snapshot

- Unit and route tests passing in latest run: **13/13 tests passed**.
- New and updated test coverage includes referrals, privacy consent, emergency and lab route auth/validation, and smoke route protections.

---

## 🔐 Critical Hardening Log (March 30, 2026)

This section records the production-hardening work completed today so implementation and governance updates are visible in one place.

### ✅ Security and Reliability Work Completed

1. **Standard API response contract + request tracing**
   - Added/expanded request-id propagation (`requestId` in JSON + `x-request-id` response header) for care-critical endpoints.
   - Standardized success/error response envelope through shared helpers in `lib/api-response.ts`.

2. **Routes normalized today for contract consistency**
   - `app/api/audit-logs/route.ts`
   - `app/api/asha-patients/route.ts`
   - `app/api/lab-reports/route.ts`
   - `app/api/check-symptom/route.ts`
   - `app/api/video-consultation/route.ts`
   - `app/api/medication-safety/route.ts`
   - `app/api/maternal-risk/route.ts`
   - `app/api/voice-assistant/parse/route.ts`
   - `app/api/voice-assistant/analytics/route.ts`
   - `app/api/asha-tasks/automation-plan/route.ts`

3. **Persistence and fallback policy hardening**
   - Production fail-closed policy in persistence layer for safety-critical operations (no silent in-memory fallback in production).
   - Durable emergency status lifecycle support (`active -> acknowledged -> resolved/cancelled`) with status-history behavior.

4. **Authentication and secret policy hardening**
   - Removed weak fallback secrets and enforced required auth secret behavior for protected token/session flows.
   - Strengthened guardrails for production-only config requirements.

5. **Critical-flow tests added/updated**
   - Added safety integration flow coverage in `tests/safety-critical-e2e-flow.test.ts`.
   - Expanded emergency and privacy-consent flows, including audit expectations and SOS status acknowledgement behavior.

### 🧪 Validation Executed Today

- TypeScript compile check: `pnpm run typecheck` ✅
- Targeted regression tests: `pnpm run test -- tests/lab-reports-route.test.ts tests/safety-critical-e2e-flow.test.ts tests/emergency-route.test.ts tests/privacy-consent-e2e-flow.test.ts` ✅ (8/8 tests)

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

## ✨ UI/UX Improvements (Production-Ready)

### 🎨 13 Core Usability Improvements

All 8 pages now feature professional UI/UX patterns:

| # | Improvement | Implementation | Pages |
|---|-------------|-----------------|-------|
| 1️⃣ | **Skeleton Loading** | Smooth placeholder animations while data loads | All 8 |
| 2️⃣ | **Empty States** | Friendly cards with icons & CTAs when no data exists | All 8 |
| 3️⃣ | **Form Validation** | Real-time error messages with visual feedback | Video Consult, Symptom Check |
| 4️⃣ | **Progressive Disclosure** | Multi-step forms (3-step booking wizard) | Video Consultation |
| 5️⃣ | **Toast Notifications** | Non-intrusive success/error alerts | All 8 pages |
| 6️⃣ | **Responsive Media** | Adaptive layouts for all screen sizes | All 8 |
| 7️⃣ | **Dark Mode Ready** | Theme system prepared in `theme-provider.tsx` | Framework ready |
| 8️⃣ | **Accordion Sections** | Collapsible content for danger signs, FAQs | Danger Signs Monitor |
| 9️⃣ | **Lazy Loading** | Image & component optimization templates | Documented |
| 🔟 | **Typography** | `leading-relaxed` for 1.625 line-height readability | All 8 |
| 1️⃣1️⃣ | **Spacing** | Consistent `gap-4` (1rem) & `gap-6` (1.5rem) | All 8 |
| 1️⃣2️⃣ | **Color Contrast** | WCAG AA compliant text/background ratios | All 8 |
| 1️⃣3️⃣ | **Touch Targets** | All buttons minimum `h-11` (44px+) height | All 8 |

### 🚀 5 Quick Wins (Rapid Polish)

✅ **Toast Buttons** - All action buttons confirm with toast notifications  
✅ **Empty States** - Friendly UI cards when data is absent  
✅ **Consistent Spacing** - `gap-4` standardization across layouts  
✅ **Skeleton Loading** - Improved perceived performance  
✅ **Typography** - `leading-relaxed` for better readability  

### 📱 Pages Enhanced

1. **🥗 Nutrition Planner** - Recipe discovery with validation
2. **🧪 Lab Reports** - Medical records management with timeline view
3. **📹 Video Consultation** - 3-step progressive booking form
4. **🚨 Danger Signs Monitor** - Emergency detection with SOS integration
5. **👥 Support Groups** - Community learning with filtered discovery
6. **🔍 Symptom Checker** - AI analysis with severity-based actions
7. **📋 ASHA Task Management** - Priority-based task tracking with real-time updates
8. **📊 Analytics Dashboard** - ASHA performance metrics with progress bars
9. **🏥 Hospital Finder** - GPS-enabled interactive map with nearby facilities and emergency filters

---

## 🔄 End-to-End Product Workflow

### 1. Mother Journey
1. Mother signs in (or enters allowed guest flow where configured).
2. Uses dashboard tools for symptoms, medications, appointments, emergency readiness, and family sharing.
3. Uses voice assistant in Hindi/English to execute actions hands-free.
4. Receives guidance from risk + safety APIs (maternal risk scoring, medication safety signals).
5. Data is persisted and, if offline, queued for safe sync when connectivity returns.

### 2. ASHA Journey
1. ASHA accesses patient/task dashboards using role-secured routes.
2. Uses task and analytics views for daily workload management.
3. Can navigate quickly via expanded voice intents.
4. Automation planning endpoint supports prioritized work and routing bundles.

### 3. Referral and Consent Governance
1. Referral is generated with tracked status and SLA timeline.
2. Breach conditions are surfaced as alerts for follow-up.
3. Privacy consent is saved with versioned history.
4. Revoke flow is supported and audit-ready.

### 4. Audit and Observability Flow
1. Sensitive API actions can emit structured audit events.
2. Latency/error instrumentation is captured via observability helpers.
3. Admin audit viewer page provides role-filtered operational traceability.

### 5. Development Workflow
1. Install and configure:
    - `pnpm install`
    - `pnpm prisma:generate`
    - `pnpm prisma:push` (with active DB)
2. Run app:
    - `pnpm dev`
3. Run tests:
    - `pnpm test`
4. Optional smoke checks:
    - `pnpm exec playwright test`

---

## 📸 User Interface

| **Landing Page** | **Multilingual Support** |
|:---:|:---:|
| ![Landing Page](public/screenshots/landing-page.png) | ![Language Selection](public/screenshots/language-selection.png) |
| *Accessible & Welcoming Home* | *Support for 8+ Languages* |

| **Smart Dashboard** | **Comprehensive Tools** |
|:---:|:---:|
| ![Dashboard](public/screenshots/dashboard.png) | ![Feature Menu](public/screenshots/feature-menu.png) |
| *Personalized Health Status* | *All-in-one Health Tracker* |

---

## 🎥 See it in Action

> **Experience our Multilingual AI Chatbot**
>
> [**▶️ Watch Demo Video**](https://drive.google.com/file/d/1LQS_r2vxWhAqhxQomfBfc5dpiAB3wc5T/view?usp=drive_link)
> *(Click to watch the AI speak in Hindi!)*

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

## 🏗️ Architecture & Data Flow

Sehat Saheli is engineered with a **Serverless Edge Architecture**, prioritizing speed, accessibility, and reliability for rural connectivity.

### 🔄 How it Works: The MVP Journey

1.  **The Offline-First Interface (PWA)**
    *   **User Action:** A mother in a remote village opens the app. Even with **zero internet**, she can access her health logs, nutrition plans, and emergency contacts.
    *   **Tech:** Built with **Next.js 14**, the app caches critical data locally on her device using `localStorage` and Service Workers.

2.  **The Edge Connectivity Layer**
    *   **Process:** When she asks a question via voice or text, the request travels to the nearest **Vercel Edge Function**.
    *   **Benefit:** Unlike traditional servers, "Edge" servers are geographically distributed. This means the app responds instantly, even on slow 2G/3G networks common in rural India.

3.  **The AI Intelligence Engine**
    *   **Analysis:** The Edge function securely sends her query to **Google Gemini Pro**.
    *   **Logic:** The AI detects the language (e.g., Hindi), translates it, analyzes the medical context (e.g., "I have a headache"), and generates a safe, medically-verified response.
    *   **Risk Detection:** If symptoms indicate danger (e.g., high BP), the AI flags it immediately.

4.  **The Bridge to Reality (Communication)**
    *   **Action:** For high-risk alerts or SOS triggers, the system invokes the **Twilio API**.
    *   **Result:** An SMS is instantly sent to her registered ASHA worker and family members with her GPS location, bridging the digital gap to physical aid.

### ⚙️ Technical Architecture Breakdown

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **1. Client Layer** | **Next.js 14 (PWA)** | **Offline-First UI:** Caches resources locally. Handles user interaction, voice input, and displays health data. |
| **2. Edge Layer** | **Vercel Edge Functions** | **Low-Latency API:** Processes requests closest to the user, ensuring speed on 2G/3G networks. |
| **3. Intelligence Layer** | **Google Gemini Pro** | **The "Brain":** Handles natural language understanding, translation, and medical symptom analysis. |
| **4. Communication Layer** | **Twilio API** | **SMS Gateway:** Sends critical alerts and reminders to feature phones (non-smartphones). |

```mermaid
graph TD
    subgraph User_Device ["📱 User Device (Offline Capable)"]
        UI[Next.js PWA Interface]
        LocalDB[(Local Storage / Cache)]
        UI <--> LocalDB
    end

    subgraph Edge_Network ["⚡ Vercel Edge Network"]
        API[Edge API Routes]
    end

    subgraph Cloud_Services ["☁️ Cloud Services"]
        Gemini[🧠 Google Gemini AI]
        Twilio[📡 Twilio SMS Gateway]
    end

    UI -->|Sync & Requests| API
    API -->|Inference| Gemini
    API -->|Alerts| Twilio
```

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

## ✅ Top 5 Priorities Implemented (Current Sprint)

The following high-priority foundation work has been implemented in this update:

1. **Authentication System**
        - NextAuth-based auth flow with credentials and optional Google OAuth.
        - Role-ready user model (`MOTHER`, `ASHA`, `DOCTOR`).
        - Signup API and signin/register pages.
        - Protected route middleware for `/mother/*`, `/asha/*`, and `/doctor/*`.

2. **Database Integration (Prisma + PostgreSQL)**
        - Prisma schema added for `User`, `ChatRoom`, `ChatMessage`, and `VideoConsultation`.
        - Shared Prisma client utility in `lib/prisma.ts`.
        - Prisma scripts added: `prisma:generate`, `prisma:push`, `prisma:studio`.

3. **Real-time Chat Infrastructure**
        - New persistent messaging endpoints:
            - `GET/POST /api/chat/messages`
            - `GET /api/chat/stream` (SSE stream for near real-time updates)
        - Database-backed conversation and message storage.
                - Mother chat screen now supports **Doctor Chat mode** wired to these endpoints.

---

## **System Design (Complete) for Sehat Saheli**

Below is a production-ready, interview-style system design for Sehat Saheli. It contains both high-level and low-level design decisions, tradeoffs, diagrams, and an actionable README-ready spec you can use for architecture discussions or interview prep.

**Assumptions & Scale Targets**
- Project: Sehat Saheli — maternal health companion for mothers and ASHA workers.
- Target scale (design point): 100k — 1M monthly active users (design to support spikes up to millions of users across regions).
- Peak concurrent requests: 5k — 50k depending on campaigns or emergency alerts.
- Data types: small JSON records (consent, tasks) + occasional large objects (images, videos, lab PDFs).

---

**1. REQUIREMENTS ANALYSIS**

- Functional Requirements
    - User registration, role-based access (MOTHER, ASHA, DOCTOR, ADMIN).
    - Voice/text symptom checker and AI response pipeline.
    - Save/read/update privacy consent with history & revoke support.
    - ASHA patient registry and task management.
    - Emergency SOS + location sharing + SMS alerts.
    - Offline-first client sync with conflict resolution.
    - Audit logging and secure referral flows.

- Non-Functional Requirements
    - Latency: 100–300ms for UI API calls; < 1s for AI fingerprint responses (edge+async OK).
    - Availability: 99.9% for core flows; 99.95% for notification pipelines.
    - Durability: user data persisted with backups and WAL.
    - Compliance: PII handling, encryption at rest/in transit, GDPR-like consent tracking.

- Scalability Requirements
    - Horizontal scale of stateless API servers and worker fleets.
    - Database read replicas for analytics and reporting.
    - CDN caching for static assets and some API responses.

- Availability Requirements
    - Multi-AZ deployment for DB and app tier.
    - Retry and circuit-breaker policies for external APIs (Twilio, Gemini).

- Security Considerations
    - End-to-end TLS, OAuth/JWT for API auth.
    - RBAC with least privilege.
    - WAF for API endpoints, rate limiting per IP and user.

- Latency Expectations
    - Edge responses (static/SSR): < 100ms.
    - AI responses (3rd-party): 500ms — 3s depending on model, show spinner and return cached fallback.

---

**2. HIGH LEVEL ARCHITECTURE**

Request Flow (step-by-step): Client → DNS → CDN → Load Balancer → API Gateway → Auth Layer → Microservices → Cache → DB → Object Storage

**Visual Request Flow Diagram:**

```mermaid
sequenceDiagram
    participant User as 📱 User (PWA Client)
    participant DNS as 🌍 DNS (Route53)
    participant CDN as ⚡ CDN/Edge
    participant LB as 🔀 Load Balancer
    participant APIGW as 🚪 API Gateway
    participant Auth as 🔐 Auth Service
    participant Svc as 🧠 Microservices
    participant Cache as 📦 Redis Cache
    participant DB as 💾 Database
    participant S3 as 🗂️ Object Storage

    User->>DNS: Request sehat-saheli.com
    DNS-->>User: Returns CDN/LB IP
    User->>CDN: Fetch static assets (JS/CSS/HTML)
    CDN-->>User: Cached response (< 100ms)
    User->>LB: API request (symptom check, task list)
    LB->>APIGW: Route to API Gateway
    APIGW->>Auth: Validate JWT token
    Auth-->>APIGW: User context + roles
    APIGW->>Svc: Route to microservice (Consent/Tasks/AI)
    Svc->>Cache: Check Redis for hot data
    Cache-->>Svc: Cache hit or miss
    Svc->>DB: Query/write to PostgreSQL
    DB-->>Svc: Data returned
    Svc->>S3: Upload/retrieve files if needed
    S3-->>Svc: File URL or data
    Svc-->>APIGW: Response payload
    APIGW-->>User: 200 OK + JSON
```

**Architecture Explanation:**

- **Client:** Next.js PWA (mobile-first) — interacts with Edge / CDN for static assets. Uses Service Worker for offline caching.
- **DNS:** Route53/Cloud DNS — routes domain to CDN/Load Balancer.
- **CDN:** CloudFront / Fastly / Vercel Edge — caches static assets and caches safe API responses.
- **Load Balancer:** ALB / Cloud Load Balancer — routes to API Gateway/ingress.
- **API Gateway:** Kong/NGINX/Cloud API Gateway — central auth, throttling, routing, API versioning.
- **Authentication Flow:** Client obtains token via NextAuth (cookie + JWT). API Gateway validates token signature, passes user context to services.
- **Microservices vs Monolith:** Recommended hybrid—start modular-monolith or microservices with clear Bounded Contexts: Auth, User, Consent, Tasks, AI Gateway, Notification, Analytics. Rationale: faster iteration early, incremental decomposition later.

**Components & Why:**

- **CDN:** offload static content and reduce latency.
- **Reverse proxy (NGINX on edge):** TLS termination, basic routing, and health checks.
- **API Gateway:** central policy enforcement (rate-limits, API keys), authentication enforcement.
- **AI Gateway:** shielded service that orchestrates requests to Google Gemini and caches results.
- **Cache:** Redis (session store + hot data) for short-lived reads and locks.
- **DB:** PostgreSQL primary for OLTP, with read replicas.
- **Object Storage:** AWS S3 for images, lab reports, videos.
- **Queue:** Kafka or SQS for async processing (notifications, audit ingestion, offline sync replay).

---

**3. COMPLETE SYSTEM DESIGN DIAGRAM**

```mermaid
flowchart TB
    subgraph CLIENT["📱 Client (PWA / Browser / Mobile)"]
        UI["Next.js PWA"]
        LocalDB["Local Cache / Service Worker"]
        UI --> LocalDB
    end

    subgraph EDGE["⚡ CDN / Edge"]
        CDN["CDN / Edge Cache"]
    end

    subgraph LB["🌐 Load Balancer & API Gateway"]
        LBNode["Load Balancer"]
        APIGW["API Gateway / Reverse Proxy"]
        LBNode --> APIGW
    end

    subgraph APP["🧭 Application Layer (Services)"]
        Auth["Auth Service"]
        UserSvc["User Service"]
        ConsentSvc["Consent Service"]
        TasksSvc["Tasks Service"]
        AIGateway["AI Gateway Service"]
        Notif["Notification Service"]
        FileSvc["File Service"]
    end

    subgraph INFRA["☁️ Infrastructure & Storage"]
        Postgres["Postgres Primary + Replicas"]
        Redis["Redis Cache / Session"]
        S3["Object Storage - S3 / GCS"]
        Queue["Kafka / SQS Queue"]
        Workers["Worker Pool (Consumer Group)"]
        DW["Data Warehouse (Redshift/BigQuery)"]
    end

    CLIENT -->|Requests| CDN
    CDN --> LBNode
    APIGW --> Auth
    APIGW --> UserSvc
    APIGW --> ConsentSvc
    APIGW --> TasksSvc
    APIGW --> AIGateway
    APIGW --> Notif
    APIGW --> FileSvc
    
    ConsentSvc --> Postgres
    UserSvc --> Postgres
    TasksSvc --> Redis
    AIGateway -->|async| Queue
    Notif -->|async| Queue
    FileSvc --> S3
    Queue --> Workers
    Workers --> Postgres
    Postgres --> DW
    
    classDef client fill:#e1f5ff,stroke:#01579b,color:#000
    classDef app fill:#f3e5f5,stroke:#4a148c,color:#000
    classDef infra fill:#e8f5e9,stroke:#1b5e20,color:#000
    classDef edge fill:#fff3e0,stroke:#e65100,color:#000
    
    class CLIENT client
    class EDGE edge
    class LB app
    class APP app
    class INFRA infra
```

**Diagram Explanation (Component by Component):**

- **Client Layer (PWA):** Runs Next.js PWA, caches offline data locally, performs optimistic updates via Service Worker.
- **CDN/Edge:** Caches static assets and idempotent API responses (facility directory, locale-specific content).
- **Load Balancer:** Distributes connections across multiple app instances; performs health checks for auto-scaling.
- **API Gateway:** Central hub for auth enforcement, rate limiting, request shaping, and routing to services.
- **Auth Service:** Issues short-lived JWTs + refresh tokens; integrates with identity provider (NextAuth).
- **User Service:** Manages user profiles, roles, and permissions.
- **Consent Service:** Handles privacy consent with version history, revoke flows, and audit trails.
- **Tasks Service:** ASHA task management, scheduling, and priority queuing.
- **AI Gateway Service:** Orchestrates requests to Google Gemini, caches responses by (input, locale), queues expensive operations asynchronously.
- **Notification Service:** Handles SMS (Twilio), push, and email; decoupled via queue for reliability.
- **File Service:** Manages lab reports, images, videos; issues pre-signed S3 URLs for secure uploads/downloads.
- **PostgreSQL (Primary + Replicas):** Relational data store with read replicas for dashboards and analytics; streaming replication across AZs.
- **Redis Cache:** Session store, short-lived tokens, locks for background jobs, hot data caching.
- **Object Storage (S3/GCS):** Stores large artifacts (lab PDFs, images, videos) with lifecycle rules for archival.
- **Kafka/SQS Queue:** Decouples async processing; high-throughput event streaming for audit logs, notifications, and background jobs.
- **Worker Pool:** Independently scalable consumer group processing queue tasks (sync reconciliation, transcoding, audit ingestion).
- **Data Warehouse:** ETL from primary DB via streaming; powers analytics, reporting, and ML pipelines.

**4. DATABASE DESIGN**

- Which DB & Why
    - Primary: PostgreSQL — ACID guarantees, relational joins, strong schema (consent history), and good ecosystem (Prisma).
    - Secondary: Redis — in-memory cache, session store, locks; S3 for files; Data Warehouse (BigQuery/Redshift) for analytics.

- SQL vs NoSQL
    - Use SQL (Postgres) for user records, consent history, tasks and audit logs.
    - Use NoSQL (Cassandra/DynamoDB) only if you anticipate enormous write throughput and relaxed consistency for certain telemetry; otherwise Postgres scales well with sharding and read-replicas for our use-case.

- Core Schema (high-level)
    - users (id PK, role, email, phone, name, locale, createdAt, lastSeen)
    - consents (id PK, userId FK, consentDataShare boolean, consentAiTraining boolean, version int, metadata JSONB, createdAt)
    - consent_history (id PK, consentId FK, action ENUM, actorId, snapshot JSONB, timestamp)
    - tasks (id, patientId, assignedTo, status, dueAt, metadata JSONB)
    - audit_logs (id, userId, action, resourceType, resourceId, payload JSONB, createdAt)
    - messages (id, chatRoomId, senderId, body TEXT, attachments JSONB, createdAt)

- Indexing Strategy
    - PK indexes on id.
    - Compound index on (userId, createdAt) for time window reads.
    - GIN index on JSONB (metadata) for specific searching needs.
    - Partial indexes for active tasks and unresolved referrals.

- Read-heavy vs Write-heavy Handling
    - Use read replicas for dashboards and analytics.
    - Use write-optimized primary with connection pooling (PgBouncer) and batching for bulk inserts.

- Replication, Sharding, Partitioning
    - Replication: Postgres streaming replication across AZs.
    - Sharding: Evaluate only when single-node limits reached; use application-level sharding by tenant/region.
    - Partitioning: Time-based partitioning for audit_logs and messages.

- CAP theorem
    - Postgres is CA in a single region; to handle network partitions across regions, accept eventual consistency for non-critical flows (analytics, notifications), while keeping critical flows ACID-local.

---

**5. CACHING STRATEGY**

- Redis usage
    - Session store + short-lived tokens.
    - Hot data cache (patient summary, ASHA task list) with TTLs.
    - Leader election using Redis locks for background jobs.

- Server-side cache
    - Application-level caching for expensive reads (facility lists, AI templates).

- CDN caching
    - Cache static assets and idempotent API responses like facility directory. Use Cache-Control headers and stale-while-revalidate.

- Cache invalidation
    - On write, invalidate relevant keys or publish cache-bust events via pub/sub.
    - Use cache versioning keys for global invalidation.

- Session storage
    - Redis with TTL and token rotation.

- Hot data optimization
    - Promote frequently accessed patient summaries into Redis with adaptive TTLs.

---

**6. STORAGE DESIGN**

- Object storage: AWS S3 (or GCS/Azure Blob)
    - Store lab reports, images, videos, and large artifacts.
    - Use lifecycle rules for archival (move older than 90 days to Glacier/Coldline).

- Image/video handling
    - Uploads via pre-signed URLs to S3 (server issues short-lived PUT URL).
    - Server triggers background workers for transcoding/resizing.

- Pre-signed URLs
    - Use short TTLs; respect RBAC by scoping object keys by userId/tenant.

- Compression strategy
    - Store compressed versions for large objects; periodically recompress using worker jobs.

- Backup strategy
    - DB automated snapshot daily + PITR (Point-in-Time-Recovery) for critical tables.
    - S3 cross-region replication for disaster recovery.

---

**7. LOAD BALANCING & SCALING**

- Horizontal scaling
    - Stateless API instances behind load balancer; auto-scale based on CPU/RPS/latency.

- Vertical scaling
    - Reserved for DB and other monolithic stateful services; prefer read replicas over vertical scaling when possible.

- Stateless servers
    - Push session state to Redis; store user-uploaded content in S3 to keep instances stateless.

- Auto-scaling
    - Use target tracking (e.g., keep avg CPU at 40%) and scheduled scaling for predictable peaks.

- Traffic distribution
    - Use weighted routing per region; geolocation-based DNS to route clients to nearest edge.

- Multi-region deployment
    - Deploy read-only edge cache and regionally closer app nodes; active-write region model with async cross-region replication for user data.

- Failover strategy
    - DB: promote read replica on failure.
    - DNS: Route53 health checks and failover.

---

**8. MESSAGE QUEUES / EVENT DRIVEN DESIGN**

- Pub/Sub architecture
    - Kafka for internal event streaming (high-throughput telemetry and analytics).
    - SQS (or Redis streams) for simpler job queues and retries.

- Async processing
    - Offline sync replay, notification sending, and AI batching via queues.

- Background jobs
    - Workers process tasks: file transcoding, analytics aggregation, audit ingestion.

- Retry & DLQ
    - Exponential backoff with dead-letter queue after N attempts.

---

**9. API DESIGN**

- REST API basics
    - Use consistent resource naming and versioning (`/api/v1/consent`).

- Example: Save consent
    - POST /api/v1/privacy-consent
    - Body: { userId, consentDataShare, consentAiTraining, retentionDays }
    - Responses: 200 OK + { success: true, consentId }

- Example: Revoke consent
    - POST /api/v1/privacy-consent
    - Body: { action: "revoke", userId }
    - Responses: 200 OK

- Pagination
    - Use cursor-based pagination for large lists: `GET /api/v1/patients?limit=50&cursor=abc`

- Authentication APIs
    - `POST /api/v1/auth/login` (issue access + refresh token)
    - `POST /api/v1/auth/refresh`

- Rate limiting
    - Per-IP + per-user rate limits (burst + sustained) enforced at API Gateway.

- GraphQL vs REST
    - REST is simpler for bounded endpoints. GraphQL can be added for highly-client-driven queries (dashboard) with caution on complexity and caching.

---

**10. SECURITY**

- JWT & Auth
    - Short-lived JWTs + refresh tokens stored securely; rotate refresh tokens.

- OAuth
    - Support optional OAuth providers for convenience (Google), keep server-side token handling minimal.

- API security
    - Validate input with a schema (Zod), use parameterized queries via Prisma.

- HTTPS
    - Enforce HSTS and TLS 1.2+.

- Encryption
    - Encrypt PII at rest (column-level encryption for sensitive fields) and use KMS for keys.

- Injection/XSS/CSRF
    - Use parameterized queries, escape outputs, CSRF tokens for cookie flows, Content Security Policy.

- RBAC
    - Central role-check middleware with least privilege.

---

**11. MONITORING & OBSERVABILITY**

- Logging
    - Structured logs (JSON) to a central aggregator (Elastic/Datadog/CloudWatch).

- Metrics
    - Prometheus + Grafana; track request latency, error rates, queue lag, worker throughput.

- Tracing
    - OpenTelemetry + Jaeger for distributed tracing across edge → API → AI service.

- Alerting
    - PagerDuty + Slack for incidents; SLO-based alert thresholds.

- Health checks
    - Liveness & readiness endpoints; synthetic monitoring of core flows.

---

**12. BOTTLENECKS & OPTIMIZATIONS**

- Potential bottlenecks
    - DB write spikes (audit logs) — use batching and partitioning.
    - AI third-party latency — cache responses and pre-warm frequent intents.
    - SMS provider limits — implement provider-fallback strategy.

- Solutions
    - Backpressure using queue + circuit breaker.
    - Rate-limiting & graceful degradation for non-critical features.

---

**13. INTERVIEW QUESTIONS**

- Design prompts
    - How would you design consent revocation so it is legally sound and reversible?
    - How to ensure offline-first sync preserves data correctness across multiple devices?
    - Tradeoffs of Edge AI vs centralized AI inference for medical advice?

- Tradeoffs explained
    - Edge inference reduces latency and increases privacy but incurs complexity and model size concerns.

---

**14. TECH STACK RECOMMENDATION**

- Frontend: Next.js (PWA), TypeScript, TailwindCSS
- Backend: Node.js / NestJS or Next.js Edge + API routes
- Database: PostgreSQL (primary), BigQuery/Redshift (analytics)
- Cache: Redis
- Queue: Kafka or AWS SQS + Lambda workers
- Cloud provider: AWS / GCP / Vercel for hosting front-end Edge
- DevOps: Terraform, GitHub Actions, Docker
- CI/CD: GitHub Actions (lint/test/build/deploy pipeline)

---

**15. FINAL SUMMARY**

- End-to-end lifecycle: Client → Edge → API Gateway → Services → DB / Cache → S3 → Workers → Analytics.
- Scalability summary: stateless app layer, DB replicas, queue-based async processing, CDN for static content.
- Estimated maturity: production-ready with baseline for 100k+ monthly users; incremental improvements for multi-region active-active required at >1M scale.
- Real-world comparison: architecture aligns with telemedicine platforms like Practo / telehealth smaller scale deployments.

---

If you want, I can:
- commit this README update to your local git branch and make a PR
- add a PlantUML or Mermaid diagram file (svg) into `/docs/`
- generate a shorter 1-page cheat-sheet for interview prep

File updated: [README.md](README.md)

Next step: tell me which of the follow-ups you want me to do (commit & push, add diagram file, or produce interview cheat-sheet). 


4. **Video Consultation Persistence**
    - `app/api/video-consultation/route.ts` migrated from mock-only to DB-backed CRUD.
    - Existing UI compatibility preserved while enabling persisted appointments.

5. **Performance & Offline Foundations**
    - Next.js image optimization enabled with AVIF/WebP formats.
    - Package import optimization for `lucide-react` and `recharts`.
    - Web Vitals capture hook added.
    - PWA basics added: manifest + service worker registration.

### ✅ Additional Improvements Completed (Follow-up Batch)

- **Frontend wiring completed:**
    - `app/mother/talk/page.tsx` now supports two modes:
        - `AI Saheli` (existing Gemini flow)
        - `Doctor Chat` (real-time + persisted via `/api/chat/messages` and `/api/chat/stream`)
- **API hardening completed:**
    - Added shared in-memory rate limiter utility in `lib/rate-limit.ts`.
    - Applied throttling to:
        - `/api/auth/register`
        - `/api/auth/token`
        - `/api/chat/messages`
        - `/api/chat/stream`
        - `/api/video-consultation`
    - Strengthened Zod validation for token refresh and consultation update payloads.
- **First-run developer bootstrap completed:**
    - Added Prisma seed script `prisma/seed.js`.
    - Added command: `npm run prisma:seed` for demo users/chat/consultation data.

### New Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."
AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GEMINI_API_KEY=""
```

### Setup Commands

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

---

## 🎯 Suggested Frontend Improvements (Next Phase)

### 🎨 Design & UX Enhancements
- **Auth System**: User login/signup with role-based access (Mother, ASHA, Doctor)
- **Persistent State**: Redux/Zustand for app-wide state management
- **PWA Offline Mode**: Full offline capability with service workers & sync
- **Dark Mode**: Enable dark/light theme toggle with system preference detection
- **Animations**: Micro-interactions (smooth page transitions, button feedback)
- **Mobile-First**: Bottom navigation for mobile, sidebar for desktop
- **Accessibility**: WCAG AAA compliance, screen reader support, keyboard navigation
- **Internationalization**: i18n setup for multi-language switching

### 📊 Feature Enhancements
- **Charts & Graphs**: Trend visualization for health metrics (Recharts/Chart.js)
- **Notifications**: Push notifications for appointments & alerts
- **Calendar Integration**: Google Calendar sync for doctor appointments
- **File Upload**: Report upload with drag-drop support
- **Real-time Chat**: Doctor-patient messaging system
- **Video Call**: In-app video consultation (Jitsi/Agora.io)
- **AR Medical Guide**: Augmented Reality for exercises/techniques
- **Gamification**: Badges & streaks for completing health tasks

### ⚡ Performance Optimization
- **Code Splitting**: Dynamic imports for route-based bundles
- **Image Optimization**: Next.js Image with WebP format & lazy loading
- **CSS Optimization**: Critical CSS extraction, unused CSS removal
- **Caching Strategy**: Service worker caching patterns (stale-while-revalidate)
- **Monitoring**: Sentry for error tracking, Web Vitals monitoring
- **Testing**: Vitest for unit tests, Playwright for E2E tests (target: >80% coverage)

---

## 🔧 Suggested Backend Improvements (Next Phase)

### 🗄️ Data & Database
- **Database**: PostgreSQL/MongoDB for persistent data storage
- **Real-time Sync**: Socket.io for live updates (task assignments, chat)
- **Caching Layer**: Redis for session management & frequent queries
- **Data Backup**: Automated backups with disaster recovery
- **Data Privacy**: HIPAA compliance, encryption at rest & in transit

### 🔐 Security & Authentication
- **Auth**: JWT + refresh tokens for stateless authentication
- **OAuth**: Google/Apple sign-in integration
- **2FA**: Two-factor authentication for sensitive actions
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Zod/Yup for schema validation
- **CORS**: Proper CORS policies for cross-origin access

### 🤖 AI & ML Features
- **Doctor Matching**: Algorithm to suggest relevant specialists
- **Predictive Analytics**: Risk scoring model (training with anonymized data)
- **NLP Improvements**: Better language understanding for Hindi/Odia
- **Sentiment Analysis**: Detect anxiety/depression from text
- **Recommendation Engine**: Personalized health tips based on pregnancy stage

### 📱 API & Integration
- **RESTful API**: Full REST API with OpenAPI/Swagger documentation
- **GraphQL**: Optional GraphQL endpoint for flexible queries
- **Webhooks**: Third-party integrations (SMS, email, calendar)
- **GIS Integration**: Map-based ASHA worker/hospital finder
- **Telemedicine**: Doctor profiles, scheduling, video call APIs
- **Government APIs**: Integration with HMIS/NVHP databases

### 📊 Analytics & Monitoring
- **Analytics**: Mixpanel/Segment for user behavior tracking
- **Error Tracking**: Sentry for production error monitoring
- **APM**: Application performance monitoring (New Relic/DataDog)
- **Logs**: Centralized logging (ELK Stack/Cloudwatch)
- **Metrics**: Prometheus for system metrics

### 🧪 Quality Assurance
- **Unit Tests**: Jest for backend logic testing
- **Integration Tests**: Database tests with fixtures
- **Load Testing**: k6/JMeter for stress testing
- **API Tests**: Postman/REST Client collections
- **Security Testing**: OWASP scanning & dependency audits

---

## 🔮 Future Roadmap (Extended)

---

## 👥 The Team

Built with ❤️ by **Team Sehat Saheli**

*   👨‍💻 **Aryan Bhargava** - Full Stack & AI Lead &nbsp; [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/aryanb1906) [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/aryan-bhargava)
*   👨‍💻 **Naman Surana** - Frontend & UX Lead &nbsp; [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/newman05) [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/naman-surana-work)
*   👨‍💻 **Vaidik** - Backend & Architecture Lead &nbsp; [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/Vaidik-7781) [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/vaidik-gupta-ss2311383/)
*   👩‍💻 **Shrinkhala** - Research & ML Lead &nbsp; [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/Shrinkhalaa27) [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/shrinkhala-anand-484998274/)
*   👩‍💻 **Aryan Kumar** - Backend & UI/UX &nbsp; [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/Aryankumar102907) [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/aryankumar102907/)

---
