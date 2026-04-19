import express from "express";
import mongoose from "mongoose";

import User         from "../models/User.js";
import Task         from "../models/Task.js";
import Transaction  from "../models/Transaction.js";
import Notification from "../models/Notification.js";

import { verifyToken }  from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = express.Router();

/* All admin routes require valid JWT + admin role */
router.use(verifyToken, requireAdmin);

/*
 * ── In-memory presence store ────────────────────────────────────
 * Tracks which users are "online" using a heartbeat pattern.
 * In production, replace with Redis SETEX for multi-instance safety.
 * Frontend calls: PUT /api/admin/presence  (every 30s when active)
 * This endpoint does NOT require admin — it's called by all users.
 */
const presenceMap = new Map(); /* userId → lastSeen timestamp */

/* ─────────────────────────────────────────────
   PUT /api/presence  (called by ALL logged-in users, no admin required)
   Updates the user's last-seen timestamp.
───────────────────────────────────────────── */
router.put("/presence", verifyToken, async (req, res) => {
  try {
    const uid = req.user.id;
    presenceMap.set(uid, Date.now());
    /* Update lastLoginAt on the User doc too */
    await User.findByIdAndUpdate(uid, { lastLoginAt: new Date() });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Helper: get set of online userIds (active in last 5 minutes) */
function getOnlineIds() {
  const cutoff = Date.now() - 5 * 60 * 1000;
  const ids = [];
  presenceMap.forEach((ts, uid) => { if (ts > cutoff) ids.push(uid); });
  return ids;
}

/* ─────────────────────────────────────────────
   GET /api/admin/presence
   Returns array of currently online user IDs.
───────────────────────────────────────────── */
router.get("/presence", async (req, res) => {
  try {
    res.json({ onlineIds: getOnlineIds(), count: getOnlineIds().length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────
   GET /api/admin/stats
───────────────────────────────────────────── */
router.get("/stats", async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);

    const [totalUsers, activeUsers, proUsers, newToday, totalTasks, totalTransactions, suspendedUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status:"active" }),
      User.countDocuments({ plan:"pro" }),
      User.countDocuments({ createdAt:{ $gte:today } }),
      Task.countDocuments(),
      Transaction.countDocuments(),
      User.countDocuments({ status:"suspended" }),
    ]);

    const revenue         = proUsers * 2999;
    const avgTasksPerUser = totalUsers > 0 ? Math.round(totalTasks / totalUsers) : 0;
    const avgTransPerUser = totalUsers > 0 ? Math.round(totalTransactions / totalUsers) : 0;
    const thirtyDaysAgo   = new Date(Date.now() - 30 * 86400000);
    const inactiveCount   = await User.countDocuments({ updatedAt:{ $lt:thirtyDaysAgo }, status:"active" });
    const churnRate       = totalUsers > 0 ? Number(((inactiveCount/totalUsers)*100).toFixed(1)) : 0;
    const onlineNow       = getOnlineIds().length;

    res.json({ totalUsers, activeUsers, proUsers, newToday, suspendedUsers, totalTasks, totalTransactions, revenue, avgTasksPerUser, avgTransPerUser, churnRate, onlineNow });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────
   GET /api/admin/users
───────────────────────────────────────────── */
router.get("/users", async (req, res) => {
  try {
    const { search="", status="", plan="", limit=200, skip=0, sort="createdAt", order="desc" } = req.query;

    const query = {};
    if (status) query.status = status;
    if (plan)   query.plan   = plan;
    if (search) query.$or = [
      { name:  { $regex:search, $options:"i" } },
      { email: { $regex:search, $options:"i" } },
    ];

    const users = await User.find(query).select("-password -settings")
      .sort({ [sort]: order==="asc"?1:-1 }).skip(Number(skip)).limit(Number(limit));

    /* Attach task counts */
    const userIds   = users.map(u=>u._id);
    const taskCounts= await Task.aggregate([
      { $match:{ userId:{ $in:userIds } } },
      { $group:{ _id:"$userId", count:{ $sum:1 } } },
    ]);
    const taskMap = Object.fromEntries(taskCounts.map(t=>[String(t._id),t.count]));
    const onlineIds = getOnlineIds();

    const enriched = users.map(u=>({
      ...u.toObject(),
      taskCount: taskMap[String(u._id)]||0,
      isOnline:  onlineIds.includes(String(u._id)),
    }));

    const total = await User.countDocuments(query);
    res.json({ users:enriched, total });
  } catch (err) {
    res.status(500).json({ error:err.message });
  }
});

/* ─────────────────────────────────────────────
   GET /api/admin/users/:id
───────────────────────────────────────────── */
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error:"User not found" });
    const [taskCount, txCount] = await Promise.all([
      Task.countDocuments({ userId:req.params.id }),
      Transaction.countDocuments({ userId:req.params.id }),
    ]);
    res.json({ ...user.toObject(), taskCount, txCount, isOnline:getOnlineIds().includes(req.params.id) });
  } catch (err) {
    res.status(500).json({ error:err.message });
  }
});

