const express = require("express");
const ctrl = require("../../controllers/filtersController");

const router = express.Router();

router.get("/categories", ctrl.getCategories);
router.get("/ingredients", ctrl.getAllIngredients);
router.get("/glasses", ctrl.getGlasses);

module.exports = router;
