import pandas as pd
import time
import requests
import datetime
import joblib
from utils import prepare_features

model = joblib.load("trained_rf_model.pkl")
print("✅ Loaded trained ML model.")

# Global flag for controlling loop
run_flag = True

def get_live_data():
    url = "https://api-pub.bitfinex.com/v2/candles/trade:1m:tBTCUSD/hist?limit=50&sort=-1"
    data = requests.get(url).json()
    df = pd.DataFrame(data, columns=["timestamp", "open", "high", "low", "close", "volume"])
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
    df = df.sort_values("timestamp")
    return df

def predict_signal():
    df = get_live_data()
    df, features = prepare_features(df)
    if len(features) == 0:
        print("⚠️ Not enough data for prediction")
        return None, None
    prob_up = model.predict_proba(features)[-1, 1]
    return prob_up, df["close"].iloc[-1]

def place_order(signal, price):
    timestamp = datetime.datetime.utcnow().isoformat()
    print(f"🚀 Placing {signal.upper()} order at price {price:.2f}")

    try:
        requests.post("http://localhost:8000/api/trades", json={
            "signal": signal,
            "price": float(price),
            "timestamp": timestamp
        })
    except Exception as e:
        print("❌ Failed to log trade:", e)

def run_live_loop():
    global run_flag
    run_flag = True
    print("🔁 Live bot started.")
    try:
        while run_flag:
            prob_up, price = predict_signal()
            if prob_up is None:
                time.sleep(60)
                continue

            print(f"🔎 Probability UP: {prob_up:.2f} at price {price:.2f}")

            if prob_up > 0.7:
                place_order("buy", price)
            elif prob_up < 0.3:
                place_order("sell", price)
            else:
                print("🟡 No strong signal")

            time.sleep(60)
    except Exception as e:
        print("❌ Error in live loop:", e)

    print("🛑 Live bot stopped.")

def stop_live_loop():
    global run_flag
    run_flag = False
    print("📴 Signal to stop bot received")

if __name__ == "__main__":
    run_live_loop()
