import os
import sys
import unittest
from fastapi.testclient import TestClient

# Add paths
sys.path.insert(0, os.path.abspath("Backend"))
sys.path.insert(0, os.path.abspath("Arduino/Server"))

TEST_DB_FILE = os.path.abspath("test_integration.db")
if os.path.exists(TEST_DB_FILE):
    os.remove(TEST_DB_FILE)

os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_FILE}"
os.environ["JWT_SECRET"] = "test-jwt-secret-key"

from app.main import app as main_app
from app.database import Base as MainBase, get_engine as get_main_engine, get_session_factory as get_main_session_factory
from app.main import _seed_users
from server import app as arduino_app
from database import Base as ArduinoBase, engine as arduino_engine


class TestEndToEndIntegration(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        MainBase.metadata.create_all(bind=get_main_engine())
        ArduinoBase.metadata.create_all(bind=arduino_engine)

        with get_main_session_factory()() as session:
            _seed_users(session)

        cls.main_client = TestClient(main_app)
        cls.arduino_client = TestClient(arduino_app)

    @classmethod
    def tearDownClass(cls):
        if os.path.exists(TEST_DB_FILE):
            os.remove(TEST_DB_FILE)

    def test_01_authentication_flow(self):
        # 1. Register new patient
        reg_resp = self.main_client.post("/api/auth/register", json={
            "username": "test.patient",
            "password": "password123",
            "name": "Test Patient",
            "role": "patient",
            "facility": "Zomba Central Hospital"
        })
        self.assertEqual(reg_resp.status_code, 201)
        data = reg_resp.json()
        token = data["accessToken"]
        self.assertTrue(token)

        # 2. Login
        login_resp = self.main_client.post("/api/auth/login", json={
            "username": "test.patient",
            "password": "password123",
            "role": "patient"
        })
        self.assertEqual(login_resp.status_code, 200)
        self.assertEqual(login_resp.json()["user"]["username"], "test.patient")

        # 3. Access protected route with token
        me_resp = self.main_client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(me_resp.status_code, 200)
        self.assertEqual(me_resp.json()["username"], "test.patient")

        # 4. Access protected route without token -> 401
        fail_resp = self.main_client.get("/api/auth/me")
        self.assertEqual(fail_resp.status_code, 401)

    def test_02_patient_enrollment_and_schedule(self):
        # Login as seed health worker
        hw_login = self.main_client.post("/api/auth/login", json={
            "username": "hsa.chimwemwe",
            "password": "password123",
            "role": "health_worker"
        })
        hw_token = hw_login.json()["accessToken"]
        hw_headers = {"Authorization": f"Bearer {hw_token}"}

        # Enrol patient with box_id = ZOMBA-042
        enroll_resp = self.main_client.post("/api/patients", json={
            "id": "pat-e2e-1",
            "name": "E2E Test Patient",
            "age": 34,
            "sex": "Female",
            "facility": "Zomba Central Hospital",
            "phase": "Intensive",
            "treatmentDay": 12,
            "boxId": "ZOMBA-042",
            "battery": 95,
            "guardianId": "g-01",
            "hsaId": "hsa-01",
            "phone": "+265999000111",
            "regimen": "2RHZE/4RH",
            "doseTime": "08:00",
            "doseTimes": ["08:00"]
        }, headers=hw_headers)
        self.assertEqual(enroll_resp.status_code, 201)

        # Retrieve patient
        get_p = self.main_client.get("/api/patients/pat-e2e-1", headers=hw_headers)
        self.assertEqual(get_p.status_code, 200)
        self.assertEqual(get_p.json()["boxId"], "ZOMBA-042")

        # Update dose schedule
        patch_resp = self.main_client.patch("/api/patients/pat-e2e-1", json={
            "doseTime": "09:30",
            "doseTimes": ["09:30"],
            "regimen": "2RHZE/4RH"
        }, headers=hw_headers)
        self.assertEqual(patch_resp.status_code, 200)
        self.assertEqual(patch_resp.json()["doseTime"], "09:30")

    def test_03_arduino_event_ingestion_and_backend_sync(self):
        # 1. Post event to Arduino Server
        ard_post = self.arduino_client.post("/api/events", json={
            "device_id": "ZOMBA-042",
            "event": "DOSE_TAKEN",
            "status": "ON_TIME",
            "details": "Manual E2E simulation"
        })
        self.assertEqual(ard_post.status_code, 200)
        evt_data = ard_post.json()
        self.assertTrue(evt_data["success"])

        # 2. Get events directly from Arduino Server
        ard_events = self.arduino_client.get("/api/events?device_id=ZOMBA-042")
        self.assertEqual(ard_events.status_code, 200)
        self.assertGreaterEqual(ard_events.json()["count"], 1)

    def test_04_district_dashboard(self):
        do_login = self.main_client.post("/api/auth/login", json={
            "username": "do.manda",
            "password": "password123",
            "role": "district_officer"
        })
        do_token = do_login.json()["accessToken"]

        dash_resp = self.main_client.get("/api/district/dashboard", headers={"Authorization": f"Bearer {do_token}"})
        self.assertEqual(dash_resp.status_code, 200)
        dash_data = dash_resp.json()
        self.assertIn("totalPatients", dash_data)
        self.assertIn("adherenceRate", dash_data)


if __name__ == "__main__":
    unittest.main()
