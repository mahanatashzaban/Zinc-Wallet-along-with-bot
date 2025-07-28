import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// آیکن تیک سبز (برای تایید)
const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="green" opacity="0.2" />
    <path
      d="M6 12L10 16L18 8"
      stroke="green"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// پس‌زمینه SVG
const BackgroundSVG = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 800 600"
    preserveAspectRatio="none"
    style={{ position: "absolute", top: 0, left: 0, zIndex: -1 }}
  >
    <rect width="100%" height="100%" fill="#5186bbff" />
    {/* می‌تونی افکت‌های دیگه هم اضافه کنی */}
  </svg>
);

// پنجره Popup با SVG
const PopupModal = ({ message, onClose }) => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.4)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    }}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "12px",
        maxWidth: "400px",
        width: "80%",
        position: "relative",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}
    >
      {/* SVG آیتم */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="#FF7A59"
        style={{ marginBottom: "10px" }}
      >
        <circle cx="12" cy="12" r="10" fill="#FF7A59" opacity="0.2" />
        <path
          d="M12 8v4l3 3"
          stroke="#FF7A59"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div style={{ fontSize: "16px", color: "#333", marginBottom: "20px" }}>
        {message}
      </div>
      <button
        onClick={onClose}
        style={{
          padding: "10px 20px",
          borderRadius: "8px",
          backgroundColor: "#FF7A59",
          color: "white",
          border: "none",
          cursor: "pointer",
          width: "100%",
        }}
      >
        بستن
      </button>
    </div>
  </div>
);

