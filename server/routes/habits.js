import express from "express";
import Habit from "../models/Habit.js";
import { verifyToken } from "../middleware/auth.js"; //  Add import

const router = express.Router();

// GET ALL HABITS
router.get("/", verifyToken, async (req, res) => { // Add verifyToken
  try {
    const habits = await Habit.find({ userId: req.user.id }) // Filter by user
      .sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE HABIT
router.post("/", verifyToken, async (req, res) => { // Add verifyToken
  try {
    const habit = new Habit({
      name: req.body.name,
      userId: req.user.id, // Save userId
    });

    const saved = await habit.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET HABIT LOGS
router.get("/:id/logs", verifyToken, async (req, res) => { // Add verifyToken
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user.id, // Ownership check
    });

    if (!habit) {
      return res.status(404).json({ error: "Habit not found or unauthorized" });
    }

    res.json(habit.history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOG / TOGGLE TODAY
router.post("/:id/logs", verifyToken, async (req, res) => { // Add verifyToken
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user.id, // Ownership check
    });

    if (!habit) {
      return res.status(404).json({ error: "Habit not found or unauthorized" });
    }

    const today = new Date().toISOString().split("T")[0];
    let entry = habit.history.find(h => h.date === today);

    if (entry) {
      entry.completed = !entry.completed;
    } else {
      habit.history.push({ date: today, completed: true });
    }

    const sorted = habit.history
      .filter(h => h.completed)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    let streak = 0;
    let currentDate = new Date();

    for (let i = 0; i < sorted.length; i++) {
      const d = new Date(sorted[i].date);
      if (d.toDateString() === currentDate.toDateString()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    habit.streak = streak;
    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE HABIT
router.delete("/:id", verifyToken, async (req, res) => { // Add verifyToken
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id, // Ownership check
    });

    if (!habit) {
      return res.status(404).json({ error: "Habit not found or unauthorized" });
    }

    res.json({ message: "Habit deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;