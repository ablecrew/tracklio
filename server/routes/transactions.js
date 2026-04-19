import express from "express";
import Transaction from "../models/Transaction.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// GET
router.get("/", verifyToken, async (req, res) => {
  const data = await Transaction.find({ userId: req.user.id });
  res.json(data);
});

// POST
router.post("/", verifyToken, async (req, res) => {
  const tx = await Transaction.create({
    ...req.body,
    userId: req.user.id
  });
  res.json(tx);
});

export default router;