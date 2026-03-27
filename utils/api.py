import requests
import time

API_KEY = "bbed8bea4c1dad98d66c908c7966cdc3"


def get_air_pollution(lat, lon):
    url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API_KEY}"
    response = requests.get(url)
    return response.json()

def get_historical_pollution(lat, lon):

    end = int(time.time())
    start = end - (5 * 24 * 60 * 60)  # last 5 days

    url = f"http://api.openweathermap.org/data/2.5/air_pollution/history?lat={lat}&lon={lon}&start={start}&end={end}&appid={API_KEY}"

    response = requests.get(url)
    return response.json()