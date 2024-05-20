const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config(); // Lädt Umgebungsvariablen aus einer .env-Datei

const app = express();
const apiKey = process.env.API_KEY; // API-Schlüssel aus Umgebungsvariablen

app.use(cors()); // Aktiviert CORS für alle Routen

// Basisroute, die eine einfache Antwort zurückgibt
app.get("/", (req, res) => {
  res.send("ok");
});

const weatherCache = {
  data: {},
  timestamp: null,
  isValid: function () {
    const now = Date.now();
    // Cache ist 10 Minuten gültig
    return this.timestamp && now - this.timestamp < 600000; // 10 Minuten in Millisekunden
  },
  update: function (city, data) {
    this.data[city] = data;
    this.timestamp = Date.now();
  },
  get: function (city) {
    return this.data[city];
  },
};

app.get("/wetter", async (req, res) => {
  const city = req.query.city;
  const lat = req.query.lat;
  const lon = req.query.lon;
  const fields = req.query.fields ? req.query.fields.split(",") : [];
  const lang = req.query.lang || "en";

  let url;

  if (lat && lon) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${lang}`;
  } else {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=${lang}`;
  }

  // wenn die Stadt im Cache ist und die Daten noch gültig sind, senden Sie die Daten aus dem Cache
  if (city && weatherCache.isValid() && weatherCache.get(city)) {
    console.log("Using cached data");
    return res.json(filterData(weatherCache.get(city), fields));
  }

  try {
    const response = await axios.get(url);
    const data = filterData(response.data, fields);

    // Wenn eine Stadt angegeben ist, aktualisieren Sie den Cache mit den neuen Daten
    if (city) {
      weatherCache.update(city, response.data);
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching the weather data:", error);
    if (error.response) {
      // Server antwortet mit einem Statuscode außerhalb des Bereichs 2xx
      res.status(error.response.status).json({
        error: {
          message: error.response.data.message,
          status: error.response.status,
          details: error.response.data,
        },
      });
    } else if (error.request) {
      // Anfrage wurde gemacht, aber keine Antwort erhalten
      res.status(500).json({
        error: {
          message: "No response received from the weather service",
          details: error.request,
        },
      });
    } else {
      // Etwas anderes ist schief gelaufen
      res.status(500).json({
        error: {
          message: "An unexpected error occurred",
          details: error.message,
        },
      });
    }
  }
});

// Funktion zum Filtern der Wetterdaten basierend auf den angeforderten Feldern
const filterData = (data, fields) => {
  const fieldMap = {
    name: data.name,
    temp: data.main.temp,
    humidity: data.main.humidity,
    description: data.weather[0].description,
    windSpeed: data.wind.speed,
    country: data.sys.country,
    icon: data.weather[0].icon,
    weatherCode: data.weather[0].id,
  };

  // Reduziert die Felder zu einem Objekt, das nur die angeforderten Daten enthält
  return fields.reduce((result, field) => {
    if (fieldMap.hasOwnProperty(field)) {
      result[field] = fieldMap[field]; // Fügt das Feld dem Ergebnis hinzu, wenn es gefunden wurde
    }
    return result;
  }, {});
};

// Startet den Server auf dem angegebenen Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
