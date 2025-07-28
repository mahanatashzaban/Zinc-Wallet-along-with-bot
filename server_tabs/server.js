import express from "express";
import cors from "cors";
import axios from "axios";
import admin from "firebase-admin";
import fs from "fs";
import newsRoute from "./routes/news.js";
import translateRoute from "./routes/translate.js"; // ✅ ES Module import

const serviceAccount = JSON.parse(fs.readFileSync("./firebase-adminsdk.json", "utf8"));

// ✅ Initialize Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: "https://jubilant-space-disco-9755jqrvqxgwcpg49-3000.app.github.dev",
}));

// === Firebase-backed CoinGecko Caching Logic ===
const COINS_COLLECTION = "coingecko_coins_cache";
const CACHE_DOC_ID = "full_coin_list";
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

async function getCachedCoinList() {
  const docRef = db.collection(COINS_COLLECTION).doc(CACHE_DOC_ID);
  const docSnap = await docRef.get();
  if (!docSnap.exists) return null;

  const data = docSnap.data();
  if (!data || !data.list || !data.timestamp) return null;

  if (Date.now() - data.timestamp > CACHE_TTL) return null;

  return data.list;
}

async function updateCachedCoinList() {
  try {
    console.log("Fetching full coin list from CoinGecko...");
    const response = await axios.get("https://api.coingecko.com/api/v3/coins/list");
    const list = response.data;

    await db.collection(COINS_COLLECTION).doc(CACHE_DOC_ID).set({ list, timestamp: Date.now() });

    console.log(`Saved ${list.length} coins to Firestore cache.`);
    return list;
  } catch (error) {
    console.error("Failed to fetch/update coin list:", error.message);
    return null;
  }
}

// === Routes ===
app.use(express.json());
app.use("/api/translate", translateRoute);
app.use("/api/news", newsRoute);

// === Coin Search Endpoint ===
app.get("/api/pairs", async (req, res) => {
  try {
    let coinList = await getCachedCoinList();
    if (!coinList) {
      coinList = await updateCachedCoinList();
      if (!coinList) return res.status(500).json({ error: "Failed to get coin list" });
    }

    const searchText = (req.query.text || "").toLowerCase();
    if (!searchText) return res.json(coinList.slice(0, 50));

    const filtered = coinList.filter(
      (coin) =>
        coin.id.toLowerCase().includes(searchText) ||
        coin.symbol.toLowerCase().includes(searchText) ||
        coin.name.toLowerCase().includes(searchText)
    );

    return res.json(filtered.slice(0, 50));
  } catch (error) {
    console.error("Error fetching pairs:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// === Default Coins ===
const DEFAULT_COINS = [
  { id: "bitcoin", symbol: "btc", name: "Bitcoin" },
  { id: "ethereum", symbol: "eth", name: "Ethereum" },
  { id: "tether", symbol: "usdt", name: "Tether" },
  { id: "binancecoin", symbol: "bnb", name: "Binance Coin" },
  { id: "cardano", symbol: "ada", name: "Cardano" },
  { id: "ripple", symbol: "xrp", name: "XRP" },
  { id: "solana", symbol: "sol", name: "Solana" },
  { id: "polkadot", symbol: "dot", name: "Polkadot" },
  { id: "dogecoin", symbol: "doge", name: "Dogecoin" },
  { id: "matic-network", symbol: "matic", name: "Polygon" },
];

// === Get or Seed Favorites ===
app.get("/api/favorites/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    const favsRef = db.collection("favorites");
    const userFavsSnapshot = await favsRef.where("uid", "==", uid).get();

    if (userFavsSnapshot.empty) {
      const batch = db.batch();
      DEFAULT_COINS.forEach((coin) => {
        const docRef = favsRef.doc();
        batch.set(docRef, {
          uid,
          coingeckoId: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          name_fa: "",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();

      const seededSnapshot = await favsRef.where("uid", "==", uid).get();
      const seeded = seededSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return res.json(seeded);
    }

    const favorites = userFavsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json(favorites);
  } catch (error) {
    console.error("Error fetching/creating favorites:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// === Add Favorite ===
app.post("/api/favorites/add", async (req, res) => {
  const { uid, coingeckoId, symbol, name, name_fa } = req.body;
  if (!uid || !coingeckoId || !symbol || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const favsRef = db.collection("favorites");
    const existing = await favsRef
      .where("uid", "==", uid)
      .where("coingeckoId", "==", coingeckoId)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(400).json({ error: "Coin already in favorites" });
    }

    const docRef = await favsRef.add({
      uid,
      coingeckoId,
      symbol,
      name,
      name_fa: name_fa || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({ id: docRef.id });
  } catch (error) {
    console.error("Error adding favorite:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// === Delete Favorite ===
app.delete("/api/favorites/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Missing favorite id" });

  try {
    await db.collection("favorites").doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error("Error removing favorite:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// === Root Health Check ===
app.get("/", (req, res) => {
  res.send("✅ Backend API is running!");
});

// === Start Server ===
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
