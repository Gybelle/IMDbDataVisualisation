var map = null;
var geocodeDecoder = null;
var manIcon = null;
var womanIcon = null;
var countryCache = {};
var presentMarkers = [];

// INITIALISE ----------------------------------------------------------------------

function createActorsMap(divID) {
    map = L.map(divID, {
        center: [20.0, 5.0],
        minZoom: 2,
        zoom: 2
    });
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
        id: 'mapbox.light',
        continuousWorld: false,
        noWrap: true
    }).addTo(map);
    map.keyboard.disable();
    geocodeDecoder = new L.GeoSearch.Provider.Google();

    manIcon = L.icon({
        iconUrl: 'img/icon_man.png', // source: http://www.flaticon.com/authors/pixel-perfect
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -10]
    });
    womanIcon = L.icon({
        iconUrl: 'img/icon_woman.png', // source: http://www.flaticon.com/authors/pixel-perfect
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -10]
    });
}

// SET DATA ----------------------------------------------------------------------

function map_setActor(actor, movies) {
    clearMapLayers();
    if (actor.birthLocation != "") {
        addActorLocationMarker(actor.birthLocation, actor.isMale, "<b>Born in</b> " + actor.birthLocation);
    }
    if (movies != null) {
        var countryMap = {};
        var locationMap = {};
        movies.forEach(function (movie) {
            movie.countries.forEach(function (country) {
                if (country != "") {
                    if (!countryMap[country]) {
                        countryMap[country] = [];
                    }
                    countryMap[country].push(movie);
                }
            });
            movie.locations.forEach(function (location) {
                if (location != "") {
                    if (!locationMap[location]) {
                        locationMap[location] = [];
                    }
                    locationMap[location].push(movie);
                }
            });
        });
        addActorFilmingLocations(locationMap);
        addActorCountries(countryMap);
    }
}

function addActorFilmingLocations(locationMap) {
    var locationMinMax = getMovieCountRange(locationMap);
    if (locationMinMax[0] == locationMinMax[1]) {
        locationMinMax[0] = locationMinMax[1] - 1;
    }
    var minMaxStep = (locationMinMax[1] - locationMinMax[0]) / 5;
    if (countriesGeoJSON != null) {
        for (var location in locationMap) {
            var message = "";
            var num = Object.keys(locationMap[location]).length;
            var opacity = 0.3 + 0.1 * (Math.floor((num - locationMinMax[0]) / minMaxStep));
            locationMap[location].forEach(function (movie) {
                var movieTitle = movie.title + " (" + movie.year + ")";
                message += '<font color="#FF183C" style="cursor: pointer;" onClick="setMovieByID(\'' + movie.id + movie.title[0] + '\')">' + movieTitle + '</font>';
                if (movie.role != "") {
                    message += ": " + movie.role;
                }
                message += "<br/>";
            });
            addMovieFilmingLocation(location, "<b>Filmed in " + location + "</b><br/>" + message, opacity);
        }
    } else {
        console.log("CountriesGeoJSON is null");
    }
}

function addActorCountries(countryMap) {
    for (var country in countryMap) {
        var message = "";
        countryMap[country].forEach(function (movie) {
            var movieTitle = movie.title + " (" + movie.year + ")";
            message += '<font color="#FF183C" style="cursor: pointer;" onClick="setMovieByID(\'' + movie.id + movie.title[0] + '\')">' + movieTitle + '</font>';
            if (movie.role != "") {
                message += ": " + movie.role;
            }
            message += "<br/>";
        });
        var tries = 0;
        var success = false;
        while (!success && tries < 3000) {
            ++tries;
            success = addMovieLocationMarker(country, "<b>Produced in " + country + "</b><br/>" + message);
        }
    }
}

function map_setMovie(movie, actors) {
    clearMapLayers();
    if (countriesGeoJSON != null) {
        movie.locations.forEach(function (location) {
            addMovieFilmingLocation(location, "<b>Filmed in </b>" + location, 0.7);
        });
    }
    movie.countries.forEach(function (country) {
        if (country != "") {
            addMovieLocationMarker(country, "<b>Produced in </b>" + country);
        }
    });
    if (actors != null) {
        actors.forEach(function (actor) {
            if (actor.birthLocation != "") {
                var message = '<b><font color="#FF183C" style="cursor: pointer;" onClick="setActorByID(\'' + actor.id + actor.name[0] + '\')">' + actor.name + "</font>: " + actor.role + "</b><br/>Born in " + actor.birthLocation;
                if (actor.birthYear != "") {
                    message += " in " + actor.birthYear + ", age " + (movie.year - parseInt(actor.birthYear)) + " during the movie";
                }
                var location = actor.birthLocation;
                var success = addActorLocationMarker(location, actor.isMale, message);
                while (!success && location.indexOf(",") != -1) {
                    location = location.substring(location.indexOf(",") + 1).trim();
                    success = addActorLocationMarker(location, actor.isMale, message);
                }
            }
        });
    }
}

