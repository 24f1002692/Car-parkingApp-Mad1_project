import requests, os

api_key = os.getenv('OPENCAGE_API_KEY')

def geocode_opencage(address):
    url = "https://api.opencagedata.com/geocode/v1/json"
    params = {
        "q": address,
        "key": api_key,
        "language": "en",
        "pretty": 1,
        "no_annotations": 1
    }

    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        if data['results']:
            result = data['results'][0]
            return {
                "success": True,
                "formatted_address": result.get("formatted"),
                "latitude": result["geometry"]["lat"],
                "longitude": result["geometry"]["lng"],
                "confidence": result.get("confidence"),
                "components": result.get("components", {})
            }
        else:
            return {"success": False, "message": "No results found"}
    else:
        return {"success": False, "message": f"HTTP Error: {response.status_code}"}
