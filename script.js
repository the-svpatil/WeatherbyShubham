const url = 'https://api.openweathermap.org/data/2.5/weather';
const geoUrl = 'https://api.openweathermap.org/geo/1.0/reverse';
const apiKey = 'f00c38e0279b7bc85480c3fe775d518c';

let map;
let marker;
let tempLayer;

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

async function weatherFn(cName) {
    const temp = `${url}?q=${cName}&appid=${apiKey}&units=metric`;
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

async function weatherShowFn(data) {
    const country = data.sys.country;
    const lat = data.coord.lat;
    const lon = data.coord.lon;
    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;
    const windKmh = (data.wind.speed * 3.6).toFixed(1);

    const state = await fetchState(lat, lon);

    $('#country-flag').attr('src', `https://flagsapi.com/${country}/flat/24.png`).show();
    $('#city-name').text(state ? `${data.name}, ${state}, ${country}` : `${data.name}, ${country}`);

    $('#date').text(moment().format('MMMM Do YYYY, h:mm:ss a'));
    $('#temperature').html(`${temp}°C`);
    $('#description').text(desc);
    $('#wind-speed').html(`Wind Speed: ${windKmh} km/h`);
    $('#cloud-info').html(`Cloud Cover: ${data.clouds?.all || 0}%`);

    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    $('#weather-icon').attr('src', iconUrl);

    if (marker) {
        map.removeLayer(marker);
    }
    marker = L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>${data.name}</b><br>${state ? state + ', ' : ''}${country}<br><b>${temp}°C</b> | ${desc}<br>Clouds: ${data.clouds?.all || 0}%`)
        .openPopup();
    map.setView([lat, lon], 10);

    $('#weather-info').fadeIn();
}
