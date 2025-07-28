import express from "express";
import translate from "@vitalets/google-translate-api";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { text, from, to } = req.body;
    const result = await translate(text, { from, to });
    res.json({ translation: result.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Translation failed", details: err.message });
  }
});

export default router;

