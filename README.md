# 🏥 ClinIQ — Real-Time Clinical Intelligence Platform

> AI-powered hospital operations intelligence with real-time monitoring, clinical decision support, and predictive analytics.

![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite)
![WebSocket](https://img.shields.io/badge/WebSocket-Real--Time-4A90D9)

---

## ✨ Key Features

### 🔴 Real-Time Intelligence
- **Hospital Command Center** — Live operational dashboard with KPI stats, patient distribution charts, and doctor workload visualization
- **Live Vital Monitoring** — Real-time patient vital signs with threshold alerts and trend charts (HR, SpO2, BP, Respiratory Rate)
- **WebSocket Event Stream** — Instant propagation of clinical events, alerts, and status changes across all connected clients
- **Critical Patient Priority Queue** — Auto-ranked patient queue based on risk scores and triage priority
- **Live Alert System** — Toast notifications + slide-out alert panel with acknowledge functionality

### 🧠 AI Clinical Decision Support
- **AI Clinical Copilot** — Symptom analysis, differential diagnosis, and treatment recommendations
- **Risk Prediction Engine** — Real-time patient deterioration risk scoring with trend tracking
- **AI Insights Panel** — Automated clinical insights with suggested actions and risk factor analysis
- **Treatment Recommendations** — Evidence-based treatment suggestions
- **Drug Interaction Checker** — Multi-drug interaction analysis with severity classification

### 📊 Analytics & Operations
- **Triage System** — Automated severity calculation with ESI-based scoring
- **Case Similarity Search** — Find similar patient cases for clinical reference
- **Treatment Outcome Prediction** — ML-based outcome probability analysis
- **Doctor Workload Analysis** — Staff capacity monitoring with patient load distribution
- **Staff Activity Tracking** — Real-time feed of clinical activities

### 🏗️ Platform Features
- **Role-Based Dashboards** — Tailored views for Doctors, Nurses, and Patients
- **Auto-Hide Navigation** — Collapsible sidebar with grouped menu categories, appears on hover
- **Patient Timeline** — Complete clinical journey visualization
- **Follow-Up Care Management** — Appointment scheduling and medication reminders
- **Hospital Insights** — Department statistics and operational metrics

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────┐
│              React Frontend (Vite)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Dashboard │ │ Command  │ │  Live Vital      │ │
│  │          │ │ Center   │ │  Monitor         │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│  ┌──────────────────────────────────────────┐   │
│  │     WebSocket Context (Real-Time)        │   │
│  └──────────────────────────────────────────┘   │
└──────────────┬──────────────────────────────────┘
               │ HTTP REST + WebSocket
┌──────────────▼──────────────────────────────────┐
│           FastAPI Backend (Python)               │
│  ┌────────────┐ ┌────────────┐ ┌──────────────┐ │
│  │   REST API  │ │  WebSocket │ │  Alert       │ │
│  │  Endpoints  │ │  Manager   │ │  Engine      │ │
│  └────────────┘ └────────────┘ └──────────────┘ │
│  ┌────────────┐ ┌────────────┐ ┌──────────────┐ │
│  │   Risk      │ │  Event     │ │  Vitals      │ │
│  │  Recalc     │ │  Stream    │ │  Monitor     │ │
│  └────────────┘ └────────────┘ └──────────────┘ │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│              SQLite Database                     │
│  patients │ vitals │ alerts │ clinical_events    │
│  risk_history │ staff_activity │ medications     │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **npm** or **yarn**

### 1. Clone & Setup Backend

```bash
git clone https://github.com/MR-WHOAMEYE/tetherX-hackathon-01.git
cd tetherX-hackathon-01

# Install Python dependencies
pip install fastapi uvicorn

# Start the backend server
python app.py
```

The API server starts at `http://localhost:8000`

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app opens at `http://localhost:5173`

### 3. Login

| Role    | Username     | Password   |
|---------|-------------|------------|
| Doctor  | `dr.chen`   | `password` |
| Nurse   | `nurse.ada` | `password` |
| Patient | `p.smith`   | `password` |

---

## 📁 Project Structure

```
tetherX-hackathon-01/
├── app.py                          # FastAPI main server + all endpoints
├── database/
│   ├── db.py                       # SQLite schema (11 tables)
│   └── seed_data.py                # Sample data generator
├── services/
│   ├── websocket_manager.py        # WebSocket connection manager
│   ├── event_stream_service.py     # Clinical event logging
│   ├── alert_engine.py             # Vital/risk threshold alerting
│   ├── vitals_monitor_service.py   # Live vitals querying
│   ├── activity_tracker.py         # Staff action tracking
│   ├── risk_recalculation_service.py # Risk scoring + priority queue
│   ├── copilot_service.py          # AI clinical copilot
│   ├── risk_service.py             # Risk prediction engine
│   ├── triage_service.py           # Triage severity calculator
│   ├── drug_service.py             # Drug interaction checker
│   ├── similarity_service.py       # Case similarity search
│   ├── recommendation_service.py   # Treatment recommendations
│   ├── outcome_service.py          # Outcome prediction
│   ├── dashboard_service.py        # Hospital metrics
│   └── ...
├── frontend/
│   └── src/
│       ├── App.jsx                 # Root with WebSocket provider
│       ├── api.js                  # API client (35+ endpoints)
│       ├── context/
│       │   └── WebSocketContext.jsx # Real-time state management
│       ├── components/
│       │   ├── Sidebar.jsx         # Auto-hide collapsible nav
│       │   ├── LiveEventStream.jsx # Real-time event feed
│       │   ├── PatientPriorityQueue.jsx
│       │   ├── AIInsightsPanel.jsx
│       │   ├── AlertNotification.jsx
│       │   ├── StaffActivityFeed.jsx
│       │   └── WorkloadAnalysis.jsx
│       └── pages/
│           ├── CommandCenter.jsx   # Hospital operations hub
│           ├── LiveVitalMonitor.jsx # Patient vital trends
│           ├── Dashboard.jsx
│           ├── ClinicalCopilot.jsx
│           └── ...
└── README.md
```

---

## 🔌 API Endpoints

### Real-Time
| Method | Endpoint | Description |
|--------|----------|-------------|
| WS | `/ws/events` | WebSocket stream for live events |
| GET | `/api/events` | Recent clinical events |
| GET | `/api/alerts` | Active alerts |
| PUT | `/api/alerts/{id}/acknowledge` | Acknowledge an alert |
| GET | `/api/staff-activity` | Staff action feed |

### Command Center
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/command-center/metrics` | KPI metrics |
| GET | `/api/command-center/priority-queue` | Critical patient queue |
| GET | `/api/command-center/workload` | Doctor workload analysis |
| GET | `/api/ai-insights` | AI clinical insights |

### Vitals & Risk
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vitals/{id}/live` | Latest vitals for a patient |
| GET | `/api/vitals/{id}/trend` | Vitals trend data |
| GET | `/api/risk/{id}/history` | Risk score history |
| POST | `/api/vitals` | Record vitals (triggers real-time pipeline) |

### Clinical Decision Support
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/copilot/analyze` | AI symptom analysis |
| GET | `/api/triage/all` | Triage all patients |
| GET | `/api/risk/{id}` | Risk prediction |
| POST | `/api/recommendations` | Treatment recommendations |
| POST | `/api/drugs/check` | Drug interaction check |
| GET | `/api/similarity/{id}` | Similar case search |
| GET | `/api/outcomes/{id}` | Outcome prediction |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Recharts, Lucide Icons |
| Backend | Python FastAPI, Uvicorn |
| Database | SQLite |
| Real-Time | WebSocket (FastAPI native) |
| Styling | Vanilla CSS (DM Sans + Space Grotesk) |

---

## 👥 Meet the Team

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Thanveer265">
        <img src="https://github.com/Thanveer265.png" width="100px;" alt="Thanveer265"/>
        <br /><sub><b>Thanveer T</b></sub>
      </a>
      <br />Frontend Development
    </td>
    <td align="center">
      <a href="https://github.com/Akshaykumar-B">
        <img src="https://github.com/Akshaykumar-B.png" width="100px;" alt="Akshaykumar-B"/>
        <br /><sub><b>Akshaykumar-B</b></sub>
      </a>
      <br />Database Designer
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/MR-WHOAMEYE">
        <img src="https://github.com/MR-WHOAMEYE.png" width="100px;" alt="MR-WHOAMEYE"/>
        <br /><sub><b>MR-WHOAMEYE</b></sub>
      </a>
      <br />Backend & Deployment
    </td>
    <td align="center">
      <a href="https://github.com/mohan-kumar-12">
        <img src="https://github.com/mohan-kumar-12.png" width="100px;" alt="mohan-kumar-12"/>
        <br /><sub><b>mohan-kumar-12</b></sub>
      </a>
      <br />Project Integration
    </td>
  </tr>
</table>

---

*Built with ❤️ by Zero Intercept Team for improved healthcare operations and patient outcomes.*
