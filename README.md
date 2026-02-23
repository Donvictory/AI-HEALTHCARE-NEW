# 🩺 DriftCare NG - Next-Gen Health Intelligence

DriftCare NG is a premium, AI-powered health monitoring and "drift detection" platform designed to help users track their adaptive capacity and detect subtle shifts in their health patterns before they become critical issues. Built specifically with localized health contexts (such as Lagos, Nigeria) in mind, it combines modern data visualization with an intuitive AI health companion.

## ✨ Key Features

### 🏥 Clinical Interoperability (Winning Points)

- **FHIR Alignment**: Data structure is modeled after **HL7 FHIR** standards for global interoperability, ensuring data is ready for professional medical environments.
- **SBAR Protocol**: Clinical exports and AI summaries follow the professional **SBAR standard** (Situation, Background, Assessment, Recommendation) to improve doctor-patient communication.
- **Ecosystem Ready**: Built-in hooks and visual interfaces for future integration with Nigerian EMR giants like **Helium Health**, **Heala**, and **AXA Mansard**.
- **Nearby Care Context**: Live geolocation-based integration to find and share health summaries with the closest care facilities in real-time.

### 📊 Advanced Health Analytics

- **Wellness Index Trend**: A high-impact composite trend line that averages sleep, mood, activity, and hydration to show your overall health trajectory.
- **Biometric Trajectory Graph**: Professional-grade multi-series charts that correlate Resilience, Mood, and Stress impact over 7 days.
- **Resilience Tank**: A visual "energy meter" that indicates your current adaptive capacity based on recent biometric data.
- **Drift Analysis Gauge**: AN AI-driven indicator that detects when your daily health patterns are "drifting" away from your optimal baseline.

### 🤖 AI Health Companion

- **Context-Aware Chat**: An intelligent health companion that understands symptoms, provides hydration reminders, and offers stress management tips tailored to your lifestyle.
- **Drift Alerts**: Automatic warnings and recommendations generated when significant negative shifts are detected in your health metrics.

### 📝 Smart Daily Logging

- **Multi-Step Check-In**: A friction-less flow to log sleep quality, stress levels, mood, movement, and hydration.
- **Symptom Tracking**: Easy selection of common symptoms to build a longitudinal medical history.
- **Medical Report Vault**: Option to upload and store medical reports locally for patterns analysis.

### 🎮 Gamified Motivation

- **Health Points System**: Earn points for consistently checking in and completing daily wellness challenges.
- **Daily Challenges**: Curated tasks like "15-minute morning stretch" or "Drink 8 glasses of water" to build healthy habits.

## 🛡️ Privacy & Security

- **Local-First Architecture**: Your health data belongs to you. DriftCare stores all biometric records, chat history, and profile information **locally** on your device.
- **No Cloud Tracking**: No biometric data is sent to external servers, ensuring 100% privacy for your personal health journey.

## 🚀 Tech Stack

- **Frontend**: React.js with Vite
- **Styling**: Tailwind CSS & Vanilla CSS (Modern Glassmorphism)
- **Animations**: Framer Motion
- **Charts**: Recharts (High-fidelity custom implementations)
- **Icons**: Lucide React
- **State Management**: LocalStorage persistence with custom hooks

## 🛠️ Getting Started

### Prerequisites

- Node.js (v16.0 or higher)
- npm or yarn

### Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/ai-healthcare.git
    cd ai-healthcare/client
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Run in development mode**:
    ```bash
    npm run dev
    ```

## 📈 Roadmap

- [ ] Integration with wearable IoT health devices.
- [ ] Multi-user profile support on a single device.
- [ ] Advanced predictive analytics using machine learning models.
- [x] Exportable SBAR clinical summaries for doctor consultations.
- [x] HL7 FHIR-aligned data structures for EMR interoperability.

---

_Created with ❤️ for a healthier future._
