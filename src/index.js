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

// Wetterroute, die Wetterdaten für eine bestimmte Stadt abruft und zurückgibt
app.get("/wetter", async (req, res) => {
  const city = req.query.city || "Berlin"; // Standardmäßig "Berlin", wenn keine Stadt angegeben ist
  const fields = req.query.fields ? req.query.fields.split(",") : []; // Extrahiert die angeforderten Felder aus den Query-Parametern

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`; // URL für den API-Aufruf

  try {
    // Führt einen GET-Aufruf zur Wetter-API aus
    const response = await axios.get(url);
    // Filtert die erhaltenen Daten basierend auf den angeforderten Feldern
    const data = filterData(response.data, fields);
    res.json(data); // Gibt die gefilterten Daten als JSON zurück
  } catch (error) {
    console.error("Error fetching the weather data:", error); // Fehlerprotokollierung
    res.status(500).json({ error: "Fehler beim Abrufen der Wetterdaten" }); // Gibt einen Fehlerstatus und eine Fehlermeldung zurück
  }
});

// Funktion zum Filtern der Wetterdaten basierend auf den angeforderten Feldern
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

  // Reduziert die Felder zu einem Objekt, das nur die angeforderten Daten enthält
  return fields.reduce((result, field) => {
    const path = fieldMap[field];
    if (path) {
      const value = getValueByPath(data, path);
      if (value !== undefined) {
        result[field] = value; // Fügt das Feld dem Ergebnis hinzu, wenn es gefunden wurde
      }
    }
    return result;
  }, {});
};

// Funktion zum Abrufen von Werten aus verschachtelten Objekten basierend auf einem Pfad
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

// Startet den Server auf dem angegebenen Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
