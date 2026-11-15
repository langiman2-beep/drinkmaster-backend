const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");
const authRouter = require("./routes/api/authRoutes");
const recipesRouter = require("./routes/api/recipesRoutes");
const filtersRouter = require("./routes/api/filtersRoutes");
const alertsRouter = require("./routes/api/alertsRoutes");

const app = express();

app.set("trust proxy", 1);

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Маршруты
app.use("/api/auth", authRouter);
app.use("/api/users", authRouter);
app.use("/api/filters", filtersRouter);
app.use("/api/drinks", recipesRouter);
app.use("/api/recipes", recipesRouter);
app.use("/api/alerts", alertsRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/api", (req, res) => {
  res.json({ message: "DrinkMaster API is working!" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

module.exports = app;
