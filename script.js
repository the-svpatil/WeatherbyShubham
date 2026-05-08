const url = 'https://api.openweathermap.org/data/2.5/weather';
const geoUrl = 'https://api.openweathermap.org/geo/1.0/reverse';
const geoDirectUrl = 'https://api.openweathermap.org/geo/1.0/direct';
const apiKey = 'f00c38e0279b7bc85480c3fe775d518c';

let map;
let marker;
let tempLayer;

let lastSelectedPlaceLabel = '';

$(document).ready(function () {
    initMap();
    weatherFn('vadodara');

    $('#city-input-btn').on('click', function () {
        let cityName = $('#city-input').val();
        if (cityName) {
            weatherFn(cityName);
        } else {
            alert("Please enter a city name.");
        }
    });

    $('#city-input').on('keypress', function (e) {
        if (e.which === 13) {
            $('#city-input-btn').click();
        }
    });

    $('.toggle-label input[type="checkbox"]').on('change', function () {
        const label = $(this).parent();
        if ($(this).is(':checked')) {
            label.addClass('active');
        } else {
            label.removeClass('active');
        }
    });

    $('#temp-toggle').on('change', function () {
        if ($(this).is(':checked')) {
            map.addLayer(tempLayer);
        } else {
            map.removeLayer(tempLayer);
        }
    });

});

function initMap() {
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([20.0, 0.0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    tempLayer = L.tileLayer(
        `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`,
        { opacity: 0.7 }
    );

    map.on('click', async function (e) {
        const { lat, lng } = e.latlng;
        const info = await reverseGeocode(lat, lng);
        if (info) {
            const popupContent = info.state
                ? `<b>${info.name}</b><br>${info.state}, ${info.country}`
                : `<b>${info.name}</b><br>${info.country}`;
            L.popup()
                .setLatLng(e.latlng)
                .setContent(popupContent)
                .openOn(map);
        } else {
            L.popup()
                .setLatLng(e.latlng)
                .setContent(`Lat: ${lat.toFixed(2)}<br>Lng: ${lng.toFixed(2)}`)
                .openOn(map);
        }
    });
}

async function reverseGeocode(lat, lon) {
    try {
        const res = await fetch(`${geoUrl}?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`);
        const data = await res.json();
        if (data.length > 0) {
            return {
                name: data[0].name || 'Unknown',
                state: data[0].state || null,
                country: data[0].country || ''
            };
        }
    } catch (e) {
        console.error('Reverse geocode error:', e);
    }
    return null;
}

async function fetchState(lat, lon) {
    try {
        const res = await fetch(`${geoUrl}?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`);
        const data = await res.json();
        if (data.length > 0 && data[0].state) {
            return data[0].state;
        }
    } catch (e) {
        console.error('Error fetching state:', e);
    }
    return null;
}

async function fetchSuggestions(query) {
    const q = String(query || '').trim();
    if (!q) return [];

    const endpoint = `${geoDirectUrl}?q=${encodeURIComponent(q)}&limit=5&appid=${apiKey}`;
    const res = await fetch(endpoint);
    if (!res.ok) return [];
    return await res.json();
}

async function weatherFn(cName) {
    const q = String(cName || '').trim();
    if (!q) return;

    try {
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

        const temp = `${url}?q=${encodeURIComponent(q)}&appid=${apiKey}&units=metric`;
        const res = await fetch(temp);
        const data = await res.json();
        if (res.ok) await weatherShowFn(data);
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
            await weatherShowFn(data);
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

    if (id >= 200 && id <= 232) return 'fas fa-bolt';
    if (id >= 300 && id <= 321) return 'fas fa-cloud-rain';
    if (id === 500) return 'fas fa-cloud-rain';
    if (id === 501) return 'fas fa-cloud-showers-heavy';
    if (id >= 502 && id <= 504) return 'fas fa-cloud-showers-heavy';
    if (id === 511) return 'far fa-snowflake';
    if (id >= 520 && id <= 531) return 'fas fa-cloud-showers-heavy';
    if (id >= 600 && id <= 622) return 'far fa-snowflake';
    if (id >= 700 && id <= 781) return 'fas fa-smog';
    if (main.includes('mist') || desc.includes('mist')) return 'fas fa-smog';
    if (main.includes('clear')) return isDay ? 'fas fa-sun' : 'fas fa-moon';
    if (main.includes('cloud')) return 'fas fa-cloud';
    return 'fas fa-cloud';
}

async function weatherShowFn(data) {
    const country = data.sys.country;
    const lat = data.coord.lat;
    const lon = data.coord.lon;
    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;
    const windKmh = (data.wind.speed * 3.6).toFixed(1);

    const state = await fetchState(lat, lon);

    if (lastSelectedPlaceLabel) {
        $('#city-name').text(lastSelectedPlaceLabel);
    } else {
        $('#country-flag').attr('src', `https://flagsapi.com/${country}/flat/24.png`).show();
        $('#city-name').text(state ? `${data.name}, ${state}, ${country}` : `${data.name}, ${country}`);
    }

    const timezoneOffset = Number(data?.timezone || 0);
    const localTime = moment.utc().add(timezoneOffset, 'seconds');
    $('#date').text(localTime.format('MMMM Do YYYY, h:mm:ss a'));
    $('#temperature').html(`${temp}°C`);
    $('#description').text(desc);
    $('#wind-speed').html(`Wind Speed: ${windKmh} km/h`);
    $('#cloud-info').html(`Cloud Cover: ${data.clouds?.all || 0}%`);

    const weather0 = data?.weather?.[0];
    const faClass = getWeatherFaIconClass(weather0);
    $('#weather-fa-icon').attr('class', faClass);
    $('#weather-icon').attr('title', weather0?.description || 'Weather');

    const themeClass = getWeatherThemeClass(weather0);
    $('.weather-card')
        .removeClass('theme-default theme-clear theme-clouds theme-mist theme-drizzle theme-rain theme-thunder theme-snow')
        .addClass(themeClass);

    if (marker) {
        map.removeLayer(marker);
    }
    marker = L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>${data.name}</b><br>${state ? state + ', ' : ''}${country}<br><b>${temp}°C</b> | ${desc}<br>Clouds: ${data.clouds?.all || 0}%`)
        .openPopup();
    map.setView([lat, lon], 10);

    $('#weather-info').fadeIn();
}
