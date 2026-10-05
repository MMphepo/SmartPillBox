# Smart Pill Box API

FastAPI service that persists the React app's patient, dose, alert, device
telemetry, and intervention data in PostgreSQL. It is configured for Neon using
`DATABASE_URL`; the connection string is never committed to the repository.

## Run locally

From this directory, create and activate a virtual environment, install
dependencies, and set environment variables:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Set `DATABASE_URL` in `.env` to the Neon connection string and set
`CORS_ORIGINS` to the React app's origin. The backend loads this `.env` file
automatically when the app starts. Then run:

```powershell
uvicorn app.main:app --reload
```

The service creates its tables on startup. Interactive API documentation is
available at `http://localhost:8000/docs`; `GET /health` is a database-free
liveness check.

The first frontend connection calls `POST /api/bootstrap`. It creates the
initial demo dataset only when the patients table is empty; subsequent starts
load the database through `GET /api/state`. All later UI changes are written
through the corresponding `/api` endpoints.

## Configuration

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Neon PostgreSQL URL. `postgresql://` and `postgres://` URLs are automatically configured for psycopg 3. |
| `CORS_ORIGINS` | No | Comma-separated browser origins. Defaults to localhost Vite/preview origins. |

This API currently inherits the React application's demo authentication
limitations and does not authorize individual requests. Do not expose it to
untrusted networks or use it for real patient data until server-side
authentication and role-based authorization are added.
