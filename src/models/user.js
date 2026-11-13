const { Schema, model } = require("mongoose");
const Joi = require("joi");

// Регулярка для проверки email
const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

// Схема Mongoose (как документ хранится в базе MongoDB)
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      match: emailRegex,
      unique: true,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      minlength: 6,
      required: [true, "Password is required"],
    },
    birthdate: {
      type: String, // Дата рождения: нужна для проверки 18+ (по ТЗ)
      default: "",
    },
    avatarURL: {
      type: String,
      default: "",
    },
    token: {
      type: String,
      default: null,
    },
  },
  { versionKey: false, timestamps: true },
);

// Joi-схема для валидации тела запроса при регистрации (signup)
const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().pattern(emailRegex).required(),
  password: Joi.string().min(6).required(),
  birthdate: Joi.string().optional(),
});

// Joi-схема для логина (signin)
const loginSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).required(),
  password: Joi.string().min(6).required(),
});

// Joi-схема для обновления профиля (/update)
const updateUserSchema = Joi.object({
  name: Joi.string().min(2).optional(),
  avatarURL: Joi.string().optional(),
});

// Joi-схема для подписки (/subscribe)
const subscribeSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).required(),
});

const User = model("user", userSchema);

module.exports = {
  User,
  schemas: {
    registerSchema,
    loginSchema,
    updateUserSchema,
    subscribeSchema,
  },
};
