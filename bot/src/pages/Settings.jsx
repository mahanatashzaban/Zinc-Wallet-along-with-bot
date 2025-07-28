import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import backgroundImage from "../assets/background.png"; // مسیر تصویر را بر اساس پروژه‌تان اصلاح کنید

const BACKEND_URL = "https://jubilant-space-disco-9755jqrvqxgwcpg49-5000.app.github.dev";

const Settings = () => {
  const [phone, setPhone] = useState("");
  const [enable2FA, setEnable2FA] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [userToken, setUserToken] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setPhone(data.phone || "");
          setEnable2FA(!!data.twoFAEnabled);
          setQrUrl(data.secretUrl || "");
          setSecretCode(data.secret || "");
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };
    fetchData();
  }, []);

  const handleEnable2FA = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("ابتدا وارد شوید");
      return;
    }

    setLoading(true);
    setError("");
    setVerifyError("");
    setVerifySuccess(false);

    try {
      const res = await fetch(`${BACKEND_URL}/api/setup-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid }),
      });
      const result = await res.json();

      if (result.success) {
        await setDoc(
          doc(db, "users", user.uid),
          {
            secret: result.secret,
            secretUrl: result.secretUrl,
          },
          { merge: true }
        );
        setQrUrl(result.secretUrl);
        setSecretCode(result.secret);
        setModalOpen(true);
      } else {
        setError("خطا در فعال‌سازی ورود دو مرحله‌ای");
      }
    } catch (err) {
      console.error("Error enabling 2FA:", err);
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("ابتدا وارد شوید");
      return;
    }

    setVerifying(true);
    setVerifyError("");
    setVerifySuccess(false);

    try {
      const res = await fetch(`${BACKEND_URL}/api/verify-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, token: userToken }),
      });
      const result = await res.json();
      if (result.success) {
        await setDoc(
          doc(db, "users", user.uid),
          {
            twoFAEnabled: true,
          },
          { merge: true }
        );
        setVerifySuccess(true);
        setEnable2FA(true);
        setModalOpen(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      } else {
        setVerifyError(result.message || "کد وارد شده اشتباه است");
      }
    } catch (err) {
      console.error("Error verifying token:", err);
      setVerifyError("خطا در ارتباط با سرور");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center px-3 py-6 text-sm sm:text-base"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        overflow: "hidden", // جلوگیری از اسکرول صفحه
      }}
    >
      {/* بخش محتوای اصلی */}
      <div
        className="max-w-xl w-full bg-white rounded-lg shadow-md p-5 sm:p-8 space-y-6"
        style={{
          overflowY: "auto", // اگر نیاز دارید محتوای داخلی قابل اسکرول باشد
        }}
      >
        {/* بخش تنظیمات حساب */}
        <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          تنظیمات حساب
        </h2>
        <div className="space-y-5">
          <div>
            <label className="block mb-2 font-semibold text-gray-700 text-sm sm:text-base">
              شماره تلفن:
            </label>
            <input
              type="text"
              value={phone}
              disabled
              className="border border-gray-300 rounded-md w-full px-3 py-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700 text-sm sm:text-base">
              ورود دو مرحله‌ای (Google Authenticator):
            </label>

            {enable2FA ? (
              <div className="space-y-2 text-center">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt="کد QR ورود دو مرحله‌ای"
                    className="w-32 h-32 sm:w-40 sm:h-40 mx-auto"
                  />
                ) : (
                  <p className="text-gray-500 text-sm">در حال بارگذاری کد QR...</p>
                )}
                <p className="text-green-600 font-semibold text-sm sm:text-base">
                  ورود دو مرحله‌ای فعال است
                </p>
              </div>
            ) : (
              <button
                onClick={handleEnable2FA}
                disabled={loading}
                className={`w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 rounded-md font-semibold text-white transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#FF7A59] hover:bg-[#e6684d]"
                }`}
              >
                {loading
                  ? "در حال فعال‌سازی..."
                  : "فعال‌سازی Google Authenticator"}
              </button>
            )}

            {error && (
              <p className="mt-2 text-red-600 font-semibold text-center text-sm sm:text-base">
                {error}
              </p>
            )}
            {saved && (
              <p className="mt-2 text-green-600 font-semibold text-center text-sm sm:text-base">
                تغییرات با موفقیت ذخیره شدند.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* مودال SVG با overlay */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-3"
          style={{ overflow: "hidden" }} // جلوگیری از اسکرول در حین نمایش مودال
        >
          <svg width="400" height="600" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
            {/* پس‌زمینه تاریک */}
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" />

            {/* جعبه اصلی */}
            <rect x="50" y="50" width="300" height="500" rx="15" fill="#36454F" stroke="#ccc" strokeWidth="1" />

            {/* عنوان */}
            <text x="200" y="90" textAnchor="middle" fill="#333" fontSize="20" fontWeight="bold">
              فعال‌سازی ورود دو مرحله‌ای
            </text>

            {/* QR کد */}
            <foreignObject x="150" y="130" width="100" height="100">
              <img src={qrUrl} alt="QR Code" style={{ width: "100%", height: "100%" }} />
            </foreignObject>

            {/* کد مخفی */}
            <text x="200" y="250" textAnchor="middle" fill="#555" fontSize="14">
              {secretCode}
            </text>

            {/* ورودی کد */}
            <foreignObject x="125" y="270" width="150" height="40">
              <input
                type="text"
                placeholder="کد ۶ رقمی"
                maxLength={6}
                value={userToken}
                onChange={(e) => setUserToken(e.target.value)}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  padding: "8px",
                  fontSize: "14px",
                }}
              />
            </foreignObject>

            {/* دکمه تأیید */}
            <g cursor="pointer" onClick={handleVerifyToken}>
              <rect x="125" y="330" width="150" height="40" rx="8" fill="#FF7A59" />
              <text
                x="200"
                y="355"
                textAnchor="middle"
                fill="#fff"
                fontSize="14"
                fontWeight="bold"
                dominantBaseline="middle"
              >
                تأیید
              </text>
            </g>

            {/* دکمه انصراف */}
            <g cursor="pointer" onClick={() => setModalOpen(false)}>
              <rect x="125" y="390" width="150" height="40" rx="8" fill="#ccc" />
              <text
                x="200"
                y="415"
                textAnchor="middle"
                fill="#333"
                fontSize="14"
                fontWeight="bold"
                dominantBaseline="middle"
              >
                انصراف
              </text>
            </g>
          </svg>
        </div>
      )}
    </div>
  );
};

export default Settings;