import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

// وارد کردن صفحات و تب‌ها
import Sidebar from "./components/Sidebar";
import WelcomePage from "./pages/WelcomePage";
import Login from "./pages/Login";

import About from "./pages/About";
import Account from "./pages/Account";
import Wallet from "./pages/Wallet";
import Bot from "./pages/Bot";
import Ticket from "./pages/Ticket";
import Identity from "./pages/Identity";
import Settings from "./pages/Settings";
import Logout from "./pages/Logout";
import Terms from "./pages/Terms";
import BotReport from "./pages/BotReport";

// تب‌ها
import Favorites from "./tabs/Favorites";
import Charts from "./tabs/Charts";
import News from "./tabs/News";
import Chat from "./tabs/Chat";
import Zinc from "./tabs/Zinc"; // صفحه Zinc

// آیکون‌ها
const HamburgerIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ cursor: "pointer" }}
  >
    <rect y="4" width="24" height="2" fill="#000" rx="1" />
    <rect y="11" width="24" height="2" fill="#000" rx="1" />
    <rect y="18" width="24" height="2" fill="#000" rx="1" />
  </svg>
);

const FavoritesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#FDF2FF" strokeWidth="2" fill="#FDF2FF"/>
    <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#000" fontFamily="Arial, sans-serif">
      ₿
    </text>
  </svg>
);

const ChartsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="17" width="4" height="4" fill="#FDF2FF" />
    <rect x="9" y="13" width="4" height="8" fill="#FDF2FF" />
    <rect x="15" y="9" width="4" height="12" fill="#FDF2FF" />
  </svg>
);

const NewsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4h16v16H4V4z" stroke="#FDF2FF" strokeWidth="2"/>
    <path d="M8 8h8v2H8v-2z" fill="#FDF2FF" />
  </svg>
);

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="#FDF2FF" strokeWidth="2" fill="none"/>
  </svg>
);

const ZincIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* آیکون مخصوص Zinc */}
    <circle cx="12" cy="12" r="10" stroke="#FDF2FF" strokeWidth="2" fill="#FDF2FF"/>
  </svg>
);

function AppWrapper() {
  const [activeTab, setActiveTab] = useState("favorites");
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();

  const renderTabContent = () => {
    switch (activeTab) {
      case "favorites": return <Favorites />;
      case "charts": return <Charts />;
      case "news": return <News />;
      case "chat": return <Chat />;
      default: return <Favorites />;
    }
  };

  return (
    <div dir="rtl" className="flex flex-col h-screen bg-gray-100 relative">
      {/* منوی همبرگر */}
      <button
        onClick={() => setShowSidebar(true)}
        className="absolute top-4 right-4 z-50 bg-white border rounded p-2 shadow-md"
      >
        <HamburgerIcon />
      </button>

      {/* Sidebar */}
      <Sidebar showMobile={showSidebar} onClose={() => setShowSidebar(false)} />

      {/* محتوای اصلی */}
      <div className="flex-1 overflow-y-auto pt-16 pb-20 px-4">
        <Routes>
          {/* مسیرهای صفحات */}
          <Route path="/about" element={<About />} />
          <Route path="/account" element={<Account />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/bot" element={<Bot />} />
          <Route path="/bot-report" element={<BotReport />} />
          <Route path="/ticket" element={<Ticket />} />
          <Route path="/identity" element={<Identity />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/logout" element={<Logout />} />

          {/* مسیر صفحه Zinc */}
          <Route path="/tabs/zinc" element={<Zinc />} />

          {/* تب‌های پایین */}
          <Route path="/" element={renderTabContent()} />
        </Routes>
      </div>

      {/* منوهای پایین */}
      <div className="fixed bottom-0 w-full flex justify-around bg-orange-500 text-white py-2 border-t border-orange-600 z-40">
        <button
          onClick={() => {
            navigate("/");
            setActiveTab("favorites");
          }}
          className="flex flex-col items-center"
        >
          <FavoritesIcon />
          <span className="text-sm">لیست ارزها</span>
        </button>
        <button
          onClick={() => {
            navigate("/");
            setActiveTab("charts");
          }}
          className="flex flex-col items-center"
        >
          <ChartsIcon />
          <span className="text-sm">نمودارها</span>
        </button>
        <button
          onClick={() => {
            navigate("/");
            setActiveTab("news");
          }}
          className="flex flex-col items-center"
        >
          <NewsIcon />
          <span className="text-sm">وضعیت ارزها</span>
        </button>
        <button
          onClick={() => {
            navigate("/");
            setActiveTab("chat");
          }}
          className="flex flex-col items-center"
        >
          <ChatIcon />
          <span className="text-sm">چت</span>
        </button>
        {/* تب Zinc */}
        <button
          onClick={() => {
            navigate("/tabs/zinc");
            setActiveTab("zinc");
          }}
          className="flex flex-col items-center"
        >
          <ZincIcon />
          <span className="text-sm">Zinc</span>
        </button>
      </div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const storedLogin = localStorage.getItem("isLoggedIn");
    if (storedLogin === "true") {
      setIsLoggedIn(true);
      setShowWelcome(false);
    }
  }, []);

  const handleLoginSuccess = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
    setShowWelcome(false);
  };

  return (
    <Router>
      {showWelcome ? (
        <WelcomePage onLoginSuccess={handleLoginSuccess} />
      ) : !isLoggedIn ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <AppWrapper />
      )}
    </Router>
  );
}

export default App;