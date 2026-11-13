const express = require("express");
const ctrl = require("../../controllers/authController");
const { validateBody, authenticate } = require("../../middlewares");
const { schemas } = require("../../models/user");

const router = express.Router();

// Автентифікація (/auth)
router.post("/signup", validateBody(schemas.registerSchema), ctrl.register);
router.post("/signin", validateBody(schemas.loginSchema), ctrl.login);
router.post("/signout", authenticate, ctrl.logout);

// Користувачі (/users)
router.get("/current", authenticate, ctrl.getCurrent);
router.patch(
  "/update",
  authenticate,
  validateBody(schemas.updateUserSchema),
  ctrl.updateUser,
);
router.post(
  "/subscribe",
  authenticate,
  validateBody(schemas.subscribeSchema),
  ctrl.subscribe,
);

module.exports = router;
