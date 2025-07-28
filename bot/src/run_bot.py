import requests
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

def compute_rsi(series, period=14):
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

# Fetch data
url = "https://api-pub.bitfinex.com/v2/candles/trade:1m:tBTCUSD/hist?limit=1500&sort=1"
response = requests.get(url)
data = response.json()

df = pd.DataFrame(data, columns=["timestamp", "open", "high", "low", "close", "volume"])
df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
df["linear"] = df["close"]

# Features for ML
df['return'] = df['close'].pct_change()
df['vol_change'] = df['volume'].pct_change()
df['ma20'] = df['close'].rolling(20).mean()
df['ma50'] = df['close'].rolling(50).mean()
df['rsi14'] = compute_rsi(df['close'], 14)

df['future_return'] = df['close'].shift(-1) - df['close']
df['target'] = (df['future_return'] > 0).astype(int)

df_ml = df.dropna(subset=['return', 'vol_change', 'ma20', 'ma50', 'rsi14', 'target']).copy()

features = ['return', 'vol_change', 'rsi14', 'ma20', 'ma50']
X = df_ml[features]
y = df_ml['target']

split_idx = int(len(df_ml) * 0.7)
X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print("=== ML Model Classification Report on Test Set ===")
print(classification_report(y_test, y_pred))

probs = model.predict_proba(X)[:, 1]  # Probability price will go up
df_ml['prob_up'] = probs

# Strategy params
LEVERAGE = 10
TP_SL_PCT = 0.0015
MAX_POSITIONS = 3

positions = []
signals = []

initial_balance = 10000
balance = initial_balance
equity_curve = []
max_balance = initial_balance
max_drawdown = 0

win_trades = 0
loss_trades = 0

# Track trades by source
trade_stats = {
    "valley_summit": {"win":0, "loss":0},
    "ml_only": {"win":0, "loss":0},
    "hybrid": {"win":0, "loss":0},
}

buy_candidates = []
sell_candidates = []

idx_list = df_ml.index.to_list()

def get_tp_sl(entry, direction):
    if direction == "BUY":
        tp = entry * (1 + TP_SL_PCT * 1.5)
        sl = entry * (1 - TP_SL_PCT)
    else:
        tp = entry * (1 - TP_SL_PCT * 1.5)
        sl = entry * (1 + TP_SL_PCT)
    return tp, sl

for idx_pos in range(20, len(idx_list)):
    i = idx_list[idx_pos]
    t = df.loc[i, "timestamp"]
    price = df.loc[i, "linear"]
    prev_price = df.loc[idx_list[idx_pos - 1], "linear"]
    ma20 = df.loc[i, 'ma20']
    rsi = df.loc[i, 'rsi14']
    prob_up = df_ml.loc[i, 'prob_up']

    if pd.isna(ma20) or pd.isna(rsi) or pd.isna(prob_up):
        equity_curve.append(balance)
        continue

    # Close positions if TP or SL hit
    new_positions = []
    for pos in positions:
        closed = False
        if pos["type"] == "BUY" and (price >= pos["tp"] or price <= pos["sl"]):
            result = "TP" if price >= pos["tp"] else "SL"
            pnl = (price - pos["entry"]) * LEVERAGE
            balance += pnl
            # Update trade stats by source
            source = pos.get("source","unknown")
            if pnl > 0:
                win_trades += 1
                trade_stats[source]["win"] += 1
            else:
                loss_trades += 1
                trade_stats[source]["loss"] += 1

            signals.append((f"CLOSE_BUY_{result}", t, price))
            closed = True

        elif pos["type"] == "SELL" and (price <= pos["tp"] or price >= pos["sl"]):
            result = "TP" if price <= pos["tp"] else "SL"
            pnl = (pos["entry"] - price) * LEVERAGE
            balance += pnl
            source = pos.get("source","unknown")
            if pnl > 0:
                win_trades += 1
                trade_stats[source]["win"] += 1
            else:
                loss_trades += 1
                trade_stats[source]["loss"] += 1

            signals.append((f"CLOSE_SELL_{result}", t, price))
            closed = True

        if not closed:
            new_positions.append(pos)

    positions = new_positions

    # Detect valleys and summits for candidates
    if idx_pos >= 2:
        p2 = df.loc[idx_list[idx_pos-2], "linear"]
        p1 = df.loc[idx_list[idx_pos-1], "linear"]
        p0 = price
        if p1 < p0 and p1 < p2:
            sell_candidates.append({"a": (df.loc[idx_list[idx_pos-1], "timestamp"], p1), "stage": "a"})
        if p1 > p0 and p1 > p2:
            buy_candidates.append({"a": (df.loc[idx_list[idx_pos-1], "timestamp"], p1), "stage": "a"})

    # Process SELL candidates (valley/summit + ML filter)
    updated_sell_candidates = []
    for c in sell_candidates:
        if c["stage"] == "a":
            if p1 > p0 and p1 > p2:
                c["b"] = (df.loc[idx_list[idx_pos-1], "timestamp"], p1)
                c["stage"] = "b"
        elif c["stage"] == "b":
            if price < c["a"][1]:
                c["c"] = (t, price)
                c["stage"] = "fire_ready"
        elif c["stage"] == "fire_ready":
            cond = (
                prev_price > c["a"][1] and prev_price > c["b"][1] and
                price < c["a"][1] and price < c["b"][1] and
                price < ma20 and rsi > 30 and prob_up < 0.4
            )
            if cond and len(positions) < MAX_POSITIONS:
                tp, sl = get_tp_sl(price, "SELL")
                positions.append({"type": "SELL", "entry": price, "tp": tp, "sl": sl, "source": "hybrid"})
                signals.append(("SELL_HYBRID", t, price))
                continue
        updated_sell_candidates.append(c)
    sell_candidates = updated_sell_candidates

    # Process BUY candidates (valley/summit + ML filter)
    updated_buy_candidates = []
    for c in buy_candidates:
        if c["stage"] == "a":
            if p1 < p0 and p1 < p2:
                c["b"] = (df.loc[idx_list[idx_pos-1], "timestamp"], p1)
                c["stage"] = "b"
        elif c["stage"] == "b":
            if price > c["a"][1]:
                c["c"] = (t, price)
                c["stage"] = "fire_ready"
        elif c["stage"] == "fire_ready":
            cond = (
                prev_price < c["a"][1] and prev_price < c["b"][1] and
                price > c["a"][1] and price > c["b"][1] and
                price > ma20 and rsi < 70 and prob_up > 0.6
            )
            if cond and len(positions) < MAX_POSITIONS:
                tp, sl = get_tp_sl(price, "BUY")
                positions.append({"type": "BUY", "entry": price, "tp": tp, "sl": sl, "source": "hybrid"})
                signals.append(("BUY_HYBRID", t, price))
                continue
        updated_buy_candidates.append(c)
    buy_candidates = updated_buy_candidates

    # --- Add ML-only entries (independent of valley/summit) ---
    # Only if positions not full and not conflicting side

    # Count current buy and sell positions
    current_buys = sum(1 for pos in positions if pos["type"] == "BUY")
    current_sells = sum(1 for pos in positions if pos["type"] == "SELL")

    # ML-only BUY
    if prob_up > 0.75 and current_buys < MAX_POSITIONS and len(positions) < MAX_POSITIONS:
        # Check price > ma20 and RSI < 70 to avoid bad ML signals
        if price > ma20 and rsi < 70:
            tp, sl = get_tp_sl(price, "BUY")
            positions.append({"type": "BUY", "entry": price, "tp": tp, "sl": sl, "source": "ml_only"})
            signals.append(("BUY_ML_ONLY", t, price))

    # ML-only SELL
    if prob_up < 0.25 and current_sells < MAX_POSITIONS and len(positions) < MAX_POSITIONS:
        # Check price < ma20 and RSI > 30 to avoid bad ML signals
        if price < ma20 and rsi > 30:
            tp, sl = get_tp_sl(price, "SELL")
            positions.append({"type": "SELL", "entry": price, "tp": tp, "sl": sl, "source": "ml_only"})
            signals.append(("SELL_ML_ONLY", t, price))

    # Track equity & drawdown
    equity_curve.append(balance)
    if balance > max_balance:
        max_balance = balance
    drawdown = (max_balance - balance) / max_balance
    if drawdown > max_drawdown:
        max_drawdown = drawdown