const Bot = () => {
  const [fundAmount, setFundAmount] = useState("");
  const [profitReuse, setProfitReuse] = useState("");
  const [botRunning, setBotRunning] = useState(false);
  const [confirmedAmount, setConfirmedAmount] = useState(false);
  const [confirmedReuse, setConfirmedReuse] = useState(false);
  const [identityStatus, setIdentityStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState("");

  const user = auth.currentUser;

  const fetchData = async () => {
    if (!user) return;

    const botRef = doc(db, "users", user.uid, "bot", "config");
    const botSnap = await getDoc(botRef);
    if (botSnap.exists()) {
      const data = botSnap.data();
      setFundAmount(data.fundAmount || "");
      setProfitReuse(data.profitReuse || "");
      setBotRunning(data.botRunning || false);
      setConfirmedAmount(!!data.fundAmount);
      setConfirmedReuse(!!data.profitReuse);
    }

    const identityRef = doc(db, "users", user.uid, "identity", "info");
    const identitySnap = await getDoc(identityRef);
    if (identitySnap.exists()) {
      setIdentityStatus(identitySnap.data().status);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const saveToFirebase = async (updates) => {
    if (!user) return;
    const botRef = doc(db, "users", user.uid, "bot", "config");
    await setDoc(botRef, updates, { merge: true });
  };

  const handleConfirmAmount = async () => {
    if (Number(fundAmount) > 100000) {
      setConfirmedAmount(true);
      await saveToFirebase({ fundAmount: Number(fundAmount) });
      setPopupMessage(
        `همین مقدار دلار تتر باید در اکانت فیوچرز bitfinex شما باید موجود باشد: ${fundAmount} دلار`
      );
    } else {
      setPopupMessage("مقدار باید بیشتر از ۱۰۰۰۰۰ باشد");
    }
  };

  const handleConfirmReuse = async () => {
    if (profitReuse === "بله" || profitReuse === "خیر") {
      setConfirmedReuse(true);
      await saveToFirebase({ profitReuse });
    } else {
      setPopupMessage("فقط 'بله' یا 'خیر' مجاز است");
    }
  };

  const handleBotToggle = async (desiredStatus) => {
    if (identityStatus !== "approved") {
      setPopupMessage("شما هنوز احراز هویت نشده‌اید");
      return;
    }

    setBotRunning(desiredStatus);
    await saveToFirebase({ botRunning: desiredStatus });
    setPopupMessage(desiredStatus ? "ربات فعال شد" : "ربات متوقف شد");
  };

  const canToggleBot =
    confirmedAmount && confirmedReuse && identityStatus === "approved";

  if (loading)
   
      
    

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "#f0f4f8",
        overflow: "hidden",
        fontFamily: "Vazir, Tahoma, Arial",
      }}
    >
      {/* پس‌زمینه SVG */}
      <BackgroundSVG />

      {/* لایه نیمه‌شفاف برای overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255,255,255,0.2)",
          zIndex: 0,
        }}
      />

      {/* فرم در بالا */}
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          marginTop: "50px",
          backgroundColor: "rgba(255,255,255,0.95)",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          zIndex: 1,
          position: "relative",
        }}
      >
        {/* قسمت مقدار سرمایه */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            چه مقدار از موجودی در معاملات ربات استفاده شود؟
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                backgroundColor: "#fff",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            >
              {/* SVG Box */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="#FF7A59"
                style={{ marginLeft: "8px" }}
              >
                <rect width="24" height="24" rx="4" fill="#FF7A59" opacity="0.2" />
                {/* درون مستطیل */}
                <rect x="4" y="4" width="16" height="16" fill="#FF7A59" rx="2" />
              </svg>
              <input
                type="number"
                placeholder="مثلاً ۲۰۰۰۰۰"
                value={fundAmount}
                onChange={(e) => {
                  setFundAmount(e.target.value);
                  setConfirmedAmount(false);
                }}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: "14px",
                }}
              />
            </div>
            {/* دکمه تایید */}
            <button
              onClick={handleConfirmAmount}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                backgroundColor: "#FF7A59",
                color: "white",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              تایید
            </button>
            {/* تیک تایید */}
            {confirmedAmount && <CheckIcon />}
          </div>
        </div>

        {/* قسمت سود */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            سود حاصل بدست آمده از معاملات در معاملات جدید استفاده شود؟
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                backgroundColor: "#fff",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            >
              {/* SVG Box */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="#FF7A59"
                style={{ marginLeft: "8px" }}
              >
                <rect width="24" height="24" rx="4" fill="#FF7A59" opacity="0.2" />
                {/* درون مستطیل */}
                <rect x="4" y="4" width="16" height="16" fill="#FF7A59" rx="2" />
              </svg>
              <input
                type="text"
                placeholder="بله / خیر"
                value={profitReuse}
                onChange={(e) => {
                  setProfitReuse(e.target.value);
                  setConfirmedReuse(false);
                }}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: "14px",
                }}
              />
            </div>
            {/* دکمه تایید */}
            <button
              onClick={handleConfirmReuse}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                backgroundColor: "#FF7A59",
                color: "white",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              تایید
            </button>
            {/* تیک تایید */}
            {confirmedReuse && <CheckIcon />}
          </div>
        </div>

        {/* دکمه‌های فعال/غیرفعال کردن ربات */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >
          {/* توقف ربات */}
          <button
            onClick={() => handleBotToggle(false)}
            disabled={!canToggleBot || !botRunning}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              backgroundColor: botRunning ? "orange" : "gray",
              color: "white",
              border: "none",
              cursor: canToggleBot && botRunning ? "pointer" : "not-allowed",
              opacity: canToggleBot ? 1 : 0.6,
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* SVG icon */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="white"
              style={{ marginLeft: "8px" }}
            >
              <rect width="24" height="24" rx="4" fill="#555" opacity="0.1" />
              <circle cx="12" cy="12" r="10" fill="#555" opacity="0.2" />
              <line
                x1="12"
                y1="8"
                x2="12"
                y2="16"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            ربات متوقف شود
          </button>
          {/* فعال کردن ربات */}
          <button
            onClick={() => handleBotToggle(true)}
            disabled={!canToggleBot || botRunning}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              backgroundColor:
                !botRunning && identityStatus === "approved"
                  ? "#FF7A59"
                  : "gray",
              color: "white",
              border: "none",
              cursor:
                !botRunning && identityStatus === "approved"
                  ? "pointer"
                  : "not-allowed",
              opacity:
                !botRunning && identityStatus === "approved" ? 1 : 0.6,
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* SVG icon */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="white"
              style={{ marginLeft: "8px" }}
            >
              <rect width="24" height="24" rx="4" fill="#555" opacity="0.1" />
              <circle cx="12" cy="12" r="10" fill="#555" opacity="0.2" />
              <path
                d="M8 12l2 2l4-4"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            ربات فعال شود
          </button>
        </div>

        {/* هشدار احراز هویت */}
        {identityStatus !== "approved" && (
          <div
            style={{
              marginTop: "20px",
              color: "red",
              fontWeight: "bold",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            ربات فقط بعد از تأیید احراز هویت قابل فعال‌سازی است.
          </div>
        )}
      </div>

      {/* پنجره popup */}
      {popupMessage && (
        <PopupModal message={popupMessage} onClose={() => setPopupMessage("")} />
      )}
    </div>
  );
};

export default Bot;