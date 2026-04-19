import express from "express";
import Task from "../models/Task.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// GET tasks
router.get("/", verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE task
router.post("/", verifyToken, async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      userId: req.user.id,
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE task
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id }, //Ownership check
      req.body,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE task
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id, //Ownership check
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;