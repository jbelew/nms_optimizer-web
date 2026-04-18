import requests
import json
import os

ZONE_ID = "0986bee940f1277db8e730912b3a27ae"
API_TOKEN = "RsOKDOpAS8tBZa6qvSFl-bGwgHGVlcrMIqFyzmcH"
DOMAIN = "nms-optimizer.app"
CACHE_RULESET_ID = "faf6840246a640748ad50c47f01cc2b2"

BASE_URL = f"https://api.cloudflare.com/client/v4/zones/{ZONE_ID}"

headers = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json",
}

new_rules = [
    {
        "description": "Version Metadata (never cache)",
        "expression": '(http.request.uri.path eq "/version.json")',
        "action": "set_cache_settings",
        "action_parameters": {
            "cache": False
        }
    },
    {
        "description": "API Cache (Optimized)",
        "expression": '(http.host eq "api.nms-optimizer.app" and http.request.method eq "GET")',
        "action": "set_cache_settings",
        "action_parameters": {
            "cache": True,
            "browser_ttl": { "mode": "respect_origin" },
            "edge_ttl": { "mode": "override_origin", "default": 3600 }
        }
    },
    {
        "description": "Immutable Build Assets",
        "expression": '(starts_with(http.request.uri.path, "/build/"))',
        "action": "set_cache_settings",
        "action_parameters": {
            "cache": True,
            "browser_ttl": { "mode": "respect_origin" },
            "edge_ttl": { "mode": "override_origin", "default": 31536000 }
        }
    }
]

def update_cloudflare_ruleset():
    url = f"{BASE_URL}/rulesets/{CACHE_RULESET_ID}"
    payload = { "rules": new_rules }
    
    print(f"Updating ruleset {CACHE_RULESET_ID} for zone: {ZONE_ID} ({DOMAIN})...")
    try:
        response = requests.put(url, headers=headers, json=payload)
        response.raise_for_status()
        print("Successfully updated ruleset.")
    except requests.exceptions.RequestException as e:
        print(f"Error updating ruleset: {e}")
        if e.response:
            print(f"Response body: {e.response.text}")

if __name__ == "__main__":
    update_cloudflare_ruleset()
