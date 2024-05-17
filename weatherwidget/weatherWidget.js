// Konfigurationsobjekt für das Wetter-Widget
const config = {
  targetId: "weatherWidgetDiv", // ID des Ziels, in dem das Widget gerendert wird
  data: {
    name: "Klagenfurt",
    temp: 0,
    humidity: 0,
    description: "",
    windSpeed: 0,
    country: "",
    icon: "",
  },
};

// Hauptobjekt für das Wetter-Widget
const weatherWidget = {
  // Ausführungsfunktion, die die Layout- und Datenladefunktionen aufruft
  execute: (config) => {
    weatherWidget.createLayout();
    weatherWidget.createLocationChange();
    weatherWidget.loadData(config);
  },

  // Funktion zum Laden der Wetterdaten und Aktualisieren der UI
  loadData: (config) => {
    weatherWidget.getWeatherData(config).then((data) => {
      // Hilfsfunktion zum Aktualisieren von DOM-Elementen
      const updateElement = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
      };

      // Aktualisieren der UI mit den abgerufenen Wetterdaten
      updateElement("cityName", data.name);
      updateElement(
        "regionSpan",
        new Intl.DisplayNames(["en"], { type: "region" }).of(data.country)
      );
      updateElement("tempSpan", ` Temperature: ${data.temp.toFixed(1)}°C`);
      updateElement("humiditySpan", ` Humidity: ${data.humidity}%`);
      updateElement("windSpeedSpan", ` Wind: ${data.windSpeed} m/s`);
      updateElement("description", data.description);

      // Aktualisieren des Wetter-Icons
      const icon = document.getElementById("icon");
      if (icon) icon.src = `https://openweathermap.org/img/w/${data.icon}.png`;
    });
  },

  // Funktion zum Abrufen der Wetterdaten vom Server
  getWeatherData: async (config) => {
    const city = config.data.name;
    const fields = Object.keys(config.data).join(",");
    const url = `http://localhost:3000/wetter?city=${city}&fields=${fields}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("error");
      return await response.json();
    } catch (error) {
      console.error("Error fetching the weather data:", error);
      throw error;
    }
  },

  // Funktion zum Erstellen des Layouts für das Wetter-Widget
  createLayout: () => {
    const target = document.getElementById(config.targetId);
    if (!target) return;

    // Einfügen des HTML-Layouts in das Ziel-Element
    target.innerHTML = `
      <div id="weatherWidgetMain" class="uk-flex">
        <div id="iconDiv" class="uk-flex uk-flex-column uk-width-2-3">
          <p id="description" class="uk-text-left uk-padding-small uk-margin-remove"></p>
          <img id="icon" style="width: 200px;">
        </div>
        <div id="dataDiv" class="uk-grid uk-grid-medium uk-flex-column">
          <div id="locationDate" class="uk-grid uk-flex-column uk-margin-small-top">
            <p id="cityName" class="uk-text-left"></p>
            <p class="uk-text-left">
              <span uk-icon="location" ratio="0.8"></span>
              <span id="regionSpan"></span>
            </p>
            <p class="uk-text-left">
              <span uk-icon="calendar" ratio="0.8"></span>
              <span id="daySpan">${new Date().toLocaleDateString("en-US", { weekday: "long" })}</span>
            </p>
          </div>
          <div id="weatherData" class="uk-grid uk-flex-column uk-margin-small-top">
            <p id="temperature">
              <i class="wi wi-thermometer"></i>
              <span id="tempSpan"></span>
            </p>
            <p id="humidity">
              <i class="wi wi-humidity"></i>
              <span id="humiditySpan"></span>
            </p>
            <p id="windSpeed">
              <i class="wi wi-wind"></i>
              <span id="windSpeedSpan"></span>
            </p>
          </div>
        </div>
      </div>
    `;
  },

  // Funktion zum Erstellen der Standortänderungsfunktionalität
  createLocationChange: () => {
    const target = document.getElementById(config.targetId);
    if (!target) return;

    // Erstellen des Eingabefelds und des Buttons zur Standortänderung
    const locationDiv = document.createElement("div");

    const locationButton = document.createElement("button");
    locationButton.innerText = "Change Location";
    locationButton.classList.add(
      "uk-button",
      "uk-button-primary",
      "uk-width-1-3"
    );

    const locationInput = document.createElement("input");
    locationInput.type = "text";
    locationInput.placeholder = "Enter Location";
    locationInput.classList.add("uk-input", "uk-width-2-3");

    // Hinzufügen des Event-Listeners für den Button
    locationButton.addEventListener("click", () => {
      config.data.name = locationInput.value;
      weatherWidget.loadData(config);
    });

    locationDiv.append(locationInput, locationButton);
    target.append(locationDiv);
  },
};

