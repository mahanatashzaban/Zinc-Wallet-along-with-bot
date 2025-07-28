# strategy.py

import joblib
import requests
import pandas as pd
from utils import prepare_features

model = joblib.load("trained_rf_model.pkl")

def get_signal():
    url = "https://api-pub.bitfinex.com/v2/candles/trade:1m:tBTCUSD/hist?limit=60&sort=-1"
    data = requests.get(url).json()
    df = pd.DataFrame(data, columns=["timestamp", "open", "high", "low", "close", "volume"])
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
    df = df.sort_values("timestamp")

    df, features = prepare_features(df)
    if len(features) == 0:
        return "HOLD", 0.5, df["close"].iloc[-1]

    prob_up = model.predict_proba(features)[-1, 1]
    signal = "BUY" if prob_up > 0.7 else "SELL" if prob_up < 0.3 else "HOLD"
    return signal, round(prob_up, 3), df["close"].iloc[-1]

if __name__ == "__main__":
    signal, confidence, price = get_signal()
    print("📈 Signal:", signal)
    print("🔢 Confidence:", confidence)
    print("💰 Price:", price)
