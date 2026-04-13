const url =
	'https://api.openweathermap.org/data/2.5/weather';
const geoUrl =
	'https://api.openweathermap.org/geo/1.0/direct';
const apiKey =
	'f00c38e0279b7bc85480c3fe775d518c';

let lastSelectedPlaceLabel = '';

$(document).ready(function () {
	weatherFn('vadodara'); // Set Noida as the initial city

	$('#city-input-btn').on('click', function () {
		const cityName = String($('#city-input').val() || '').trim();
		if (cityName) {
			weatherFn(cityName);
		} else {
			alert('Please enter a city name.');
		}
	});

	// Enter key to search
	$('#city-input').on('keydown', function (e) {
		if (e.key === 'Enter') {
			e.preventDefault();
			$('#city-input-btn').click();
		}
	});
});

async function fetchSuggestions(query) {
	const q = String(query || '').trim();
	if (!q) return [];

	const endpoint = `${geoUrl}?q=${encodeURIComponent(q)}&limit=5&appid=${apiKey}`;
	const res = await fetch(endpoint);
	if (!res.ok) return [];
	return await res.json();
}

async function weatherFn(cName) {
	const q = String(cName || '').trim();
	if (!q) return;

	try {
		// Prefer geocoding first so we can show state/country reliably
		const places = await fetchSuggestions(q);
		if (Array.isArray(places) && places.length > 0) {
			const p0 = places[0];
			const name = p0?.name ?? q;
			const state = p0?.state ? `, ${p0.state}` : '';
			const country = p0?.country ? `, ${p0.country}` : '';
			lastSelectedPlaceLabel = `${name}${state}${country}`.trim();
			await weatherByCoords(p0.lat, p0.lon);
			return;
		}

		// Fallback: try by name
		const temp =
			`${url}?q=${encodeURIComponent(q)}&appid=${apiKey}&units=metric`;
		const res = await fetch(temp);
		const data = await res.json();
		if (res.ok) weatherShowFn(data);
		else alert('Place not found. Please try a different name.');
	} catch (error) {
		console.error('Error fetching weather data:', error);
	}
}

async function weatherByCoords(lat, lon) {
	const endpoint = `${url}?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${apiKey}&units=metric`;
	try {
		const res = await fetch(endpoint);
		const data = await res.json();
		if (res.ok) {
			weatherShowFn(data);
		} else {
			alert('Unable to fetch weather for that place.');
		}
	} catch (error) {
		console.error('Error fetching weather data:', error);
	}
}

function getWeatherThemeClass(weather) {
	const id = Number(weather?.id);
	const main = String(weather?.main || '').toLowerCase();
	if (id >= 200 && id <= 232) return 'theme-thunder';
	if (id >= 300 && id <= 321) return 'theme-drizzle';
	if (id >= 500 && id <= 531) return 'theme-rain';
	if (id >= 600 && id <= 622) return 'theme-snow';
	if (id >= 700 && id <= 781) return 'theme-mist';
	if (main.includes('clear')) return 'theme-clear';
	if (main.includes('cloud')) return 'theme-clouds';
	return 'theme-default';
}

function getWeatherFaIconClass(weather) {
	const id = Number(weather?.id);
	const main = String(weather?.main || '').toLowerCase();
	const desc = String(weather?.description || '').toLowerCase();
	const iconCode = String(weather?.icon || '');
	const isDay = iconCode.endsWith('d');

	// Thunderstorm (2xx)
	if (id >= 200 && id <= 232) return 'fas fa-bolt';

	// Drizzle (3xx)
	if (id >= 300 && id <= 321) return 'fas fa-cloud-rain';

	// Rain (5xx) with stronger differentiation
	if (id === 500) return 'fas fa-cloud-rain'; // light rain
	if (id === 501) return 'fas fa-cloud-showers-heavy'; // moderate rain
	if (id >= 502 && id <= 504) return 'fas fa-cloud-showers-heavy'; // heavy+ rain
	if (id === 511) return 'far fa-snowflake'; // freezing rain
	if (id >= 520 && id <= 531) return 'fas fa-cloud-showers-heavy'; // showers

	// Snow (6xx)
	if (id >= 600 && id <= 622) return 'far fa-snowflake';

	// Atmosphere (7xx): mist/fog/haze/smoke/etc.
	if (id >= 700 && id <= 781) return 'fas fa-smog';
	if (main.includes('mist') || desc.includes('mist')) return 'fas fa-smog';

	// Clear / Clouds
	if (main.includes('clear')) return isDay ? 'fas fa-sun' : 'fas fa-moon';
	if (main.includes('cloud')) return 'fas fa-cloud';

	return 'fas fa-cloud';
}

function weatherShowFn(data) {
	$('#city-name').text(lastSelectedPlaceLabel || `${data.name}${data?.sys?.country ? `, ${data.sys.country}` : ''}`);
	const timezoneOffset = Number(data?.timezone || 0); // seconds
	const localTime = moment.utc().add(timezoneOffset, 'seconds');
	$('#date').text(localTime.format('MMMM Do YYYY, h:mm:ss a'));
	$('#temperature').
		html(`${Math.round(data.main.temp)}°C`); // Rounded temperature
	$('#description').
		text(data.weather[0].description);
	$('#wind-speed').
		html(`Wind Speed: ${Math.round(Number(data.wind.speed) * 3.6)} km/h`);

	const weather0 = data?.weather?.[0];
	const faClass = getWeatherFaIconClass(weather0);
	$('#weather-fa-icon').attr('class', faClass);
	$('#weather-icon').attr('title', weather0?.description || 'Weather');

	const themeClass = getWeatherThemeClass(weather0);
	$('.weather-card')
		.removeClass('theme-default theme-clear theme-clouds theme-mist theme-drizzle theme-rain theme-thunder theme-snow')
		.addClass(themeClass);

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
