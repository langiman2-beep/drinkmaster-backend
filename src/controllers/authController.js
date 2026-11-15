const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const { HttpError, ctrlWrapper } = require("../helpers");

const { JWT_SECRET } = process.env;

// Регистрация нового бойца
const register = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
  });

  const payload = { id: newUser._id };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });

  await User.findByIdAndUpdate(newUser._id, { token });

  res.status(201).json({
    token,
    user: {
      name: newUser.name,
      email: newUser.email,
      avatarURL: newUser.avatarURL || "",
    },
  });
};

// Вход (Логин)
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = { id: user._id };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });

  await User.findByIdAndUpdate(user._id, { token });

  res.status(200).json({
    token,
    user: {
      name: user.name,
      email: user.email,
      avatarURL: user.avatarURL || "",
    },
  });
};

// Получить текущего пользователя
const getCurrent = async (req, res) => {
  const { name, email, avatarURL = "" } = req.user;

  res.status(200).json({
    name,
    email,
    avatarURL,
  });
};

// Выход пользователя
const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.status(204).send();
};

// Обновление профиля пользователя (имя или аватарка)
const updateUser = async (req, res) => {
  const { _id } = req.user;
  const updateData = { ...req.body };

  if (req.file) {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    updateData.avatarURL = `${baseUrl}/uploads/${req.file.filename}`;
  }

  const result = await User.findByIdAndUpdate(_id, updateData, { new: true });

  res.status(200).json({
    name: result.name,
    email: result.email,
    avatarURL: result.avatarURL,
  });
};

// Подписка на рассылку
const subscribe = async (req, res) => {
  const { email } = req.body;

  res.status(200).json({
    message: `Subscription successful for ${email}`,
  });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateUser: ctrlWrapper(updateUser),
  subscribe: ctrlWrapper(subscribe),
};
