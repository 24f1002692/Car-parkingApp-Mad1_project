import requests
import random, os

access_key = os.getenv('IMAGES_ACCESS_KEY')
headers = {"Authorization": f"Client-ID {access_key}"}
page = random.randint(1, 30)

def generate_random_parking_image_url():
    try:
        url = "https://api.unsplash.com/search/photos"
        params = {
            "query": f"car parking",
            "per_page": 1,
            "page": page
        }

        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            data = response.json()
            if data["results"]:
                return data["results"][0]["urls"]["regular"]
            else:
                print("No images found.")
        else:
            print("Unsplash error:", response.status_code, response.text)

    except Exception as e:
        print("Image fetch error:", e)

    return "https://images.unsplash.com/photo-1565043666747-69f6646db940?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NTk0MTB8MHwxfHNlYXJjaHw3fHxjYXIlMjBwYXJraW5nfGVufDB8fHx8MTc0ODk1NDk0OXww&ixlib=rb-4.1.0&q=80&w=1080"



def generate_random_user_image_url(gender):
    var = 'men' if gender == 'Male' else 'women'
    try:
        page = random.randint(1, 30)
        url = "https://api.unsplash.com/search/photos"
        params = {
            "query": f"{var}",
            "per_page": 1,
            "page": page
        }

        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            data = response.json()
            if data["results"]:
                return data["results"][0]["urls"]["regular"]
            else:
                print("No images found.")
        else:
            print("Unsplash error:", response.status_code, response.text)

    except Exception as e:
        print("Image fetch error:", e)
    
    return "https://images.unsplash.com/photo-1742518424556-839a9846adee?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" if var == 'men' else "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    
