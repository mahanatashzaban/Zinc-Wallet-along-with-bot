import React, { useState, useEffect, useRef } from "react";
import backgroundImage from "../assets/background.png";

const RegistrationSVG = () => {
  const [formData, setFormData] = useState({
    phone: "",
    fullName: "",
    email: "",
    address: "",
    nationalId: "",
  });

  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    alert("ذخیره اطلاعات انجام شد");
  };

  const handleEdit = () => {
    alert("وضعیت ویرایش فعال شد");
  };

  // Adjusted size based on device
  const viewBoxHeight = isMobile ? 950 : 850;
  const rectHeight = isMobile ? 850 : 700;
  const buttonY = isMobile ? 800 : 660;
  const buttonHeight = isMobile ? 70 : 50;
  const buttonWidth = isMobile ? 160 : 130;
  const buttonTextY = buttonY + buttonHeight / 2 + 2;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <svg
          viewBox={`0 0 600 ${viewBoxHeight}`}
          style={{ width: "100%", height: "auto" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="170%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="10" floodColor="rgba(0, 0, 0, 0.2)" />
            </filter>
          </defs>

          {/* Bigger rectangle on mobile */}
          <rect
  x={isMobile ? 20 : 50}
  y="50"
  width={isMobile ? 560 : 500}
  height={rectHeight}
  rx="20"
  ry="20"
  fill="#36454F"
  filter="url(#shadow)"
/>

          {/* Save Button */}
          <rect
            x="150"
            y={buttonY}
            width={buttonWidth}
            height={buttonHeight}
            rx="25"
            ry="25"
            fill="#F97316"
            style={{ cursor: "pointer" }}
            onClick={handleSave}
          />
          <text
            x={150 + buttonWidth / 2}
            y={buttonTextY}
            fontSize="20"
            fill="#fff"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="inherit"
            style={{ cursor: "pointer" }}
            onClick={handleSave}
          >
            ذخیره اطلاعات
          </text>

          {/* Edit Button */}
          <rect
            x="320"
            y={buttonY}
            width={buttonWidth}
            height={buttonHeight}
            rx="25"
            ry="25"
            fill="#ccc"
            style={{ cursor: "pointer" }}
            onClick={handleEdit}
          />
          <text
            x={320 + buttonWidth / 2}
            y={buttonTextY}
            fontSize="20"
            fill="#333"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="inherit"
            style={{ cursor: "pointer" }}
            onClick={handleEdit}
          >
            ویرایش
          </text>
        </svg>

        {/* Form Inputs */}
        <div
          style={{
            position: "absolute",
            top: -60,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              width: "90%",
              maxWidth: "400px",
              pointerEvents: "auto",
            }}
          >
            <input
              type="text"
              name="phone"
              placeholder="مثلاً ۰۹۱۲..."
              value={formData.phone}
              onChange={handleChange}
              style={{
                height: "40px",
                borderRadius: "5px",
                border: "none",
                padding: "0 10px",
                background: "#F3F4F6",
                fontSize: "14px",
                width: "100%",
              }}
            />
            <input
              type="text"
              name="fullName"
              placeholder="مثلاً احسان آتش زبان"
              value={formData.fullName}
              onChange={handleChange}
              style={{
                height: "40px",
                borderRadius: "5px",
                border: "none",
                padding: "0 10px",
                background: "#F3F4F6",
                fontSize: "14px",
                width: "100%",
              }}
            />
            <input
              type="email"
              name="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleChange}
              style={{
                height: "40px",
                borderRadius: "5px",
                border: "none",
                padding: "0 10px",
                background: "#F3F4F6",
                fontSize: "14px",
                width: "100%",
              }}
            />
            <input
              type="text"
              name="address"
              placeholder="مثلاً تهران، خیابان آزادی، پلاک ۱۲"
              value={formData.address}
              onChange={handleChange}
              style={{
                height: "40px",
                borderRadius: "5px",
                border: "none",
                padding: "0 10px",
                background: "#F3F4F6",
                fontSize: "14px",
                width: "100%",
              }}
            />
            <input
              type="text"
              name="nationalId"
              placeholder="مثلاً ۱۲۳۴۵۶۷۸۹۰"
              value={formData.nationalId}
              onChange={handleChange}
              style={{
                height: "40px",
                borderRadius: "5px",
                border: "none",
                padding: "0 10px",
                background: "#F3F4F6",
                fontSize: "14px",
                width: "100%",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSVG;