/* ─────────────────────────────────────────────
   PUT /api/admin/users/:id/suspend
───────────────────────────────────────────── */
router.put("/users/:id/suspend", async (req, res) => {
  try {
    if (String(req.params.id)===String(req.user.id)) return res.status(400).json({ error:"Cannot suspend yourself" });
    const user = await User.findByIdAndUpdate(req.params.id,{ status:"suspended" },{ new:true, select:"-password" });
    if (!user) return res.status(404).json({ error:"User not found" });
    await Notification.create({ user:req.params.id, title:"Account Suspended", message:"Your account has been suspended. Contact support.", type:"system", read:false });
    res.json({ message:"User suspended", user });
  } catch (err) { res.status(500).json({ error:err.message }); }
});

/* ─────────────────────────────────────────────
   PUT /api/admin/users/:id/activate
───────────────────────────────────────────── */
router.put("/users/:id/activate", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id,{ status:"active" },{ new:true, select:"-password" });
    if (!user) return res.status(404).json({ error:"User not found" });
    await Notification.create({ user:req.params.id, title:"Account Reactivated", message:"Your account has been reactivated. Welcome back!", type:"system", read:false, link:"/dashboard" });
    res.json({ message:"User activated", user });
  } catch (err) { res.status(500).json({ error:err.message }); }
});

/* ─────────────────────────────────────────────
   PUT /api/admin/users/:id/upgrade
───────────────────────────────────────────── */
router.put("/users/:id/upgrade", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id,{ plan:"pro" },{ new:true, select:"-password" });
    if (!user) return res.status(404).json({ error:"User not found" });
    await Notification.create({ user:req.params.id, title:"Upgraded to Pro 🎉", message:"You're now on Tracklio Pro. Enjoy all features!", type:"system", read:false, link:"/dashboard" });
    res.json({ message:"Upgraded to Pro", user });
  } catch (err) { res.status(500).json({ error:err.message }); }
});

/* ─────────────────────────────────────────────
   PUT /api/admin/users/:id/autoban
   Auto-ban endpoint — triggered by suspicious
   activity detection in the frontend.
───────────────────────────────────────────── */
router.put("/users/:id/autoban", async (req, res) => {
  try {
    if (String(req.params.id)===String(req.user.id)) return res.status(400).json({ error:"Cannot ban yourself" });

    const { reason="Suspicious activity detected by automated system" } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status:"suspended" },
      { new:true, select:"-password" }
    );
    if (!user) return res.status(404).json({ error:"User not found" });

    /* Notify the banned user */
    await Notification.create({
      user:    req.params.id,
      title:   "Account Suspended — Security Alert",
      message: `Your account was automatically suspended: ${reason}. Contact support@tracklio.app to appeal.`,
      type:    "system",
      read:    false,
    });

    /* Log it as an admin notification too */
    await Notification.create({
      user:    req.user.id,
      title:   "Auto-ban executed",
      message: `User ${user.email} was auto-banned. Reason: ${reason}`,
      type:    "system",
      read:    false,
      link:    "/admin/users",
    });

    res.json({ message:"User auto-banned", user, reason });
  } catch (err) { res.status(500).json({ error:err.message }); }
});

