import express from "express";
import { chatWithAI } from "../services/openaiChat.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message, context } = req.body;

    const reply = await chatWithAI({ message, context });

    res.json({ reply });

  } catch (err) {
    res.status(500).json({ message: "Chat failed" });
  }
});

export default router;