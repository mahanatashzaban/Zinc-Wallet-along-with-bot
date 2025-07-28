# === bitfinex_trader.py ===

import time
import hmac
import hashlib
import base64
import requests
import json

BITFINEX_BASE_URL = "https://api.bitfinex.com"


def place_order(api_key, api_secret, symbol, side, amount, price):
    endpoint = "/v1/order/new"
    url = BITFINEX_BASE_URL + endpoint

    nonce = str(int(time.time() * 1000000))
    payload = {
        "request": endpoint,
        "nonce": nonce,
        "symbol": symbol,
        "amount": str(amount),
        "price": str(price),
        "exchange": "bitfinex",
        "side": side,
        "type": "exchange limit"
    }

    payload_json = json.dumps(payload)
    b64 = base64.b64encode(payload_json.encode())
    signature = hmac.new(api_secret.encode(), b64, hashlib.sha384).hexdigest()

    headers = {
        "X-BFX-APIKEY": api_key,
        "X-BFX-PAYLOAD": b64.decode(),
        "X-BFX-SIGNATURE": signature
    }

    response = requests.post(url, headers=headers, data=b64)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Bitfinex API error: {response.text}")


# === api.py ===

from flask import Flask, jsonify, request
from flask_cors import CORS
import threading
import joblib
import pandas as pd
import requests
import matplotlib.pyplot as plt
import io
import base64
import numpy as np
from datetime import datetime
from utils import prepare_features
from bitfinex_trader import place_order

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "https://jubilant-space-disco-9755jqrvqxgwcpg49-3000.app.github.dev"}})

trade_log = []
model = joblib.load("trained_rf_model.pkl")


def generate_chart(title, y_data):
    plt.figure(figsize=(6, 3))
    plt.plot(y_data, marker='o', linewidth=1)
    plt.title(title)
    plt.grid(True)
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close()
    buf.seek(0)
    return base64.b64encode(buf.read()).decode('utf-8')


def calculate_drawdown(equity_curve):
    peak = equity_curve[0]
    max_dd = 0
    for x in equity_curve:
        if x > peak:
            peak = x
        dd = (peak - x) / peak
        if dd > max_dd:
            max_dd = dd
    return round(max_dd * 100, 2)


@app.route("/")
def home():
    return jsonify({"message": "Bot API is running"})


@app.route("/api/bitfinex-candles", methods=["GET"])
def bitfinex_candles():
    try:
        url = "https://api-pub.bitfinex.com/v2/candles/trade:1m:tBTCUSD/hist?limit=60&sort=1"
        response = requests.get(url)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/btc-signal", methods=["GET"])
def btc_signal():
    balance = float(request.args.get("balance", 10000))
    leverage = float(request.args.get("leverage", 1))
    try:
        url = "https://api-pub.bitfinex.com/v2/candles/trade:1m:tBTCUSD/hist?limit=1500&sort=1"
        data = requests.get(url).json()
        df = pd.DataFrame(data, columns=["timestamp", "open", "high", "low", "close", "volume"])
        df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
        df = df.sort_values("timestamp")

        df, features_df = prepare_features(df)
        probs = model.predict_proba(features_df)[:, 1]
        preds = model.predict(features_df)

        df = df.loc[features_df.index]
        df["prob_up"] = probs
        df["prediction"] = preds

        pos = 0
        balance_history = [balance]
        wins = 0
        trades = 0
        entry_price = None

        for i in range(1, len(df)):
            price_now = df.iloc[i]["close"]
            prob = df.iloc[i]["prob_up"]

            if pos == 0:
                if prob > 0.7:
                    pos = 1
                    entry_price = price_now
                    trades += 1
                elif prob < 0.3:
                    pos = -1
                    entry_price = price_now
                    trades += 1
            elif pos == 1 and prob < 0.5:
                pnl = leverage * (price_now - entry_price)
                balance += pnl
                if pnl > 0:
                    wins += 1
                pos = 0
            elif pos == -1 and prob > 0.5:
                pnl = leverage * (entry_price - price_now)
                balance += pnl
                if pnl > 0:
                    wins += 1
                pos = 0

            balance_history.append(balance)

        win_rate = round((wins / trades) * 100, 2) if trades > 0 else 0.0
        drawdown = calculate_drawdown(balance_history)
        final_balance = round(balance, 2)

        signal_chart = generate_chart("Signal Predictions", df["prob_up"])
        equity_chart = generate_chart("Equity Curve", balance_history)

        return jsonify({
            "prediction": "Buy" if df['prob_up'].iloc[-1] > 0.5 else "Sell",
            "confidence": round(float(df['prob_up'].iloc[-1]), 3),
            "balance": final_balance,
            "win_rate": win_rate,
            "drawdown": drawdown,
            "signal_chart": signal_chart,
            "equity_chart": equity_chart,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/place-order", methods=["POST"])
def place_real_order():
    try:
        data = request.json
        api_key = data["api_key"]
        api_secret = data["api_secret"]
        side = data["side"]  # "buy" or "sell"
        price = data["price"]
        amount = data["amount"]
        symbol = data.get("symbol", "btcusd")

        result = place_order(api_key, api_secret, symbol, side, amount, price)
        trade_log.append({"symbol": symbol, "side": side, "price": price, "amount": amount, "time": datetime.utcnow().isoformat()})
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/trades", methods=["GET"])
def get_trades():
    return jsonify(trade_log)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