/* ─────────────────────────────────────────────
   DELETE /api/admin/users/:id
───────────────────────────────────────────── */
router.delete("/users/:id", async (req, res) => {
  try {
    if (String(req.params.id)===String(req.user.id)) return res.status(400).json({ error:"Cannot delete your own admin account" });
    const uid = req.params.id;
    const [{ default:Habit }] = await Promise.all([import("../models/Habit.js").catch(()=>({default:null}))]);
    await Promise.all([
      Task.deleteMany({ userId:uid }),
      Transaction.deleteMany({ userId:uid }),
      Habit ? Habit.deleteMany({ userId:uid }) : Promise.resolve(),
      Notification.deleteMany({ user:uid }),
      User.findByIdAndDelete(uid),
    ]);
    res.json({ message:"User and all data permanently deleted" });
  } catch (err) { res.status(500).json({ error:err.message }); }
});

/* ─────────────────────────────────────────────
   POST /api/admin/notify  — broadcast
───────────────────────────────────────────── */
router.post("/notify", async (req, res) => {
  try {
    const { userId, title, message, type="system", link="" } = req.body;
    if (!title||!message) return res.status(400).json({ error:"title and message required" });

    if (userId) {
      const notif = await Notification.create({ user:userId, title, message, type, link, read:false });
      return res.json({ sent:1, notif });
    }
    /* Broadcast to all active users */
    const users  = await User.find({ status:"active" }).select("_id");
    const docs   = users.map(u=>({ user:u._id, title, message, type, link, read:false }));
    const result = await Notification.insertMany(docs);
    res.json({ sent:result.length });
  } catch (err) { res.status(500).json({ error:err.message }); }
});

/* ─────────────────────────────────────────────
   GET /api/admin/alerts
───────────────────────────────────────────── */
router.get("/alerts", async (req, res) => {
  try {
    const alerts = [];
    const suspendedCount = await User.countDocuments({ status:"suspended" });
    if (suspendedCount > 0) alerts.push({ title:"Suspended Accounts", message:`${suspendedCount} account${suspendedCount>1?"s are":" is"} currently suspended.`, severity:"medium", time:"Now", link:"/admin?tab=Users" });

    const thirtyDaysAgo = new Date(Date.now()-30*86400000);
    const totalUsers    = await User.countDocuments();
    const inactiveCount = await User.countDocuments({ updatedAt:{ $lt:thirtyDaysAgo }, status:"active" });
    if (inactiveCount>0 && totalUsers>0 && (inactiveCount/totalUsers)>0.3) {
      alerts.push({ title:"High Inactivity Risk", message:`${inactiveCount} users inactive 30+ days (${Math.round(inactiveCount/totalUsers*100)}%). Consider re-engagement campaign.`, severity:"high", time:"Today" });
    }

    const onlineNow = getOnlineIds().length;
    if (onlineNow > 0) alerts.push({ title:"Live Activity", message:`${onlineNow} user${onlineNow>1?"s are":" is"} active right now.`, severity:"low", time:"Now", link:"/admin?tab=Live+Users" });

    if (alerts.length===0) alerts.push({ title:"All Clear", message:"No platform alerts at this time.", severity:"low", time:new Date().toLocaleTimeString("en-KE",{hour:"2-digit",minute:"2-digit"}) });

    res.json(alerts);
  } catch (err) { res.status(500).json({ error:err.message }); }
});

/* ─────────────────────────────────────────────
   GET /api/admin/growth?days=30
───────────────────────────────────────────── */
router.get("/growth", async (req, res) => {
  try {
    const days = Number(req.query.days)||30;
    const from = new Date(Date.now()-days*86400000);
    const data = await User.aggregate([
      { $match:{ createdAt:{ $gte:from } } },
      { $group:{ _id:{ $dateToString:{ format:"%Y-%m-%d", date:"$createdAt" } }, count:{ $sum:1 } } },
      { $sort:{ _id:1 } },
    ]);
    res.json(data.map(d=>({ date:d._id, new:d.count })));
  } catch (err) { res.status(500).json({ error:err.message }); }
});

export default router;