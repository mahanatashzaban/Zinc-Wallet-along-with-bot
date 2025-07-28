// src/Favorites.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Favorites() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch top coins or filtered coins based on search
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets",
          {
            params: {
              vs_currency: "usd",
              order: "market_cap_desc",
              per_page: 20,
              page: 1,
              sparkline: true,
              price_change_percentage: "24h",
            },
          }
        );
        setCoins(res.data);
      } catch (e) {
        setError("خطایی در بارگذاری داده‌ها رخ داد");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="font-vazirmatn min-h-screen bg-gray-100 p-4 rtl">
      {/* هدر و جستجو */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
        <h1 className="text-2xl font-bold text-orange-600 mb-2 md:mb-0">لیست علاقه‌مندی‌ها</h1>
        <input
          type="text"
          placeholder="جستجو در رمزارزها..."
          className="border border-gray-300 rounded px-3 py-2 text-right w-full md:w-64"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {loading && <p className="text-center">در حال بارگذاری...</p>}
      {error && <p className="text-red-600 text-center">{error}</p>}

      {/* لیست رمزارزها */}
      <div className="overflow-x-auto border border-gray-300 rounded shadow-sm bg-white">
        <table className="min-w-full text-sm table-auto rtl">
          <thead className="bg-orange-100">
            <tr>
              <th className="p-2 border px-4">لوگو</th>
              <th className="p-2 border px-4">نام</th>
              <th className="p-2 border px-4">علامت</th>
              <th className="p-2 border px-4">نمودار ۷ روزه</th>
              <th className="p-2 border px-4">قیمت (دلار)</th>
              <th className="p-2 border px-4">حجم ۲۴ ساعت (دلار)</th>
              <th className="p-2 border px-4">تغییر ۲۴ ساعت (%)</th>
              <th className="p-2 border px-4">حجم بازار (دلار)</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin) => (
              <tr
                key={coin.id}
                className="border-b hover:bg-orange-50 cursor-pointer"
                onClick={() => navigate(`/charts/${coin.symbol.toUpperCase()}USDT`)}
              >
                <td className="p-2 border px-4">
                  <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full mx-auto" />
                </td>
                <td className="p-2 border px-4">{coin.name}</td>
                <td className="p-2 border px-4 uppercase font-semibold">{coin.symbol}</td>
                <td className="p-2 border px-4">
                  {/* نمودار کوچک */}
                  <div className="w-full h-20">
                    {/* کد نمودار */}
                  </div>
                </td>
                <td className="p-2 border px-4">{coin.current_price?.toLocaleString()}</td>
                <td className="p-2 border px-4">{coin.total_volume?.toLocaleString()}</td>
                <td
                  className={`p-2 border px-4 ${
                    coin.price_change_percentage_24h > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {coin.price_change_percentage_24h?.toFixed(2)}%
                </td>
                <td className="p-2 border px-4">{coin.market_cap?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}