import React from "react";

const RobotLogo = () => {
  return (
    <svg width="200" height="240" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
      {/* Background */}
      <rect width="100%" height="100%" fill="#f8f1e8" />

      {/* Robot head */}
      <rect x="50" y="20" rx="30" ry="30" width="100" height="120" fill="#ffffffff" />

      {/* چشم‌ها */}
      <circle cx="80" cy="60" r="6" fill="#f8f1e8" className="blink" />
      <circle cx="120" cy="60" r="6" fill="#f8f1e8" className="blink" />

      {/* لبخند */}
      <path d="M80 90 Q100 110 120 90" fill="none" stroke="#f8f1e8" strokeWidth="5" strokeLinecap="round" />

      {/* میله‌های شمع */}
      <rect x="65" y="100" width="8" height="25" fill="#f8f1e8" />
      <rect x="80" y="95" width="8" height="35" fill="#f8f1e8" />
      <rect x="95" y="90" width="8" height="40" fill="#f8f1e8" />
      <rect x="110" y="95" width="8" height="30" fill="#f8f1e8" />

      {/* آنتن */}
      <circle cx="100" cy="10" r="6" fill="#ffffffff" />
      <line x1="100" y1="10" x2="100" y2="20" stroke="#ffffffff" strokeWidth="4" />

      {/* متن */}
      <text x="100" y="200" fontFamily="Arial, sans-serif" fontSize="36" fill="#fcfcfcff" textAnchor="middle">zinc</text>

      {/* استایل‌های داخلی برای انیمیشن */}
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

export default RobotLogo;