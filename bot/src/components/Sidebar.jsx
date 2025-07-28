import React from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const navItems = [
  { label: "درباره ما", path: "/about" },
  { label: "حساب کاربری", path: "/account" },
  { label: "کیف پول من", path: "/wallet" },
  { label: "گزارش عملکرد ربات", path: "/bot-report" },
  { label: "ربات من", path: "/bot" },
  { label: "ارسال تیکت", path: "/ticket" },
  { label: "احراز هویت", path: "/identity" },
  { label: "تنظیمات", path: "/settings" },
  { label: "شرایط و ضوابط", path: "/terms" },
  { label: "خروج", path: "/logout" },
];

const Sidebar = ({ showMobile, onClose }) => {
  const navigate = useNavigate();

  const itemSpacing = 40; // فاصله بین آیتم‌ها
  const startY = 100; // نقطه شروع آیتم‌ها در ارتفاع
  const sidebarWidth = 200; // عرض نسبی برای Sidebar

  return (
    <>
      {showMobile && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={onClose}></div>
      )}

      <div
        className={`fixed top-0 right-0 h-full z-50 shadow-lg transition-transform duration-300`}
        style={{
          width: "200px", // عرض کم‌تر
          transform: showMobile ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* SVG پس‌زمینه */}
        <svg
          viewBox="0 0 220 550"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* پس‌زمینه سفید و گوشه‌های گرد */}
          <rect width="100%" height="100%" fill="#fff" rx="10" ry="10" />

          {/* آیتم‌های منو در سمت راست و راست‌چین */}
          {navItems.map((item, index) => {
            const yPos = startY + index * itemSpacing;
            return (
              <text
                key={item.path}
                x="35%" // نزدیک به لبه راست
                y={`${yPos}`}
                fill="#000"
                fontSize="16"
                fontFamily="Vazirmatn, Arial, sans-serif"
                dominantBaseline="right"
                textAnchor="end" // راست‌چین کردن متن
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
              >
                {item.label}
              </text>
            );
          })}

          {/* دکمه بستن در بالا سمت راست */}
          <g
            style={{ cursor: "pointer" }}
            onClick={onClose}
            transform="translate(280, 20)"
          >
            <X width={24} height={24} fill="#000" />
          </g>
        </svg>
      </div>
    </>
  );
};

export default Sidebar;