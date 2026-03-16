# Veritas AI / Recruiter AI - Full Project Report

## 1. Abstract / Introduction

In the contemporary recruitment landscape, organizations grapple with the logistical complexities of high-volume hiring, while candidates often face anxiety and a lack of constructive feedback. To mitigate these challenges, we present **Veritas AI** (also known as **RecruiterAI**), an autonomous interview simulation platform. By harnessing the capabilities of state-of-the-art Large Language Models (LLMs) and low-latency voice synthesis, Veritas AI orchestrates realistic, spoken technical assessments.

The system mimics a human recruiter's adaptability, probing candidate responses in real-time and delivering granular, objective performance metrics. Unlike traditional static assessment tools, Veritas AI creates a dynamic conversational environment using Vapi for voice orchestration and HeyGen/Simli for visual presence, offering a scalable solution to modernize talent acquisition and democratize interview preparation.

## 2. Problem Statement & Objectives

### Problem Statement
A significant gap exists in the recruitment ecosystem: candidates lack accessible avenues for realistic, voice-based interview practice, while employers struggle to scale their screening processes without compromising quality. Existing tools often fail to replicate the nuance of a spoken dialogue, relying instead on static text inputs or asynchronous video recordings. There is a critical need for a synchronous, interactive system capable of evaluating technical competency through natural conversation.

### Primary Objectives
- **Automate Preliminary Screening**: Deploy AI agents to conduct full-length technical interviews.
- **Provide Real-Time Conversational AI**: Utilize advanced NLP and voice AI to maintain a natural dialogue flow.
- **Generate Actionable Insights**: Automatically analyze candidate responses, providing scores and insights to help recruiters make faster decisions.
- **Enhance Candidate Experience**: Offer candidates a structured, interactive practice environment without human bias.

## 3. System Architecture & Tech Stack

Veritas AI is engineered on a modern, microservices-inspired architecture spanning Frontend, Service, and Data layers.

### 3.1 Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Programming Language:** JavaScript / TypeScript (JSX/TSX)
- **Styling:** Tailwind CSS 4 & Framer Motion for animations
- **UI Components:** Radix UI & Lucide React
- **Database & Authentication:** Supabase (PostgreSQL)
- **Voice AI Orchestration:** Vapi AI Web SDK (Low-latency voice interactions)
- **Visual Avatars:** HeyGen Streaming Avatars & Simli React (Lip-synced visual AI)
- **LLM Engine:** OpenAI GPT-4o SDK (Contextual understanding and evaluation)

### 3.2 Database Schema (Supabase)
- **`profiles`**: Extends standard Auth data for specific user contexts.
- **`mock_interviews`**: Stores specific metadata for individual interview sessions (job role, required tech stack, duration).
- **`user_answers`**: Archives specific Q&A pairs along with AI-generated feedback and scoring for granular review.

## 4. Implementation Details & Key Features

### 4.1 Key Features
- **Interactive AI Avatars**: Lifelike visual interviewers that engage candidates through facial mapping and lip-syncing.
- **Real-Time Voice Interaction**: Utilizing Vapi, the app completely eliminates awkward pauses, effectively managing the turn-taking logic common in human interactions.
- **AI-Powered Assessments**: Evaluates candidate answers using OpenAI, immediately generating an analytical scorecard.
- **Recruiter Dashboard**: A centralized control panel providing access to schedule new interviews, view team/candidate performance, and handle billing details.

### 4.2 Modular Frontend Engineering
- Built using **Next.js App Router**, splitting the presentation state cleanly:
  - `app/page.js`: Implements the premium Landing Page, relying on an interactive `Hero` component.
  - `app/(main)`: The authenticated routing layer containing core logic like dashboards, scheduling forms, and historical data tables.
  - `app/interview/[interview_id]`: The dynamic conversational core rendering the live avatar and capturing real-time microphone permissions and data streams.

## 5. User Flow

1. **Authentication:** The user (recruiter/candidate) logs into the platform (facilitated natively via Supabase Auth).
2. **Dashboard Navigation:** Upon entry, the user reaches the `/(main)/dashboard`. Here, they can review overall platform usage and past candidate analytics.
3. **Interview Configuration:** The user navigates to `/(main)/schedule-interview` to configure the technical requirements, job role, and time duration for the upcoming assessment.
4. **Live Assessment:** The candidate receives a link directing them to `/interview/[interview_id]`.
    - Verification of camera and microphone access.
    - Connection to Vapi AI stream.
    - The AI Avatar initiates the technical or behavioral assessment.
5. **Feedback Generation:** Upon completion, the candidate's transcript is sent to the OpenAI backend route for processing.
6. **Report Review:** The results are stored in the `user_answers` table and visually populated in the Recruiter’s `/(main)/all-interview` analytics tab.

## 6. Future Scope & Conclusion

### Conclusion
Veritas AI stands as a testament to the transformative power of generative AI in professional development and human resources. By successfully integrating voice synthesis, natural language processing, visual avatars, and real-time interactivity, the platform offers a unique solution to the long-standing problem of qualitative candidate screening at scale.

### Future Work
- **Multilingual Capabilities:** Expand the voice and NLP models to assess candidates in multiple regional languages.
- **Behavioral & Sentiment Analysis:** Utilize camera streams and voice intonation to evaluate candidate stress levels, confidence, and soft skills automatically.
- **Live Coding Sandbox:** Embed an online code execution environment into the interview interface, allowing the AI to conduct algorithmic rounds and check real-time compilation logic.
- **Enterprise Integrations:** Develop robust REST APIs to seamlessly push interview results into leading corporate ATS and HRMS platforms.
