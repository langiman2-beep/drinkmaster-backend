require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const { DB_HOST, PORT = 5000 } = process.env;

// Подключаемся к базе данных
mongoose
  .connect(DB_HOST)
  .then(() => {
    console.log("Database connection successful");
    app.listen(PORT, () => {
      console.log(`Server running. Use our API on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error.message);
    process.exit(1); // Гасим процесс при ошибке
  });
