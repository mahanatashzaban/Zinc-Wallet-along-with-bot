import React, { useEffect, useState } from "react";
import axios from "axios";
import { auth, db } from "../firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import TradingViewChart from "../components/TradingViewChart";

const BotReport = () => {
  const user = auth.currentUser;

  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [multiplier, setMultiplier] = useState(1);
  const [botRunning, setBotRunning] = useState(false);
  const [resultText, setResultText] = useState("");
  const [signalChart, setSignalChart] = useState("");
  const [equityChart, setEquityChart] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [showTrades, setShowTrades] = useState(false);
  const [trades, setTrades] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // تابع نمایش هشدار
  const displayAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  // 🔁 لایو تریدها
  useEffect(() => {
    if (!showTrades) return;

    const fetchTrades = async () => {
      try {
        const res = await axios.get("https://jubilant-space-disco-9755jqrvqxgwcpg49-8000.app.github.dev/api/trades");
        setTrades(res.data);
      } catch (err) {
        console.error("خطا در دریافت معاملات:", err);
      }
    };

    fetchTrades();
    const interval = setInterval(fetchTrades, 15000);
    return () => clearInterval(interval);
  }, [showTrades]);

  // 🔴 ریل تایم وضعیت ربات
  useEffect(() => {
    if (!user) return;

    const stateRef = doc(db, "users", user.uid, "bot", "state");
    const unsubscribe = onSnapshot(stateRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setMultiplier(data.multiplier ?? 1);
        setBotRunning(data.running ?? false);
        setShowTrades(data.showTrades ?? false);
      }
      setSettingsLoaded(true);
    }, (error) => {
      console.error("خطا در دریافت وضعیت ربات:", error);
    });
    return () => unsubscribe();
  }, [user]);

  // 🔴 ریل تایم کلیدهای API
  useEffect(() => {
    if (!user) return;

    const keysRef = doc(db, "users", user.uid, "bot", "keys");
    const unsubscribe = onSnapshot(keysRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setApiKey(data.api_key || "");
        setApiSecret(data.api_secret || "");
      }
    }, (error) => {
      console.error("خطا در دریافت کلیدهای API:", error);
    });
    return () => unsubscribe();
  }, [user]);

  // ذخیره وضعیت ربات
  useEffect(() => {
    if (!user || !settingsLoaded) return;

    const saveState = async () => {
      try {
        await setDoc(doc(db, "users", user.uid, "bot", "state"), {
          running: botRunning,
          multiplier,
          showTrades,
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("خطا در ذخیره وضعیت:", error);
        displayAlert("خطا در ذخیره تنظیمات ربات");
      }
    };
    saveState();
  }, [botRunning, multiplier, showTrades, user, settingsLoaded]);

  // ذخیره کلیدهای API
  const saveKeys = async () => {
    if (!user) return displayAlert("ابتدا وارد شوید");
    if (!apiKey || !apiSecret) return displayAlert("لطفاً API key و secret را وارد کنید");

    try {
      await setDoc(doc(db, "users", user.uid, "bot", "keys"), {
        api_key: apiKey,
        api_secret: apiSecret,
      });
      displayAlert("کلیدها ذخیره شدند.");
    } catch (err) {
      console.error(err);
      displayAlert("خطا در ذخیره کلیدها");
    }
  };

  // شروع ربات
  const startBot = async () => {
    try {
      await axios.post("https://jubilant-space-disco-9755jqrvqxgwcpg49-8000.app.github.dev/api/bot/start", {
        multiplier,
      });
      displayAlert("ربات شروع شد!");
      setBotRunning(true);
    } catch (err) {
      console.error(err);
      displayAlert("خطا در شروع ربات");
    }
  };

  // توقف ربات
  const stopBot = async () => {
    try {
      await axios.post("https://jubilant-space-disco-9755jqrvqxgwcpg49-8000.app.github.dev/api/bot/stop");
      displayAlert("ربات متوقف شد");
      setBotRunning(false);
    } catch (err) {
      console.error(err);
      displayAlert("خطا در توقف ربات");
    }
  };

  // toggle ربات
  const toggleBot = (status) => {
    if (status) startBot();
    else stopBot();
  };

  // بک تست
  const fetchBacktest = async () => {
    try {
      const res = await axios.get(
        "https://jubilant-space-disco-9755jqrvqxgwcpg49-8000.app.github.dev/api/btc-signal",
        { params: { balance: 10000, leverage: 1 } }
      );
      const data = res.data;
      const stats = `
=== نتایج بک تست ===
پیش‌بینی: ${data.prediction ?? "نامشخص"}
اعتماد به نفس: ${data.confidence ?? "نامشخص"}
بالانس نهایی: ${data.balance ?? "نامشخص"}
درصد موفقیت: ${data.win_rate ?? "نامشخص"}%
سیگنال نهایی: ${data.signal ?? "نامشخص"}
      `;
      setResultText(stats);
      setSignalChart(data.signal_chart ? `data:image/png;base64,${data.signal_chart}` : "");
      setEquityChart(data.equity_chart ? `data:image/png;base64,${data.equity_chart}` : "");
      setShowFormPopup(false);
      setShowPopup(true);
    } catch (err) {
      displayAlert("خطا در دریافت نتایج بک تست");
      console.error(err);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6 text-right" dir="rtl">

      {/* هشدار */}
      {showAlert && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-fadeInOut">
          {alertMessage}
        </div>
      )}

      {/* عنوان */}
      <h2 className="text-xl font-bold text-black">چارت حرفه‌ای BTC/USDT</h2>

      {/* نمایش معاملات */}
      <div className="flex items-center gap-2 mt-4">
        <input
          type="checkbox"
          id="showTrades"
          checked={showTrades}
          onChange={(e) => setShowTrades(e.target.checked)}
        />
        <label htmlFor="showTrades" className="text-black">نمایش معاملات روی چارت</label>
      </div>

      <TradingViewChart showTrades={showTrades} trades={trades} />

      {/* API Keys */}
      <div className="space-y-2">
        <label className="block mb-1 text-black">API Key من در Bitfinex:</label>
        <input
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-[250px] border border-gray-600 px-3 py-1 rounded bg-white text-white"
          placeholder="API Key"
        />
        <label className="block mb-1 mt-3 text-black">Secret Key من در Bitfinex:</label>
        <input
          type="password"
          value={apiSecret}
          onChange={(e) => setApiSecret(e.target.value)}
          className="w-[250px] border border-gray-600 px-3 py-1 rounded bg-white text-white"
          placeholder="Secret Key"
        />

      </div>
        <button
          onClick={saveKeys}
          className="bg-purple-600 text-white px-4 py-2 rounded mt-4"
        >
          ذخیره کلیدها
        </button>
      {/* Multiplier */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block mb-1 text-black">سود و زیان را چند برابر کن: {multiplier}</label>
          <input
            type="range"
            min="1"
            max="5"
            value={multiplier}
            onChange={(e) => setMultiplier(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <button
          onClick={() => setMultiplier(1)}
          className="w-14 h-14 bg-orange-500 text-white rounded-full text-xl flex items-center justify-center shadow-lg hover:bg-orange-600"
        >
          🔄
        </button>
      </div>

      {/* ربات فعال/غیرفعال */}
      <div className="flex gap-2 mt-4 flex-wrap">
        <button
          onClick={() => toggleBot(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded flex-1 min-w-[120px]"
          disabled={botRunning}
        >
          ربات فعال شود
        </button>
        <button
          onClick={() => toggleBot(false)}
          className="bg-gray-400 text-white px-4 py-2 rounded flex-1 min-w-[120px]"
          disabled={!botRunning}
        >
          ربات متوقف شود
        </button>
      </div>

      {/* بک تست */}
      <button
        onClick={() => setShowFormPopup(true)}
        className="bg-purple-600 text-white px-4 py-2 rounded mt-4 w-full sm:w-auto"
      >
        بک تست بگیر
      </button>

      {/* پنجره تنظیمات بک تست */}
      {showFormPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowFormPopup(false)}
        >
          <div
            className="bg-white p-6 rounded w-full max-w-md space-y-4 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold">🎯 تنظیمات بک تست</h3>
            <div className="space-y-2 text-sm">
              <p>مقدار سرمایه اولیه: <b>10000 دلار</b></p>
              <p>بازه زمانی: <b>4 ماه گذشته</b></p>
              <p>تایم فریم: <b>1 دقیقه‌ای</b></p>
              <p>جفت ارز: <b>BTC-USDT</b></p>
            </div>
            <div className="flex justify-between mt-4 gap-2">
              <button
                onClick={fetchBacktest}
                className="bg-purple-600 text-white px-4 py-2 rounded flex-1"
              >
                شروع تست
              </button>
              <button
                onClick={() => setShowFormPopup(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded flex-1"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نتایج کامل ربات */}
      {showPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-white p-6 rounded w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-2">📊 نتایج کامل ربات</h3>
            <pre className="text-sm bg-gray-100 p-3 rounded whitespace-pre-wrap">
              {resultText}
            </pre>
            {signalChart && (
              <div className="my-4">
                <h4 className="font-semibold mb-2">نمودار سیگنال‌ها</h4>
                <img src={signalChart} alt="Signals" className="w-full rounded" />
              </div>
            )}
            {equityChart && (
              <div className="my-4">
                <h4 className="font-semibold mb-2">نمودار سود و زیان</h4>
                <img src={equityChart} alt="Equity Curve" className="w-full rounded" />
              </div>
            )}
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotReport;