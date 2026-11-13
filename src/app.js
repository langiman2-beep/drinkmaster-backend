const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");
const authRouter = require("./routes/api/authRoutes");
const recipesRouter = require("./routes/api/recipesRoutes");
const filtersRouter = require("./routes/api/filtersRoutes");

const app = express();

// Формат логов: в разработке используем короткий 'dev'
const formatsLogger = app.get("env") === "development" ? "dev" : "short";

// Мидлвары (прослойки обработки)
app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

// Маршруты
app.use("/api/auth", authRouter);
app.use("/api/users", authRouter);
app.use("/api/filters", filtersRouter);
app.use("/api/drinks", recipesRouter);
app.use("/api/recipes", recipesRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Тестовый роут для проверки связи
app.get("/api", (req, res) => {
  res.json({ message: "DrinkMaster API is working!" });
});

// Заглушка 404: если запросили неизвестный адрес
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

module.exports = app;
