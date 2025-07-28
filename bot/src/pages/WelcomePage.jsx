import React from "react";
import { auth, provider } from "../firebase"; // مسیر صحیح فایل firebase خود را وارد کنید
import { signInWithPopup } from "firebase/auth";

const WelcomePage = ({ onLoginSuccess }) => {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("✅ User signed in:", result.user);
      localStorage.setItem("isLoggedIn", "true");
      onLoginSuccess();
    } catch (error) {
      console.error("Google login failed:", error);
      alert("ورود با گوگل انجام نشد.");
    }
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 1920 1080' width='100%' height='100%' preserveAspectRatio='cover' xmlns='http://www.w3.org/2000/svg'><rect width='100%' height='100%' fill='%23FF6A4D'/></svg>")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      {/* محتوا */}
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          padding: "30px",
          backgroundColor: "#FF6A4D",
          borderRadius: "15px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
        dir="rtl"
      >
        <div style={{ width: "150px", height: "150px" }}>
          <RobotLogo />
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "10px" }}>به ربات معامله‌گر خوش آمدید</h1>
        <p style={{ fontSize: "1rem", marginBottom: "20px" }}>با حساب گوگل وارد شوید تا ادامه دهید</p>
        {/* دکمه ورود */}
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <SvgLoginButton onClick={handleLogin} label="ورود با گوگل" />
        </div>
      </div>
    </div>
  );
};

const RobotLogo = () => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 200 240"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* پس‌زمینه */}
      <rect width="100%" height="100%" fill="#FF6A4D" />

      {/* سر */}
      <rect x="50" y="20" rx="30" ry="30" width="100" height="120" fill="#FFFFFF" />

      {/* چشم‌ها */}
      <circle cx="80" cy="60" r="10" fill="#FF6A4D" className="blink" />
      <circle cx="120" cy="60" r="10" fill="#FF6A4D" className="blink" />

      {/* لبخند */}
      <path d="M80 90 Q100 110 120 90" fill="none" stroke="#FF6A4D" strokeWidth="5" strokeLinecap="round" />

      {/* میله‌های شمع */}
      <rect x="65" y="100" width="8" height="25" fill="#FF6A4D" />
      <rect x="80" y="95" width="8" height="35" fill="#FF6A4D" />
      <rect x="95" y="90" width="8" height="40" fill="#FF6A4D" />
      <rect x="110" y="95" width="8" height="30" fill="#FF6A4D" />

      {/* آنتن */}
      <circle cx="100" cy="10" r="6" fill="#FFFFFF" />
      <line x1="100" y1="10" x2="100" y2="20" stroke="#FFFFFF" strokeWidth="4" />

      {/* متن */}
      <text x="100" y="200" fontFamily="Arial, sans-serif" fontSize="36" fill="#FF6A4D" textAnchor="middle">
        zinc
      </text>

      {/* استایل‌های چشمک‌زدن */}
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          .blink {
            animation: blink 2s infinite;
          }
        `}
      </style>
    </svg>
  );
};

const SvgLoginButton = ({ onClick, label }) => (
  <svg
    width="220"
    height="50"
    viewBox="0 0 220 50"
    xmlns="http://www.w3.org/2000/svg"
    style={{ cursor: "pointer" }}
    onClick={onClick}
  >
    {/* پس‌زمینه */}
    <rect width="100%" height="100%" fill="#FFFFFF" rx="8" ry="8" />
    {/* متن */}
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontSize="16"
      fill="#FF7A59"
      fontWeight="bold"
    >
      {label}
    </text>
  </svg>
);

export default WelcomePage;