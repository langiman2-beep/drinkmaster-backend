const express = require("express");
const router = express.Router();

// Список всех 25 регионов Украины по стандарту alerts.in.ua
const OBLASTS = [
  "Автономна Республіка Крим",
  "Волинська область",
  "Вінницька область",
  "Дніпропетровська область",
  "Донецька область",
  "Житомирська область",
  "Закарпатська область",
  "Запорізька область",
  "Івано-Франківська область",
  "Київська область",
  "Кіровоградська область",
  "Луганська область",
  "Львівська область",
  "Миколаївська область",
  "Одеська область",
  "Полтавська область",
  "Рівненська область",
  "Сумська область",
  "Тернопільська область",
  "Харківська область",
  "Херсонська область",
  "Хмельницька область",
  "Черкаська область",
  "Чернівецька область",
  "Чернігівська область",
  "м. Київ",
];

let cache = {
  updatedAt: 0,
  data: null,
};

router.get("/", async (req, res) => {
  const now = Date.now();

  // Отдаём кэш, если ему меньше 15 секунд
  if (cache.data && now - cache.updatedAt < 15000) {
    return res.json(cache.data);
  }

  try {
    const token = process.env.ALERTS_API_TOKEN;
    let statuses = {};

    if (token) {
      // Официальный поток alerts.in.ua (строка из 26 символов: N, P, A)
      const response = await fetch(
        `https://api.alerts.in.ua/v1/iot/active_air_raid_alerts_by_oblast.json?token=${token}`,
      );
      if (!response.ok) throw new Error("alerts.in.ua error");

      const rawString = await response.json();
      OBLASTS.forEach((name, idx) => {
        statuses[name] = rawString[idx] || "N";
      });
    } else {
      // Резервный живой источник без токена (ubilling.net.ua)
      const response = await fetch("https://ubilling.net.ua/aerialalerts/");
      const json = await response.json();
      const states = json.states || {};

      OBLASTS.forEach((name) => {
        const info = states[name];
        if (!info) {
          statuses[name] = "N";
        } else if (info.alertnow) {
          statuses[name] = "A";
        } else {
          statuses[name] = "N";
        }
      });
    }

    const payload = {
      source: token ? "alerts.in.ua" : "live-feed",
      updatedAt: new Date().toISOString(),
      statuses,
    };

    cache = { updatedAt: now, data: payload };
    res.json(payload);
  } catch (err) {
    console.error("Ошибка получения тревог:", err.message);
    res.status(502).json({
      message: "Не удалось получить статус тревог",
      statuses: cache.data?.statuses || {},
    });
  }
});

module.exports = router;
