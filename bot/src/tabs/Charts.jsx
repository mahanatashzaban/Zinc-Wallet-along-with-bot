import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

// Reusable SVG overlay component for high-quality buttons and containers
const OverlayContainer = ({ width, height, children, style }) => (
  <svg
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    style={{ display: "block", ...style }}
  >
    {/* Gradient overlay for high-res effect */}
    <defs>
      <linearGradient id="containerGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.05)" />
      </linearGradient>
    </defs>
    {/* Overlay rectangle with rounded corners */}
    <rect
      width="100%"
      height="100%"
      fill="url(#containerGradient)"
      rx="12"
    />
    {/* Render children inside overlay */}
    {children}
  </svg>
);

export default function Charts() {
  const tvRef = useRef();
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [allSymbols, setAllSymbols] = useState([]);
  const [search, setSearch] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [theme, setTheme] = useState("dark"); // light or dark

  useEffect(() => {
    axios
      .get("https://api.binance.com/api/v3/exchangeInfo")
      .then((res) => {
        const symbols = res.data.symbols
          .filter((s) => s.status === "TRADING" && s.quoteAsset === "USDT")
          .map((s) => s.symbol);
        setAllSymbols(symbols);
      });
  }, []);

  useEffect(() => {
    if (!tvRef.current) return;
    // Clear previous widget
    tvRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;

    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          symbol: `BINANCE:${symbol}`,
          interval: "60",
          container_id: "tv_chart_container",
          timezone: "Etc/UTC",
          theme: theme,
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          save_image: false,
          studies: [],
          withdateranges: true,
          width: "100%",
          height: 500,
        });
      }
    };

    tvRef.current.appendChild(script);
  }, [symbol, theme]);

  const filteredSymbols = allSymbols.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 font-iransans max-w-7xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold mb-4 text-orange-600">
        نمودار قیمت {symbol}
      </h1>

      {/* Buttons with SVG overlays */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Overlay-wrapped button for selecting symbol */}
        <div className="relative">
          <OverlayContainer
            width={150}
            height={50}
            style={{ position: "absolute", top: 0, right: 0 }}
          >
            {/* Optional: add visual effects or icons inside overlay */}
          </OverlayContainer>
          <button
            onClick={() => setShowPopup(true)}
            className="relative px-4 py-2 text-white font-semibold rounded"
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.8)", // semi-transparent blue
              zIndex: 1,
            }}
          >
            انتخاب ارز
          </button>
        </div>

        {/* Overlay-wrapped theme toggle button */}
        <div className="relative">
          <OverlayContainer
            width={150}
            height={50}
            style={{ position: "absolute", top: 0, right: 0 }}
          >
            {/* Optional overlay styles */}
          </OverlayContainer>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative px-4 py-2 text-white font-semibold rounded"
            style={{
              backgroundColor: "rgba(107, 114, 128, 0.8)", // semi-transparent gray
              zIndex: 1,
            }}
          >
            تم: {theme === "dark" ? "تاریک" : "روشن"}
          </button>
        </div>
      </div>

      {/* Popup for symbol selection with overlay style */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            {/* Overlay background effect */}
            <OverlayContainer
              width={400}
              height={300}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              {/* Optional animated overlay or gradient */}
            </OverlayContainer>
            {/* Popup header */}
            <div className="flex justify-between mb-4 relative z-10">
              <h2 className="text-xl font-bold text-gray-800">انتخاب ارز</h2>
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                ❌
              </button>
            </div>
            {/* Search input with overlay */}
            <div className="relative mb-4 z-10">
              <OverlayContainer
                width="100%"
                height={40}
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: "8px",
                }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجو..."
                className="w-full border px-3 py-2 rounded z-20 relative"
              />
            </div>
            {/* Symbols list with overlay background */}
            <div className="max-h-64 overflow-y-auto space-y-2 relative z-10">
              {filteredSymbols.map((s) => (
                <div
                  key={s}
                  onClick={() => {
                    setSymbol(s);
                    setShowPopup(false);
                  }}
                  className="cursor-pointer hover:bg-gray-100 p-2 rounded text-right"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TradingView chart container with overlay style */}
      <div
        id="tv_chart_container"
        ref={tvRef}
        style={{
          minHeight: "500px",
          width: "100%",
          position: "relative",
        }}
      >
        {/* Optional overlay effect for chart container */}
        <OverlayContainer
          width="100%"
          height="100%"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "12px",
            pointerEvents: "none", // allow clicks to pass through
          }}
        />
      </div>
    </div>
  );
}