import React, { useEffect, useState } from "react";
import axios from "axios";

// Reusable SVG overlay component for cards and buttons
const OverlayCard = ({ width, height, style }) => (
  <svg
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    style={{ display: "block", ...style }}
  >
    <defs>
      <linearGradient id="cardGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.02)" />
      </linearGradient>
    </defs>
    <rect
      width="100%"
      height="100%"
      fill="url(#cardGradient)"
      rx="12"
    />
  </svg>
);

const OverlayButton = ({ width, height, style }) => (
  <svg
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    style={{ display: "block", position: "absolute", top: 0, right: 0, ...style }}
  >
    <defs>
      <linearGradient id="buttonGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
      </linearGradient>
    </defs>
    <rect
      width="100%"
      height="100%"
      fill="url(#buttonGradient)"
      rx="8"
    />
  </svg>
);

export default function News() {
  const [coins, setCoins] = useState([]);
  const [filter, setFilter] = useState("trending");

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        let endpoint = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc";

        if (filter === "positive") {
          endpoint += "&price_change_percentage=24h";
        } else if (filter === "negative") {
          endpoint += "&price_change_percentage=24h";
        } else if (filter === "new") {
          endpoint = "https://api.coingecko.com/api/v3/coins/list?include_platform=false";
        } else if (filter === "trending") {
          endpoint = "https://api.coingecko.com/api/v3/search/trending";
        }

        const { data } = await axios.get(endpoint);

        if (filter === "trending") {
          setCoins(data.coins.map(c => c.item));
        } else if (filter === "new") {
          const newList = data.slice(0, 10);
          const details = await Promise.all(
            newList.map(async coin => {
              try {
                const { data: detail } = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin.id}`);
                return detail;
              } catch {
                return null;
              }
            })
          );
          setCoins(details.filter(Boolean));
        } else {
          setCoins(data);
        }
      } catch (err) {
        console.error("Error fetching coins:", err);
      }
    };

    fetchCoins();
  }, [filter]);

  return (
    <div className="p-4">
      {/* Buttons row in four columns with overlays */}
      <div className="grid grid-cols-4 gap-4 mb-4 relative">
        {/* Button 1 */}
        <div className="relative">
          <OverlayButton width={150} height={40} style={{ position: "absolute", top: 0, right: 0 }} />
          <button
            onClick={() => setFilter("trending")}
            className="relative w-full h-full flex items-center justify-center px-4 py-2 text-white font-semibold rounded"
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.8)", // semi-transparent blue
              zIndex: 1,
            }}
          >
            محبوب‌ترین‌ها
          </button>
        </div>
        {/* Button 2 */}
        <div className="relative">
          <OverlayButton width={150} height={40} style={{ position: "absolute", top: 0, right: 0 }} />
          <button
            onClick={() => setFilter("positive")}
            className="relative w-full h-full flex items-center justify-center px-4 py-2 text-white font-semibold rounded"
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.8)", // greenish
              zIndex: 1,
            }}
          >
            رشد کرده‌ها
          </button>
        </div>
        {/* Button 3 */}
        <div className="relative">
          <OverlayButton width={150} height={40} style={{ position: "absolute", top: 0, right: 0 }} />
          <button
            onClick={() => setFilter("negative")}
            className="relative w-full h-full flex items-center justify-center px-4 py-2 text-white font-semibold rounded"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.8)", // red
              zIndex: 1,
            }}
          >
            سقوط کرده‌ها
          </button>
        </div>
        {/* Button 4 */}
        <div className="relative">
          <OverlayButton width={150} height={40} style={{ position: "absolute", top: 0, right: 0 }} />
          <button
            onClick={() => setFilter("new")}
            className="relative w-full h-full flex items-center justify-center px-4 py-2 text-white font-semibold rounded"
            style={{
              backgroundColor: "rgba(251, 191, 36, 0.8)", // yellow
              zIndex: 1,
            }}
          >
            ارزهای تازه متولد شده
          </button>
        </div>
      </div>

      {/* Coins grid with overlay cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {coins.map((coin, i) => (
          <div key={i} className="relative rounded-xl p-4 shadow-sm flex flex-col items-center text-center bg-white">
            {/* Overlay background for card */}
            <OverlayCard width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }} />
            {/* Content */}
            <img src={coin.image || coin.thumb} alt={coin.name} className="w-12 h-12 mb-2 z-10" />
            <h2 className="font-semibold z-10">{coin.name}</h2>
            <p className="text-sm text-gray-500 z-10">{coin.symbol?.toUpperCase()}</p>
            {coin.market_data?.current_price?.usd && (
              <p className="mt-2 text-green-600 font-bold z-10">${coin.market_data.current_price.usd}</p>
            )}
            {coin.price_change_percentage_24h && (
              <p
                className={`mt-1 text-sm ${
                  coin.price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"
                } z-10`}
              >
                {coin.price_change_percentage_24h.toFixed(2)}%
              </p>
            )}
            {filter === "new" && coin.description?.en && (
              <p className="mt-2 text-xs text-gray-600 line-clamp-3 z-10">
                {coin.description.en.replace(/<[^>]+>/g, "").slice(0, 100)}...
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}