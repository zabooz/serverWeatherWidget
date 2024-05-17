const config = {
  targetId: "weatherWidgetDiv",
  data: {
    name: "Klagenfurt",
    temp: 0,
    humidity: 0,
    description: "",
    WindSpeed: 0,
    country: "",
    icon: "",

  },
};

const weatherWidget = {
  execute: (config) => {
    weatherWidget.createLayout();
    weatherWidget.createLocationChange();
    weatherWidget.createWeatherDescription();
    weatherWidget.createWeatherDataElem();

    weatherWidget.loadData(config);
  },

  loadData: (config) => {
    weatherWidget.getWeatherData(config).then((data) => {
      const cityName = document.getElementById("cityName");
      const regionSpan = document.getElementById("regionSpan");
      const icon = document.getElementById("icon");
      const tempSpan = document.getElementById("tempSpan");
      const humiditySpan = document.getElementById("humiditySpan");
      const windSpan = document.getElementById("windSpeedSpan");
      const description = document.getElementById("description");

      description.textContent = data.description;
      icon.src = `https://openweathermap.org/img/w/${data.icon}.png`;

      const regionID = data.country;
      let regionNames = new Intl.DisplayNames(["en"], { type: "region" });
      regionSpan.textContent = ` ${regionNames.of(regionID)}`;

      cityName.innerText = data.name;
      regionSpan.textContent = ` ${data.country}`;

      const tempCelsius = data.temp;
      tempSpan.textContent = " Temperature: " + tempCelsius.toFixed(1) + "°C";

      const humidity = data.humidity;
      humiditySpan.textContent = " Humidity: " + humidity + "%";

      const windSpeed = data.speed;
      windSpan.textContent = " Wind: " + windSpeed + " m/s";
    });
  },
  getWeatherData: async function (config) {
    const city = config.data.name;
    const fieldsToString = (data) => {
      return Object.keys(data).join(",");
    };

    const fields = fieldsToString(config.data);


    try {
      const url = `http://localhost:3000/wetter?city=${city}&fields=${fields}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("error");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },
  createLayout: () => {
    const target = document.getElementById(config.targetId);

    target.innerHTML = "";

    const main = document.createElement("div");
    main.id = "weatherWidgetMain";
    main.classList.add("uk-flex");

    const iconDiv = document.createElement("div");
    iconDiv.id = "iconDiv";
    iconDiv.classList.add("uk-flex", "uk-flex-column", "uk-width-2-3");

    const dataDiv = document.createElement("div");
    dataDiv.id = "dataDiv";
    dataDiv.classList.add("uk-grid", "uk-grid-medium", "uk-flex-column");

    main.append(iconDiv, dataDiv);

    target.append(main);
  },
  createWeatherDescription: () => {
    const iconDiv = document.getElementById("iconDiv");

    const icon = document.createElement("img");
    icon.id = "icon";

    icon.style.width = "200px";

    const para = document.createElement("p");
    para.id = "description";
    para.classList.add("uk-text-left", "uk-padding-small", "uk-margin-remove");
    iconDiv.append(para, icon);
  },
  createWeatherDataElem: (data) => {
    const dataDiv = document.getElementById("dataDiv");

    const locationDate = weatherWidget.locationAndDate(data);
    const weatherData = weatherWidget.weatherData(data);

    dataDiv.append(locationDate, weatherData);
  },
  locationAndDate: (data) => {
    const locationDate = document.createElement("div");
    locationDate.id = "locationDate";
    locationDate.classList.add(
      "uk-grid",
      "uk-flex-column",
      "uk-margin-small-top"
    );

    const cityName = document.createElement("p");
    cityName.id = "cityName";
    cityName.classList.add("uk-text-left");

    const regionPara = document.createElement("p");
    regionPara.classList.add("uk-text-left");
    const regionIcon = document.createElement("span");
    regionIcon.setAttribute("uk-icon", "location");
    regionIcon.setAttribute("ratio", "0.8");

    const regionSpan = document.createElement("span");
    regionSpan.id = "regionSpan";

    regionPara.append(regionIcon, regionSpan);

    //wochentag
    const today = new Date();
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const day = document.createElement("p");
    day.classList.add("uk-text-left");
    const dayIcon = document.createElement("span");
    dayIcon.setAttribute("uk-icon", "calendar");
    dayIcon.setAttribute("ratio", "0.8");
    const daySpan = document.createElement("span");
    daySpan.id = "daySpan";
    daySpan.textContent = " " + dayNames[today.getDay()];
    day.append(dayIcon, daySpan);

    locationDate.append(cityName, regionPara, day);

    return locationDate;
  },
  weatherData: (data) => {
    const weatherData = document.createElement("div");
    weatherData.id = "weatherData";
    weatherData.classList.add(
      "uk-grid",
      "uk-flex-column",
      "uk-margin-small-top"
    );

    //Temperatur

    const tempPara = document.createElement("p");
    tempPara.id = "temperature";
    const tempIcon = document.createElement("i");
    tempIcon.classList.add("wi", "wi-thermometer");
    const tempSpan = document.createElement("span");
    tempSpan.id = "tempSpan";

    tempPara.append(tempIcon, tempSpan);

    //Luftfeuchtigkeit

    const humidityPara = document.createElement("p");
    humidityPara.id = "humidity";
    const humidityIcon = document.createElement("i");
    humidityIcon.classList.add("wi", "wi-humidity");
    const humiditySpan = document.createElement("span");
    humiditySpan.id = "humiditySpan";

    humidityPara.append(humidityIcon, humiditySpan);

    //Windgeschwindigkeit

    const windSpeedPara = document.createElement("p");
    windSpeedPara.id = "windSpeed";
    const windIcon = document.createElement("i");
    windIcon.classList.add("wi", "wi-wind");
    const windSpeedSpan = document.createElement("span");
    windSpeedSpan.id = "windSpeedSpan";

    windSpeedPara.append(windIcon, windSpeedSpan);

    weatherData.append(tempPara, humidityPara, windSpeedPara);

    return weatherData;
  },

  createLocationChange: () => {
    const target = document.getElementById(config.targetId);

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

    locationDiv.append(locationInput, locationButton);

    locationButton.addEventListener("click", () => {
      config.data.name = locationInput.value;

      weatherWidget.loadData(config);
    });

    target.append(locationDiv);
  },
};
