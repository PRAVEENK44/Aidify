# Aidify - AI-Powered Emergency Medical Assistant

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-8E75B2?style=flat&logo=google-gemini&logoColor=white)](https://ai.google.dev/)

**Aidify** is a state-of-the-art emergency medical response platform that leverages Artificial Intelligence to provide immediate first-aid guidance and monitoring when seconds matter most.

---

## Features

### AI-Powered Injury Analysis
- **Multi-modal Analysis**: Upload photos of injuries for instant recognition using Google Gemini AI.
- **RAG Integration**: Retrieval-Augmented Generation provides scientifically-backed first-aid steps tailored to the specific injury detected.
- **Visual Guidance**: Step-by-step instructions with clear indicators.

### Emergency Response
- **Fall Detection**: Real-time monitoring and automatic emergency triggers using advanced algorithms.
- **108 Integration**: Direct connection to emergency services with location sharing.
- **Emergency Contacts**: Automated notifications to your emergency contacts during incidents.

### Medical Profile & QR Systems
- **Secure Medical Vault**: Encrypted storage for medical history, allergies, and medications.
- **First-Responder QR**: Unique QR codes providing first responders instant access to critical life-saving information.

### Accessibility & UI
- **Voice Commands**: Hands-free operation for urgent situations.
- **Vibrant Modern UI**: Premium design with glassmorphism, micro-animations, and full dark-mode support.

---

## Tech Stack

- **Core**: [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **Backend/Auth**: [Supabase](https://supabase.com/)
- **AI Engine**: [Google Gemini Pro Vision](https://ai.google.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## Quick Start

### 1. Prerequisites
- Node.js (v18+)
- Supabase Account
- Google AI Studio API Key

### 2. Installation
```bash
git clone https://github.com/PRAVEENK44/Aidify.git
cd Aidify
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Database Initialization
Run the SQL found in [`create_emergency_tables.sql`](create_emergency_tables.sql) in your Supabase SQL Editor to set up the required schema.

### 5. Launch
```bash
npm run dev
```

---

## Security & Privacy

Aidify is built with privacy-first principles.
- **Data Encryption**: All medical data is stored with secondary encryption layers.
- **Anonymized AI**: Image data sent for AI analysis is processed without personal identifiers.
- **Compliant**: Designed with medical data privacy best practices in mind.

---

## License & Disclaimer

**License**: Distributed under the MIT License. See `LICENSE` for more information.

> [!WARNING]
> **Medical Disclaimer**: Aidify is an educational tool and first-aid assistant. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. In a life-threatening emergency, call emergency services (108) immediately.
