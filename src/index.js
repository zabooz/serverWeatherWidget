const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const apiKey = process.env.API_KEY;

app.use(cors());

app.get("/", (req, res) => {
  res.send("ok");
});

app.get("/wetter", async (req, res) => {
  const city = req.query.city || "Berlin";
  const fields = req.query.fields ? req.query.fields.split(",") : [];

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(url);
    const data = filterData(response.data, fields);
    res.json(data);
  } catch (error) {
    console.error("Error fetching the weather data:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Wetterdaten" });
  }
});

const filterData = (data, fields) => {
  const fieldMap = {
    name: "name",
    temp: "main.temp",
    humidity: "main.humidity",
    description: "weather[0].description",
    WindSpeed: "wind.speed",
    country: "sys.country",
    icon: "weather[0].icon",
  };

  return fields.reduce((result, field) => {
    const path = fieldMap[field];
    if (path) {
      const value = getValueByPath(data, path);
      if (value !== undefined) {
        result[field] = value;
      }
    }
    return result;
  }, {});
};

const getValueByPath = (obj, path) => {
  return path.split(".").reduce((acc, part) => {
    if (!acc) return undefined;
    if (part.includes("[")) {
      const [key, index] = part.split(/\[|\]/).filter(Boolean);
      return Array.isArray(acc[key])
        ? acc[key][parseInt(index, 10)]
        : undefined;
    }
    return acc[part];
  }, obj);
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
