import Category from "../models/CategoryModel.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { userId: req.user.id }, // filter berdasarkan userId
      order: [["name", "ASC"]],
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Category name required" });

    // Cek kategori sudah ada untuk user ini
    const exist = await Category.findOne({ where: { name, userId: req.user.id } });
    if (exist) return res.status(409).json({ message: "Category already exists" });

    const newCategory = await Category.create({ name, userId: req.user.id });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Category name required" });

    const category = await Category.findOne({ where: { id, userId: req.user.id } });
    if (!category) return res.status(404).json({ message: "Category not found" });

    category.name = name;
    await category.save();

    res.json({ message: "Category updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({ where: { id, userId: req.user.id } });
    if (!category) return res.status(404).json({ message: "Category not found" });

    await category.destroy();
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
