const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const { HttpError } = require("../helpers");

const { JWT_SECRET } = process.env;

const authenticate = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");

  // Если в заголовке нет слова Bearer или нет самого токена
  if (bearer !== "Bearer" || !token) {
    next(HttpError(401, "Not authorized"));
  }

  try {
    // Проверяем, не поддельный ли токен нашим секретом
    const { id } = jwt.verify(token, JWT_SECRET);

    // Ищем юзера в базе и смотрим, совпадает ли токен с тем, что в базе
    const user = await User.findById(id);
    if (!user || !user.token || user.token !== token) {
      return next(HttpError(401, "Not authorized"));
    }

    // Пришиваем юзера к запросу, чтобы контроллеры знали, кто пришёл
    req.user = user;
    return next();
  } catch {
    next(HttpError(401, "Not authorized"));
  }
};

module.exports = authenticate;
