const Recipe = require("../models/recipe");
const { ctrlWrapper, HttpError } = require("../helpers");

// Вспомогательная функция: проверка 18+ по дате рождения юзера
const getAgeFilter = (user) => {
  if (!user || !user.birthdate) return {};
  const birthDate = new Date(user.birthdate);
  if (isNaN(birthDate)) return {};

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age < 18 ? { alcoholic: "Non alcoholic" } : {};
};

// 1. GET /mainpage — коктейли по 4 главным категориям (по 3 свежих в каждой)
const getMainPageDrinks = async (req, res) => {
  const ageFilter = getAgeFilter(req.user);
  const mainCategories = [
    "Ordinary Drink",
    "Cocktail",
    "Shake",
    "Other/Unknown",
  ];
  const result = {};

  for (const category of mainCategories) {
    result[category] = await Recipe.find({ category, ...ageFilter })
      .sort({ createdAt: -1 })
      .limit(3);
  }

  res.json(result);
};

// 2. GET /popular — топ-4 популярных коктейля (по количеству лайков в массиве favorite)
const getPopularDrinks = async (req, res) => {
  const ageFilter = getAgeFilter(req.user);
  const result = await Recipe.aggregate([
    { $match: ageFilter },
    {
      $addFields: {
        popularity: { $size: { $ifNull: ["$favorite", []] } },
      },
    },
    { $sort: { popularity: -1 } },
    { $limit: 4 },
  ]);

  res.json(result);
};

// 3. GET /search — поиск по слову, категории и ингредиенту + пагинация
const searchDrinks = async (req, res) => {
  const {
    keyword = "",
    category = "",
    ingredient = "",
    page = 1,
    limit = 10,
  } = req.query;
  const filter = { ...getAgeFilter(req.user) };

  if (keyword) {
    filter.drink = { $regex: keyword, $options: "i" };
  }
  if (category) {
    filter.category = category;
  }
  if (ingredient) {
    filter["ingredients.title"] = { $regex: ingredient, $options: "i" };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Recipe.countDocuments(filter);
  const drinks = await Recipe.find(filter).skip(skip).limit(Number(limit));

  res.json({
    total,
    page: Number(page),
    limit: Number(limit),
    drinks,
  });
};

// 4. GET /:id — получить один коктейль по ID
const getRecipeById = async (req, res) => {
  const { id } = req.params;
  const result = await Recipe.findById(id);

  if (!result) {
    throw HttpError(404, "Recipe not found");
  }

  res.json(result);
};

// 5. POST /own/add — добавить свой собственный коктейль
const addOwnDrink = async (req, res) => {
  const { _id: owner } = req.user;
  const ageFilter = getAgeFilter(req.user);

  // Если юзеру нет 18, а он пытается создать алкогольный коктейль — тормозим!
  if (ageFilter.alcoholic && req.body.alcoholic === "Alcoholic") {
    throw HttpError(403, "Users under 18 can only add Non alcoholic drinks");
  }

  const result = await Recipe.create({ ...req.body, owner });
  res.status(201).json(result);
};

// 6. DELETE /own/remove/:id — удалить свой коктейль
const removeOwnDrink = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;

  const result = await Recipe.findOneAndDelete({ _id: id, owner });
  if (!result) {
    throw HttpError(404, "Recipe not found or you are not the owner");
  }

  res.json({ message: "Recipe deleted", _id: id });
};

// 7. GET /own — получить список своих созданных коктейлей
const getOwnDrinks = async (req, res) => {
  const { _id: owner } = req.user;
  const result = await Recipe.find({ owner });
  res.json(result);
};

// 8. POST /favorite/add/:id — добавить коктейль в избранное
const addFavoriteDrink = async (req, res) => {
  const { id } = req.params;
  const { _id: userId } = req.user;

  const result = await Recipe.findByIdAndUpdate(
    id,
    { $addToSet: { favorite: userId } }, // $addToSet добавляет ID только если его там ещё нет
    { new: true },
  );

  if (!result) {
    throw HttpError(404, "Recipe not found");
  }

  res.json(result);
};

// 9. DELETE /favorite/remove/:id — удалить коктейль из избранного
const removeFavoriteDrink = async (req, res) => {
  const { id } = req.params;
  const { _id: userId } = req.user;

  const result = await Recipe.findByIdAndUpdate(
    id,
    { $pull: { favorite: userId } }, // $pull вытаскивает ID юзера из массива
    { new: true },
  );

  if (!result) {
    throw HttpError(404, "Recipe not found");
  }

  res.json(result);
};

// 10. GET /favorite — получить список избранных коктейлей юзера
const getFavoriteDrinks = async (req, res) => {
  const { _id: userId } = req.user;
  const result = await Recipe.find({ favorite: userId });
  res.json(result);
};

module.exports = {
  getMainPageDrinks: ctrlWrapper(getMainPageDrinks),
  getPopularDrinks: ctrlWrapper(getPopularDrinks),
  searchDrinks: ctrlWrapper(searchDrinks),
  getRecipeById: ctrlWrapper(getRecipeById),
  addOwnDrink: ctrlWrapper(addOwnDrink),
  removeOwnDrink: ctrlWrapper(removeOwnDrink),
  getOwnDrinks: ctrlWrapper(getOwnDrinks),
  addFavoriteDrink: ctrlWrapper(addFavoriteDrink),
  removeFavoriteDrink: ctrlWrapper(removeFavoriteDrink),
  getFavoriteDrinks: ctrlWrapper(getFavoriteDrinks),
};
