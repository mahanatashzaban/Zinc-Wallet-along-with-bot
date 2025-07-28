# === api.py ===
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import threading
import traceback

from backtest import run_backtest
from bitfinex_trader import place_order
from live_bot import run_live_loop, stop_live_loop

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

trade_log = []
bot_thread = None
bot_running = False

@app.route("/api/btc-signal", methods=["GET"])
def btc_signal():
    balance = float(request.args.get("balance", 10000))
    leverage = float(request.args.get("leverage", 1))
    try:
        result = run_backtest(balance, leverage)
        return jsonify(result)
    except Exception as e:
        print("=== ERROR in /api/btc-signal ===")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/")
def home():
    return jsonify({"message": "Bot API is running"})

@app.route("/api/place-order", methods=["POST"])
def place_real_order():
    data = request.json
    try:
        api_key = data["api_key"]
        api_secret = data["api_secret"]
        symbol = data.get("symbol", "btcusd")
        side = data.get("side", "buy")
        amount = str(data.get("amount", "0.01"))
        price = data.get("price")

        order_result = place_order(api_key, api_secret, symbol, side, amount, price)

        if order_result.get("order_id"):
            trade_log.append({
                "order_id": order_result["order_id"],
                "symbol": symbol,
                "side": side,
                "amount": amount,
                "price": price,
                "time": datetime.utcnow().isoformat()
            })
            return jsonify({"success": True, "order": order_result})
        else:
            return jsonify({"success": False, "error": order_result.get("error", "Unknown error")}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/bot/start", methods=["POST"])
def start_bot():
    global bot_thread, bot_running
    if bot_running:
        return jsonify({"status": "already_running"})
    bot_running = True
    bot_thread = threading.Thread(target=run_live_loop)
    bot_thread.daemon = True
    bot_thread.start()
    return jsonify({"status": "running"})

@app.route("/api/bot/stop", methods=["POST"])
def stop_bot():
    global bot_running
    stop_live_loop()
    bot_running = False
    return jsonify({"status": "stopped"})

@app.route("/api/bot/status")
def bot_status():
    return jsonify({"running": bot_running})

@app.route("/api/trades", methods=["GET", "POST"])
def trades():
    if request.method == "POST":
        trade = request.json
        trade_log.append({
            "type": trade.get("signal", "").lower(),
            "price": float(trade.get("price", 0)),
            "time": trade.get("timestamp")
        })
        return jsonify({"status": "logged"})
    return jsonify(trade_log)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
