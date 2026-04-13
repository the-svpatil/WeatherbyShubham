const url =
	'https://api.openweathermap.org/data/2.5/weather';
const apiKey =
	'f00c38e0279b7bc85480c3fe775d518c';

$(document).ready(function () {
	weatherFn('vadodara'); // Set Noida as the initial city

	$('#city-input-btn').on('click', function () {
		const cityName = $('#city-input').val();
		if (cityName) {
			weatherFn(cityName);
		} else {
			alert('Please enter a city name.');
		}
	});
});

async function weatherFn(cName) {
	const temp =
		`${url}?q=${cName}&appid=${apiKey}&units=metric`;
	try {
		const res = await fetch(temp);
		const data = await res.json();
		if (res.ok) {
			weatherShowFn(data);
		} else {
			alert('City not found. Please try again.');
		}
	} catch (error) {
		console.error('Error fetching weather data:', error);
	}
}

function weatherShowFn(data) {
	$('#city-name').text(data.name);
	$('#date').text(moment().
		format('MMMM Do YYYY, h:mm:ss a')); // Corrected date format to include year
	$('#temperature').
		html(`${Math.round(data.main.temp)}°C`); // Rounded temperature
	$('#description').
		text(data.weather[0].description);
	$('#wind-speed').
		html(`Wind Speed: ${data.wind.speed} m/s`);

	// OpenWeather icon code example: "04d"
	const iconCode = data?.weather?.[0]?.icon;
	if (iconCode) {
		const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
		$('#weather-icon').attr('src', iconUrl).show();
	} else {
		$('#weather-icon').attr('src', '').hide();
	}

	$('#weather-info').fadeIn();
}



// // ============ CONFIG ============
// const apiKey = "f00c38e0279b7bc85480c3fe775d518c"; // <-- Replace with your OpenWeatherMap key

// // ============ GET WEATHER BY CITY NAME ============
// function weatherFn(city) {
//     if (!city) {
//         alert("Please enter a city name");
//         return;
//     }

//     const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

//     $.getJSON(url, function (data) {
//         displayWeather(data);
//     }).fail(function () {
//         alert("City not found. Please check the name and try again.");
//     });
// }

// // ============ GET WEATHER BY COORDINATES (LIVE LOCATION) ============
// function getWeatherByCoords(lat, lon) {
//     const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

//     $.getJSON(url, function (data) {
//         displayWeather(data);
// 		console.log(data);
//     }).fail(function () {
//         alert("Unable to fetch weather data for your location.");
//     });
// }

// // ============ DISPLAY WEATHER INFO ============
// function displayWeather(data) {
//     // City and Country
//     $("#city-name").text(`${data.name}, ${data.sys.country}`);

//     // Weather description
//     $("#description").text(`Weather: ${data.weather[0].description}`);

//     // Temperature
//     $("#temperature").text(`Temperature: ${data.main.temp} °C`);

//     // Wind Speed
//     $("#wind-speed").text(`Wind Speed: ${data.wind.speed} m/s`);

//     // ✅ Weather Icon Fix
//     const iconCode = data.weather[0].icon; // example: "04d"
//     const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
//     $("#weather-icon").attr("src", iconUrl);

//     // ✅ Show local date/time using timezone offset
//     const timezoneOffset = data.timezone; // seconds
//     const localTime = moment.utc().add(timezoneOffset, 'seconds');
//     $("#date").text(localTime.format('dddd, MMMM Do YYYY, h:mm:ss A'));
// }

// // ============ GET USER LOCATION (AUTO LOAD) ============
// function getUserLocation() {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(
//             (position) => {
//                 const lat = position.coords.latitude;
//                 const lon = position.coords.longitude;
//                 getWeatherByCoords(lat, lon);
//             },
//             (error) => {
//                 console.log("Location access denied.");
//             }
//         );
//     } else {
//         alert("Geolocation not supported by your browser.");
//     }
// }

// // ============ AUTO LOAD ON PAGE OPEN ============
// $(document).ready(function () {
//     getUserLocation();
// });
