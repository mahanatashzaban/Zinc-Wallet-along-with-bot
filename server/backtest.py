import requests
import pandas as pd
import matplotlib.pyplot as plt
import io
import base64
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib
from utils import prepare_features


def to_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight")
    buf.seek(0)
    image_base64 = base64.b64encode(buf.read()).decode("utf-8")
    plt.close(fig)
    return image_base64


def train_and_save_model():
    print("Fetching historical data...")
    url = "https://api-pub.bitfinex.com/v2/candles/trade:1m:tBTCUSD/hist?limit=1500&sort=1"
    data = requests.get(url).json()
    df = pd.DataFrame(data, columns=["timestamp", "open", "high", "low", "close", "volume"])
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
    df = df.sort_values("timestamp")

    df["future_return"] = df["close"].shift(-1) - df["close"]
    df["target"] = (df["future_return"] > 0).astype(int)

    df, features_df = prepare_features(df)

    # Drop NaNs
    features_df = features_df.dropna()
    df = df.loc[features_df.index]

    features = ["return", "vol_change", "rsi14", "ma20", "ma50"]
    X = features_df[features]
    y = df["target"]

    split = int(len(df) * 0.7)
    X_train, X_test = X.iloc[:split], X.iloc[split:]
    y_train, y_test = y.iloc[:split], y.iloc[split:]

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print(classification_report(y_test, y_pred))
    joblib.dump(model, "trained_rf_model.pkl")
    print("Model saved!")


def run_backtest(balance=10000, leverage=1):
    model = joblib.load("trained_rf_model.pkl")
    url = "https://api-pub.bitfinex.com/v2/candles/trade:1m:tBTCUSD/hist?limit=5000&sort=1"
    data = requests.get(url).json()
    df = pd.DataFrame(data, columns=["timestamp", "open", "high", "low", "close", "volume"])
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
    df = df.sort_values("timestamp")

    df, features_df = prepare_features(df)

    # Drop NaNs and align
    features_df = features_df.dropna()
    df = df.loc[features_df.index]

    probs = model.predict_proba(features_df)[:, 1]
    df["prob_up"] = probs

    pos = 0
    entry_price = 0
    win_trades = 0
    total_trades = 0
    balance_history = [balance]
    signals = []

    for i in range(1, len(df)):
        price_now = df.iloc[i]["close"]
        prob = df.iloc[i]["prob_up"]
        signal = "HOLD"

        if pos == 0:
            if prob > 0.7:
                pos = 1
                entry_price = price_now
                signal = "BUY"
                total_trades += 1
            elif prob < 0.3:
                pos = -1
                entry_price = price_now
                signal = "SELL"
                total_trades += 1
        elif pos == 1 and prob < 0.5:
            pnl = leverage * (price_now - entry_price)
            balance += pnl
            if pnl > 0:
                win_trades += 1
            pos = 0
            signal = "EXIT"
        elif pos == -1 and prob > 0.5:
            pnl = leverage * (entry_price - price_now)
            balance += pnl
            if pnl > 0:
                win_trades += 1
            pos = 0
            signal = "EXIT"

        signals.append(signal)
        balance_history.append(balance)

    df["signal"] = ["HOLD"] + signals  # Now length = len(df)


    # === Signal Chart ===
    fig1, ax1 = plt.subplots(figsize=(10, 4))
    ax1.plot(df["timestamp"], df["close"], label="Price", color="blue", alpha=0.6)
    buys = df[df["signal"] == "BUY"]
    sells = df[df["signal"] == "SELL"]
    ax1.scatter(buys["timestamp"], buys["close"], marker="^", color="green", label="BUY")
    ax1.scatter(sells["timestamp"], sells["close"], marker="v", color="red", label="SELL")
    ax1.set_title("Signal Chart")
    ax1.legend()
    signal_chart = to_base64(fig1)

    # === Equity Chart ===
    fig2, ax2 = plt.subplots(figsize=(10, 4))
    ax2.plot(balance_history, label="Balance", color="black")
    ax2.set_title("Equity Curve")
    ax2.set_xlabel("Trade Index")
    ax2.set_ylabel("Balance")
    ax2.legend()
    equity_chart = to_base64(fig2)

    win_rate = round(100 * win_trades / total_trades, 2) if total_trades else 0
    net_profit = round(balance - balance_history[0], 2)
    drawdown = round(max(balance_history[0] - min(balance_history), 0), 2)

    return {
        "balance": round(balance, 2),
        "net_profit": net_profit,
        "win_rate": win_rate,
        "drawdown": drawdown,
        "signal": df.iloc[-1]["signal"],
        "confidence": round(df.iloc[-1]["prob_up"], 3),
        "prediction": "UP" if df.iloc[-1]["prob_up"] > 0.5 else "DOWN",
        "signal_chart": signal_chart,
        "equity_chart": equity_chart,
    }


if __name__ == "__main__":
    train_and_save_model()
