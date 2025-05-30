import Task from "../models/TaskModel.js";

export const getTasks = async (req, res) => {
  try {
    const statusFilter = req.query.status;
    const categoryFilter = req.query.categoryId;

    const whereClause = { userId: req.user.id };
    if (statusFilter && ["pending", "completed"].includes(statusFilter)) {
      whereClause.status = statusFilter;
    }
    if (categoryFilter) {
      whereClause.categoryId = categoryFilter;
    }

    const tasks = await Task.findAll({ where: whereClause, order: [["createdAt", "DESC"]] });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ where: { id, userId: req.user.id } });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, deadline, categoryId } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const newTask = await Task.create({
      title,
      description,
      deadline,
      categoryId,
      userId: req.user.id,
      status: "pending",
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, status, categoryId } = req.body;

    const task = await Task.findOne({ where: { id, userId: req.user.id } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (status && !["pending", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    await Task.update(
      { title, description, deadline, status, categoryId },
      { where: { id, userId: req.user.id } }
    );

    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ where: { id, userId: req.user.id } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    await Task.destroy({ where: { id, userId: req.user.id } });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
