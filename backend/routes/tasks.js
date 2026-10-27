
const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const Task = require("../models/Task");

const router = express.Router();

// Keep uploaded proof photos in memory before saving them to MongoDB.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }

    cb(new Error("Please upload an image file."));
  },
});

// GET /api/tasks/today
// Fetch pending tasks due today.
router.get("/today", async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const tasks = await Task.find({
      status: "pending",
      dueDate: { $gte: start, $lt: end },
    })
      .select("-proofImage")
      .populate("patientId", "name village")
      .sort({ dueDate: 1 });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Fetch today's tasks error:", error);
    return res.status(500).json({
      message: "Unable to fetch today's tasks.",
    });
  }
});

// POST /api/tasks/create
// Create a task.
router.post("/create", async (req, res) => {
  try {
    const { patientId, taskType, note, dueDate } = req.body || {};

    if (!taskType || !taskType.trim()) {
      return res.status(400).json({
        message: "Task title is required.",
      });
    }

    if (patientId && !mongoose.isValidObjectId(patientId)) {
      return res.status(400).json({
        message: "Invalid patient ID.",
      });
    }

    const task = await Task.create({
      patientId: patientId || null,
      taskType: taskType.trim(),
      note: note?.trim() || "",
      dueDate: dueDate || new Date(),
      status: "pending",
    });

    console.log("Task created:", task._id);

    return res.status(201).json({
      message: "Task created successfully.",
      task: {
        ...task.toObject(),
        proofImage: undefined,
      },
    });
  } catch (error) {
    console.error("Create task error:", error);

    return res.status(500).json({
      message: "Unable to create task.",
    });
  }
});

// GET /api/tasks
// Fetch pending and completed tasks.
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find()
      .select("-proofImage")
      .populate("patientId", "name village")
      .sort({ dueDate: 1, createdAt: -1 });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Fetch tasks error:", error);

    return res.status(500).json({
      message: "Unable to fetch tasks.",
    });
  }
});

// PATCH /api/tasks/:id
// Update task details or mark a task completed with a proof image.
router.patch("/:id", upload.single("proofImage"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid task ID.",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    const { status, taskType, note, dueDate, patientId } = req.body || {};

    // Update ordinary task fields when provided.
    if (taskType !== undefined) {
      if (!taskType.trim()) {
        return res.status(400).json({
          message: "Task title cannot be empty.",
        });
      }

      task.taskType = taskType.trim();
    }

    if (note !== undefined) {
      task.note = note.trim();
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate || null;
    }

    if (patientId !== undefined) {
      if (patientId && !mongoose.isValidObjectId(patientId)) {
        return res.status(400).json({
          message: "Invalid patient ID.",
        });
      }

      task.patientId = patientId || null;
    }

    if (typeof req.body.isPriority === "boolean") {
  task.isPriority = req.body.isPriority;
}

    if (status === "completed") {
      if (!req.file) {
        return res.status(400).json({
          message: "A proof photo is required to complete this task.",
        });
      }

      task.proofImage =
        `data:${req.file.mimetype};base64,` +
        req.file.buffer.toString("base64");

      task.status = "completed";
      task.completedAt = new Date();
    } else if (status === "pending") {
      task.status = "pending";
      task.completedAt = null;
      task.proofImage = null;
    } else if (status !== undefined) {
      return res.status(400).json({
        message: "Invalid task status.",
      });
    }

    await task.save();

    console.log("Task updated:", task._id, task.status);

    return res.status(200).json({
      message: "Task updated successfully.",
      task: {
        ...task.toObject(),
        proofImage: undefined,
      },
    });
  } catch (error) {
    console.error("Update task error:", error);

    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "The proof photo must be 5 MB or smaller."
            : "Unable to upload the proof photo.",
      });
    }

    return res.status(500).json({
      message: "Unable to update task.",
    });
  }
});

// Handle Multer errors that occur before the route handler runs.
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "The proof photo must be 5 MB or smaller."
          : "Unable to upload the proof photo.",
    });
  }

  if (error) {
    return res.status(400).json({
      message: error.message || "Invalid request.",
    });
  }

  next();
});

module.exports = router;
