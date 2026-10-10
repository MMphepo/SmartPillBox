# Malawi Ministry of Health — Smart Pill Box System

The **Smart Pill Box System** is a digital TB treatment adherence portal built for the Malawi Ministry of Health (MoH). It provides automated medication monitoring, real-time clinical triage, patient engagement, and programme-level reporting across health facilities in Malawi.

---

## 🏛️ System Architecture

The repository is structured into **three independent microservices**:

```text
                         ┌─────────────────────┐
                         │      FRONTEND       │
                         │ React / TanStack    │
                         └──────────┬──────────┘
                                    │ HTTPS / REST
                                    ▼
                         ┌─────────────────────┐
                         │    MAIN BACKEND     │
                         │ FastAPI (Port 8000) │
                         │ Auth + App Logic    │
                         └───────┬───────┬─────┘
                                 │       │
                 PostgreSQL      │       │ REST API
                 Data            │       │ (Port 8001)
                                 ▼       ▼
                       ┌─────────────┐   ┌──────────────┐
                       │ PostgreSQL  │   │ Arduino      │
                       │ App DB      │   │ Server API   │
                       └─────────────┘   └──────┬───────┘
                                                │
                                                │ HTTP
                                                ▼
                                         ┌──────────────┐
                                         │   Gateway    │
                                         │ Python       │
                                         └──────┬───────┘
                                                │ Serial
                                                ▼
                                         ┌──────────────┐
                                         │   Arduino    │
                                         │ Smart Box    │
                                         └──────────────┘
```

### Key Architectural Rules
- **Frontend** communicates solely with the **Main Backend API** (Port 8000). It never calls the Arduino Server or hardware directly.
- **Main Backend** manages application data, JWT authentication, authorization, and retrieves hardware events via the **Arduino Server API** (`http://localhost:8001`).
- **Arduino Hardware** communicates via Serial to the **Python Gateway**, which posts hardware events to the **Arduino Server**.
- **Data Isolation:** Each service maintains its own persistence layer without direct cross-database access.

---

## 📦 Services Breakdown

### 1. Frontend (`/src`)
- Built with **React**, **TanStack Start**, **TanStack Router**, **TanStack Query**, and **Tailwind CSS**.
- Follows institutional government healthcare design principles ("Information first. Decoration second.").
- Implements role-based application shells:
  - **Health Worker Portal:** Patient enrollment, schedule configuration, clinical triage, alert resolution, field intervention logging (`/health-worker/*`).
  - **Patient Portal:** Personal adherence calendar, treatment schedule, support requests (`/patient/*`).
  - **District & Zone Officer Portal:** Programme-level adherence statistics, facility performance, aggregated reporting (`/district-officer/*`).

### 2. Main Backend (`/Backend`)
- Built with **FastAPI** on **Port 8000**.
- **Authentication & Authorization:** Secure password hashing with `bcrypt`, JWT access tokens, and role-based endpoint protection.
- **REST APIs:**
  - `POST /api/auth/login` & `POST /api/auth/register`
  - `GET /api/auth/me`
  - `GET /api/patients` & `POST /api/patients`
  - `PATCH /api/patients/{id}` (dosing schedule & treatment updates)
  - `PUT /api/doses/{patient_id}/{date}`
  - `GET /api/alerts` & `PATCH /api/alerts/{id}`
  - `POST /api/interventions`
  - `GET /api/devices/{device_id}/events` (triggers on-demand sync from Arduino Server)
  - `GET /api/district/dashboard` (aggregated district statistics)

### 3. Arduino IoT Service (`/Arduino/Server`)
- **Arduino Server:** FastAPI service on **Port 8001** that receives and persists raw smart box events (`pillbox_events`).
  - `POST /api/events` (ingests `DOSE_TAKEN`, `MISSED_DOSE`, `LOW_BATTERY`, `MEDICATION_REMINDER`).
  - `GET /api/events` (serves events filtered by `device_id` to the Main Backend).
- **Python Gateway (`gateway.py`):** Listens to serial communications from the physical or simulated Arduino box and transmits events to the Arduino Server over HTTP.

---

## ⚙️ Environment Configuration

Set up environment configuration in your local environment files or `.env`:

### Main Backend (`Backend/.env`)
```ini
DATABASE_URL=postgresql://user:password@localhost:5432/tb_portal_db
JWT_SECRET=your-secure-jwt-secret-key
CORS_ORIGINS=http://localhost:5173,http://localhost:4173
ARDUINO_SERVER_URL=http://localhost:8001
```

### Arduino Server (`Arduino/Server/.env`)
```ini
DATABASE_URL=postgresql://user:password@localhost:5432/arduino_iot_db
```

### Arduino Gateway (`Arduino/Server/.env`)
```ini
ARDUINO_SERIAL_PORT=COM11
ARDUINO_BAUD_RATE=9600
ARDUINO_SERVER_URL=http://127.0.0.1:8001/api/events
DEVICE_ID=ZOMBA-042
```

### Frontend (`.env`)
```ini
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 🇲🇼 Database Seeder (Malawian Test Data)

The repository includes a database CLI seeder in `Backend/app/seed.py` that populates the database with realistic test accounts, enrolled patients, dose histories, alerts, and field interventions featuring local Malawian names and facilities.

### Run the Seeder Command:
```bash
PYTHONPATH=Backend python Backend/app/seed.py --reset
```

### Pre-seeded Accounts:
| Role | Username | Password | Full Name | Facility | District |
| --- | --- | --- | --- | --- | --- |
| **Health Worker** | `hsa.chimwemwe` | `password123` | Chimwemwe Phiri | Zomba Central Hospital | Zomba |
| **Health Worker** | `hsa.kondwani` | `password123` | Kondwani Banda | Bwaila Hospital | Lilongwe |
| **District Officer** | `do.memory` | `password123` | Dr. Memory Chisale | Zomba DHO | Zomba |
| **District Officer** | `do.blessings` | `password123` | Dr. Blessings Kamanga | Lilongwe DHO | Lilongwe |
| **Patient** | `pat.grace` | `password123` | Grace Banda | Zomba Central Hospital | Zomba |
| **Patient** | `pat.tadala` | `password123` | Tadala Tembo | Bwaila Hospital | Lilongwe |
| **Patient** | `pat.chisomo` | `password123` | Chisomo Nyirenda | Queen Elizabeth Central Hospital | Blantyre |
| **Patient** | `pat.limbani` | `password123` | Limbani Moyo | Mzuzu Central Hospital | Mzimba |

---

## 🚀 Running the Services Locally

1. **Install Dependencies:**
   - **Frontend:** `bun install` (or `npm install`)
   - **Backend & Arduino Services:** `pip install -r Backend/requirements.txt`

2. **Start Main Backend (Port 8000):**
   ```bash
   cd Backend
   python -m uvicorn app.main:app --reload --port 8000
   ```

3. **Start Arduino Server (Port 8001):**
   ```bash
   cd Arduino/Server
   python -m uvicorn server:app --reload --port 8001
   ```

4. **Start Frontend Dev Server:**
   ```bash
   bun run dev
   ```

5. **Start Arduino Serial Gateway (Optional):**
   ```bash
   python Arduino/Server/gateway.py
   ```

---

## 🧪 Automated Testing

Run the end-to-end integration test suite covering authentication, patient enrollment, schedule modification, Arduino event ingestion, and district aggregated reporting:

```bash
python3 tests/test_integration.py
```
