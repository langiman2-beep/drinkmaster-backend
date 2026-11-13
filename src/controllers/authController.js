const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const { HttpError, ctrlWrapper } = require("../helpers");

const { JWT_SECRET } = process.env;

// Регистрация нового бойца
const register = async (req, res) => {
  const { email, password } = req.body;

  // 1. Проверяем, нет ли уже такого email в базе
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  // 2. Шифруем пароль (чтобы даже мы в базе его не видели)
  const hashPassword = await bcrypt.hash(password, 10);

  // 3. Создаём юзера в MongoDB
  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
  });

  // 4. Генерируем токен (пропуск)
  const payload = { id: newUser._id };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });

  // 5. Записываем токен в базу юзеру
  await User.findByIdAndUpdate(newUser._id, { token });

  // 6. Отдаём ответ клиенту
  res.status(201).json({
    token,
    user: {
      name: newUser.name,
      email: newUser.email,
    },
  });
};

// Вход (Логин)
const login = async (req, res) => {
  const { email, password } = req.body;

  // 1. Ищем пользователя по email
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  // 2. Сверяем пароль с зашифрованным в базе
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }

  // 3. Выписываем свежий токен
  const payload = { id: user._id };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });

  // 4. Обновляем токен в базе
  await User.findByIdAndUpdate(user._id, { token });

  // 5. Отдаём ответ
  res.status(200).json({
    token,
    user: {
      name: user.name,
      email: user.email,
    },
  });
};

// Получить текущего пользователя
const getCurrent = async (req, res) => {
  const { name, email } = req.user;

  res.status(200).json({
    name,
    email,
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
  const result = await User.findByIdAndUpdate(_id, req.body, { new: true });

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