// ADD MARKERS ----------------------------------------------------------------------

function addActorLocationMarker(location, isMale, message) {
    try {
        var icon = null;
        if (isMale) {
            icon = manIcon;
        }
        else {
            icon = womanIcon;
        }
        if (!countryCache[location]) {
            geocodeDecoder.GetLocations(location, function (data) {
                if (!data || !data[0]) {
                    console.log("Went wrong at " + location);
                    return false;
                }
                var marker = L.marker([data[0].Y, data[0].X], {icon: icon}).addTo(map);
                marker.bindPopup(message);
                marker.on('mouseover', function (e) {
                    this.openPopup();
                });
                presentMarkers.push(marker);
                countryCache[location] = data;
            });
        } else {
            var data = countryCache[location];
            var marker = L.marker([data[0].Y, data[0].X], {icon: icon}).addTo(map);
            marker.bindPopup(message);
            marker.on('mouseover', function (e) {
                this.openPopup();
            });
            presentMarkers.push(marker);
            countryCache[location] = data;
        }
        return true;
    }
    catch (TypeError) {
        //console.log("GeoCoder cannot find " + location);
        return false;
    }
}

function addMovieLocationMarker(location, message) {
    try {
        if (!countryCache[location]) {
            geocodeDecoder.GetLocations(location, function (data) {
                var marker = L.marker([data[0].Y, data[0].X]).addTo(map);
                var popup = L.popup({
                    maxHeight: 250
                }).setContent(message);
                marker.bindPopup(popup);
                marker.on('mouseover', function (e) {
                    this.openPopup();
                });
                presentMarkers.push(marker);
                countryCache[location] = data;
            });
        } else {
            var data = countryCache[location];
            var marker = L.marker([data[0].Y, data[0].X]).addTo(map);
            var popup = L.popup({
                maxHeight: 250
            }).setContent(message);
            marker.bindPopup(popup);
            marker.on('mouseover', function (e) {
                this.openPopup();
            });
            presentMarkers.push(marker);
            countryCache[location] = data;
        }
        return true;
    }
    catch (TypeError) {
        return false;
    }
}

function addMovieFilmingLocation(location, message, opacity) {
    var countryCode = findCountryCode(location);
    if (countryCode && countriesGeoJSON[countryCode]) {
        countryData = countriesGeoJSON[countryCode];
        L.geoJson(countryData, {
            style: function (feature) {
                return {
                    "fillColor": "#FCD450",
                    "color": "#000000",
                    "weight": 0.5,
                    "opacity": 0.8,
                    "fillOpacity": opacity
                };
            },
            onEachFeature: function (feature, layer) {
                var popup = L.popup({
                    maxHeight: 250
                }).setContent(message);
                layer.bindPopup(popup);
            }
        }).addTo(map);
    }
}

function getMovieCountRange(locationMap) {
    var min = -1;
    var max = -1;
    for (var location in locationMap) {
        var num = locationMap[location].length;
        if (min == -1 || num < min) {
            min = num;
        }
        if (max == -1 || num > max) {
            max = num;
        }
    }
    return [min, max];
}

function clearMapLayers() {
    presentMarkers.forEach(function (marker) {
        map.removeLayer(marker);
    });
    presentMarkers = [];
    map.eachLayer(function (layer) {
        if (layer._path != undefined) {
            map.removeLayer(layer);
        }
    });
}

function getCountry(location) {
    location = location.trim();
    if (location.indexOf("(") >= 0) {
        location = location.substring(0, location.indexOf("("))
    }
    location = location.trim();
    if (location.indexOf(",") == -1) {
        return location;
    }
    return location.substring(location.lastIndexOf(",") + 1).trim();
}

function uniqueCountriesOf(list) {
    var result = [];
    list.forEach(function (item) {
        var country = getCountry(item);
        if (result.indexOf(country) == -1) {
            result.push(country);
        }
    });
    return result;
}