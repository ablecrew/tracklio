import express from "express";
import { generateInsights } from "../services/openaiService.js";

const router = express.Router();

// POST /api/ai/analyze
router.post("/analyze", async (req, res) => {
  try {
    const { tasks, transactions } = req.body;

    const aiData = await generateInsights(tasks, transactions);

    res.json(aiData);

  } catch (err) {
    res.status(500).json({ message: "AI analysis failed" });
  }
});

export default router;