import { Router } from "express";
import Task from "../models/Task.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    const filter = { user: req.userId };
    if (status && status !== "all") filter.status = status;
    if (priority && priority !== "all") filter.priority = priority;
    if (search) filter.title = { $regex: search, $options: "i" };
    res.json(await Task.find(filter).sort({ createdAt: -1 }));
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Task title is required" });
    res.status(201).json(await Task.create({
      user: req.userId, title, description, priority, dueDate: dueDate || null
    }));
  } catch (error) { next(error); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const allowed = ["title", "description", "priority", "status", "dueDate"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId }, updates, { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) { next(error); }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    if (!["pending", "completed"].includes(req.body.status))
      return res.status(400).json({ message: "Invalid status" });
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId }, { status: req.body.status }, { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (error) { next(error); }
});

export default router;