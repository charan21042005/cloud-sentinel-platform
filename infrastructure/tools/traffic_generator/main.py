import time
import random
import requests
import threading

API_URL = "http://api-gateway:8000/api/v1"

def simulate_user_traffic():
    while True:
        try:
            # Hit public endpoints to generate throughput and latency
            requests.get(f"{API_URL}/docs", timeout=2)
            requests.post(f"{API_URL}/auth/login", json={"username": "synthetic", "password": "bot"}, timeout=2)
            
            # Add random jitter to simulate human latency
            time.sleep(random.uniform(0.1, 1.5))
        except Exception:
            time.sleep(2)

def simulate_load_spikes():
    while True:
        # Sleep for 1 to 3 minutes, then spike
        time.sleep(random.uniform(60, 180))
        print("Executing Synthetic Traffic Spike...")
        for _ in range(30):
            try:
                requests.get(f"{API_URL}/auth/login", timeout=1)
            except:
                pass

if __name__ == "__main__":
    print("Starting Cloud Sentinel Synthetic Traffic Generator...")
    
    # Start 3 concurrent user bots
    for _ in range(3):
        t = threading.Thread(target=simulate_user_traffic, daemon=True)
        t.start()
        
    # Start the spike simulator
    t_spike = threading.Thread(target=simulate_load_spikes, daemon=True)
    t_spike.start()
    
    # Keep alive
    while True:
        time.sleep(60)
