const Ingredient = require("../models/ingredient");
const { ctrlWrapper } = require("../helpers");

// Список категорий из ТЗ
const categoriesList = [
  "Ordinary Drink",
  "Cocktail",
  "Shake",
  "Other/Unknown",
  "Cocoa",
  "Shot",
  "Coffee/Tea",
  "Homemade Liqueur",
  "Punch/Party Drink",
  "Beer",
  "Soft Drink",
];

// Список бокалов из ТЗ
const glassesList = [
  "Highball glass",
  "Cocktail glass",
  "Old-fashioned glass",
  "Whiskey Glass",
  "Collins glass",
  "Pousse cafe glass",
  "Champagne flute",
  "Whiskey sour glass",
  "Cordial glass",
  "Brandy snifter",
  "White wine glass",
  "Nick and Nora Glass",
  "Hurricane glass",
  "Coffee mug",
  "Shot glass",
  "Jar",
  "Irish coffee cup",
  "Punch bowl",
  "Pitcher",
  "Pint glass",
  "Copper Mug",
  "Wine Glass",
  "Beer mug",
  "Margarita/Coupette glass",
  "Beer pilsner",
  "Beer Glass",
  "Parfait glass",
  "Mason jar",
  "Margarita glass",
  "Martini Glass",
  "Balloon Glass",
  "Coupe Glass",
];

const getCategories = async (req, res) => {
  // Отдаём категории, отсортированные по алфавиту (требование ТЗ)
  const sortedCategories = [...categoriesList].sort();
  res.json(sortedCategories);
};

const getAllIngredients = async (req, res) => {
  const result = await Ingredient.find();
  res.json(result);
};

const getGlasses = async (req, res) => {
  const sortedGlasses = [...glassesList].sort();
  res.json(sortedGlasses);
};

module.exports = {
  getCategories: ctrlWrapper(getCategories),
  getAllIngredients: ctrlWrapper(getAllIngredients),
  getGlasses: ctrlWrapper(getGlasses),
};
