import os
import serial
import requests
import time
from dotenv import load_dotenv

load_dotenv()

SERIAL_PORT = os.getenv("ARDUINO_SERIAL_PORT", "COM11")
BAUD_RATE = int(os.getenv("ARDUINO_BAUD_RATE", "9600"))

SERVER_URL = os.getenv("ARDUINO_SERVER_URL", "http://127.0.0.1:8001/api/events")

DEVICE_ID = os.getenv("DEVICE_ID", "ZOMBA-042")


def send_event(event_type, status):

    payload = {
        "device_id": DEVICE_ID,
        "event": event_type,
        "status": status
    }

    print()
    print("Sending event to server...")
    print(payload)

    try:

        response = requests.post(
            SERVER_URL,
            json=payload,
            timeout=5
        )

        if response.status_code == 200:

            print("SERVER: Event successfully logged.")

        else:

            print(
                f"SERVER ERROR: {response.status_code}"
            )

    except requests.RequestException as error:

        print(
            f"Could not connect to server: {error}"
        )


print("Connecting to Arduino...")

arduino = serial.Serial(
    SERIAL_PORT,
    BAUD_RATE,
    timeout=1
)

time.sleep(2)

print("Arduino connected.")
print("Listening for Smart Pill Box events...")
print()


while True:

    try:

        line = arduino.readline().decode(
            "utf-8",
            errors="ignore"
        ).strip()

        if not line:
            continue

        print(f"Arduino: {line}")


        if "EVENT:MEDICATION_REMINDER" in line:

            send_event(
                "MEDICATION_REMINDER",
                "WAITING"
            )


        elif "EVENT:DOSE_TAKEN" in line:

            send_event(
                "DOSE_TAKEN",
                "ON_TIME"
            )


        elif "EVENT:MISSED_DOSE" in line:

            send_event(
                "MISSED_DOSE",
                "MISSED"
            )


    except KeyboardInterrupt:

        print("\nStopping gateway...")

        arduino.close()

        break


    except Exception as error:

        print(f"Error: {error}")

        time.sleep(1)