# Results
print("=== Strategy Results ===")
print(f"Initial Balance: {initial_balance}")
print(f"Final Balance: {balance:.2f}")
print(f"Net Profit: {balance - initial_balance:.2f}")
print(f"Total Trades Closed: {win_trades + loss_trades}")
print(f"Winning Trades: {win_trades}")
print(f"Losing Trades: {loss_trades}")
print(f"Win Rate: {win_trades / max(1, (win_trades + loss_trades)) * 100:.2f}%")
print(f"Maximum Drawdown: {max_drawdown * 100:.2f}%")

print("\nTrade breakdown by entry source:")
for source, stats in trade_stats.items():
    total = stats["win"] + stats["loss"]
    win_rate = stats["win"] / max(1, total) * 100
    print(f"  {source}: {total} trades, Win Rate: {win_rate:.2f}%")

# Plot price + signals
plt.figure(figsize=(14, 6))
plt.plot(df["timestamp"], df["linear"], label="BTC/USDT", color="blue")

used_labels = set()
for sig_type, ts, price in signals:
    if "BUY" in sig_type and "CLOSE" not in sig_type:
        color = "green"
        marker = "^"
    elif "SELL" in sig_type and "CLOSE" not in sig_type:
        color = "red"
        marker = "v"
    elif "CLOSE_BUY" in sig_type:
        color = "darkgreen"
        marker = "x"
    elif "CLOSE_SELL" in sig_type:
        color = "darkred"
        marker = "x"
    else:
        color = "black"
        marker = "o"

    label = sig_type if sig_type not in used_labels else ""
    used_labels.add(sig_type)
    plt.scatter(ts, price, color=color, marker=marker, label=label, s=60)
    plt.text(ts, price, sig_type.replace("CLOSE_", ""), fontsize=8, ha='left')

plt.title("BTC/USDT Hybrid Strategy — Valley/Summit + ML + ML-only Entries")
plt.xlabel("Time")
plt.ylabel("Price (USDT)")
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.savefig("btc_usdt_hybrid_signals.png")
plt.show()

# Plot equity curve
plt.figure(figsize=(14, 4))
plt.plot(df["timestamp"].iloc[:len(equity_curve)], equity_curve, label="Equity Curve", color="purple")
plt.title("Equity Curve Over Time")
plt.xlabel("Time")
plt.ylabel("Balance")
plt.grid(True)
plt.legend()
plt.tight_layout()
plt.savefig("btc_usdt_hybrid_equity_curve.png")
plt.show()
