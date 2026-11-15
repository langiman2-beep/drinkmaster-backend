const express = require("express");
const ctrl = require("../../controllers/recipesController");
const {
  isValidId,
  validateBody,
  authenticate,
  upload,
} = require("../../middlewares");
const { addRecipeSchema } = require("../../schemas/recipesSchemas");

const router = express.Router();

router.use(authenticate);

// Главная, популярные и поиск
router.get("/mainpage", ctrl.getMainPageDrinks);
router.get("/popular", ctrl.getPopularDrinks);
router.get("/search", ctrl.searchDrinks);

// Собственные рецепты пользователя (/own)
router.get("/own", ctrl.getOwnDrinks);
router.post(
  "/own/add",
  upload.single("drinkThumb"),
  validateBody(addRecipeSchema),
  ctrl.addOwnDrink,
);
router.delete("/own/remove/:id", isValidId, ctrl.removeOwnDrink);

// Избранные рецепты (/favorite)
router.get("/favorite", ctrl.getFavoriteDrinks);
router.post("/favorite/add/:id", isValidId, ctrl.addFavoriteDrink);
router.delete("/favorite/remove/:id", isValidId, ctrl.removeFavoriteDrink);

// Получение одного коктейля по ID
router.get("/:id", isValidId, ctrl.getRecipeById);

module.exports = router;
