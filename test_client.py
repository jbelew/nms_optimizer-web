import socketio
import json
import time

# Create a Socket.IO client
sio = socketio.Client()


@sio.event
def connect():
    print("Connected to server")
    # Once connected, send the optimization request
    print("Sending optimization request...")
    sio.emit("optimize", payload)


@sio.event
def disconnect():
    print("Disconnected from server")


@sio.on("progress")
def on_progress(data):
    print(f"--- Progress Update at {time.time():.2f} ---")
    print(json.dumps(data, indent=2))


@sio.on("optimization_result")
def on_optimization_result(data):
    print(f"\n--- Final Result at {time.time():.2f} ---")
    print(json.dumps(data, indent=2))
    # Disconnect after getting the final result
    sio.disconnect()



# --- Prepare the optimization request data ---
# You can modify this payload to test different scenarios
def create_default_cell():
    return {
        "module": None,
        "label": None,
        "value": 0,
        "type": "",
        "total": 0.0,
        "adjacency_bonus": 0.0,
        "bonus": 0.0,
        "active": True,
        "adjacency": False,
        "tech": None,
        "supercharged": False,
        "sc_eligible": False,
        "image": None,
    }


payload = {
    "ship": "exosuit",
    "tech": "jetpack",
    "player_owned_rewards": [],
    "forced": True,
    "experimental_window_sizing": True,
    "grid": {
        "width": 10,
        "height": 6,
        "cells": [[create_default_cell() for _ in range(10)] for _ in range(6)],
    },
}

# Example of adding a supercharged slot
payload["grid"]["cells"][0][0]["supercharged"] = True


if __name__ == "__main__":
    try:
        # Connect to the server
        sio.connect("http://127.0.0.1:8000")
        # Wait for the connection and events to be processed
        sio.wait()
    except Exception as e:
        print(f"An error occurred: {e}")
