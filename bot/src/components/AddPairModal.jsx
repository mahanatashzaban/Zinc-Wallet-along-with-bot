import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AddPairModal({ isOpen, onClose, user, currentFavorites }) {
  const [searchText, setSearchText] = useState("");
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter out coins already in favorites by coingeckoId to prevent duplicates
  const favoriteIds = currentFavorites.map((f) => f.coingeckoId);

  useEffect(() => {
    if (!searchText) {
      setPairs([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetchPairs(searchText);
    }, 500); // debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  async function fetchPairs(text) {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://jubilant-space-disco-9755jqrvqxgwcpg49-5000.app.github.dev/api/pairs?text=${encodeURIComponent(
          text
        )}`
      );
      setPairs(response.data);
    } catch (err) {
      setError("Failed to fetch pairs. Please try again.");
      console.error("Error fetching pairs:", err);
    } finally {
      setLoading(false);
    }
  }

  // Add coin to favorites
  async function addFavorite(pair) {
    if (!user) {
      alert("ابتدا وارد شوید.");
      return;
    }

    if (favoriteIds.includes(pair.id)) {
      alert("این ارز قبلاً اضافه شده است.");
      return;
    }

    try {
      await axios.post(
        "https://jubilant-space-disco-9755jqrvqxgwcpg49-5000.app.github.dev/api/favorites/add",
        {
          uid: user.uid,
          coingeckoId: pair.id,
          symbol: pair.symbol,
          name: pair.name,
          name_fa: "", // Optionally set Farsi name here
        }
      );
      alert("ارز با موفقیت اضافه شد.");
      onClose();
    } catch (error) {
      console.error("Error adding favorite:", error);
      alert("خطا در افزودن ارز.");
    }
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "400px",
          maxHeight: "500px",
          overflowY: "auto",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        }}
      >
        <h3 style={{ marginBottom: "12px", textAlign: "center" }}>جستجوی ارزها</h3>
        <input
          type="text"
          placeholder="نام یا نماد ارز را تایپ کنید..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "12px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
          autoFocus
        />

        {loading && <p>در حال بارگذاری...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && pairs.length === 0 && searchText && <p>ارزی پیدا نشد.</p>}

        <ul style={{ listStyle: "none", padding: 0 }}>
          {pairs
            .filter((pair) => !favoriteIds.includes(pair.id))
            .map((pair) => (
              <li
                key={pair.id}
                style={{
                  padding: "8px",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => addFavorite(pair)}
              >
                {pair.name} ({pair.symbol.toUpperCase()})
              </li>
            ))}
        </ul>

        <button
          onClick={onClose}
          style={{
            marginTop: "12px",
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            backgroundColor: "#f97316",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            border: "none",
          }}
        >
          بستن
        </button>
      </div>
    </div>
  );
}
