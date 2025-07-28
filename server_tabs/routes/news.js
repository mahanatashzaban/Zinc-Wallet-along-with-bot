import express from "express";
import axios from "axios";
import translate from "@vitalets/google-translate-api";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolve path for firebase-adminsdk.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.resolve(__dirname, "../firebase-adminsdk.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

const router = express.Router();

// Firebase Admin SDK Initialization
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

// GET /api/news
router.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.worldnewsapi.com/search-news?api-key=6979238f7bfa4d2ca1640fd55e35953e&text=world&language=en"
    );

    const news = await Promise.all(
      response.data.news.map(async (item) => {
        const translated = await translate(item.title, { to: "fa" });
        return {
          id: item.id,
          title: translated.text,
          original: item.title,
          url: item.url,
          image: item.image,
          published: item.publish_date,
        };
      })
    );

    res.json(news);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// POST /api/news/like
router.post("/like", express.json(), async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Missing news ID" });

  const ref = db.collection("likes").doc(id);
  const doc = await ref.get();

  if (!doc.exists) {
    await ref.set({ count: 1 });
  } else {
    await ref.update({ count: admin.firestore.FieldValue.increment(1) });
  }

  const updated = await ref.get();
  res.json({ id, likes: updated.data().count });
});

// POST /api/news/comment
router.post("/comment", express.json(), async (req, res) => {
  const { id, comment } = req.body;
  if (!id || !comment) return res.status(400).json({ error: "Missing fields" });

  await db.collection("comments").add({
    newsId: id,
    text: comment,
    timestamp: Date.now(),
  });

  res.json({ message: "Comment saved." });
});

export default router;

