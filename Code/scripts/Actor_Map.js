var map = null;
var geocodeDecoder = null;
var manIcon = null;
var womanIcon = null;
var countryCache = {};
var presentMarkers = [];

/* Initialize map using LeafLet. The created map is returned. */
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
        addMovieFilmingLocations(locationMap);
        addMovieLocations(countryMap);
    }
}

function addMovieFilmingLocations(locationMap) {
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
                message += "<font color='#FF183C'>" + movie.title + " (" + movie.year + ")</font>";
                if (movie.role != "") {
                    message += ": " + movie.role;
                }
                message += "</br>";
            });
            var countryCode = findCountryCode(location);
            if (countryCode && countriesGeoJSON[countryCode]) {
                addMovieFilmingLocation(countriesGeoJSON[countryCode], "<b>Filmed in " + location + "</b></br>" + message, opacity);
            } else {
                //console.log("Could not find " + location);
            }
        }
    } else {
        console.log("CountriesGeoJSON is null");
    }
}

function addMovieLocations(countryMap) {
    for (var country in countryMap) {
        var message = "";
        countryMap[country].forEach(function (movie) {
            message += "<font color='#FF183C'>" + movie.title + " (" + movie.year + ")</font>";
            if (movie.role != "") {
                message += ": " + movie.role;
            }
            message += "</br>";
        });
        var tries = 0;
        var success = false;
        while (!success && tries < 3000) {
            ++tries;
            success = addMovieLocationMarker(country, "<b>Produced in " + country + "</b></br>" + message);
        }
    }
}

function map_setMovie(name) {
    var movie = null;
    if (name == "") {
        console.log("No name to find");
        return;
    }
    console.log("Finding movie " + name);
    var movieTitle = name.substring(0, name.indexOf("(")).trim();
    var movieYear = name.substring(name.indexOf("(") + 1, name.indexOf(")"));
    //console.log(movieTitle + ": " + movieYear);

    d3.dsv(';')("data/movies/movies_" + name[0] + ".csv", function (error, data) {
        // Find movie
        data.some(function (d) {
            if (movieTitle == d.Title && movieYear == d.Year) {
                console.log("Found " + d.Title);
                movie = {
                    id: d.ID,
                    title: d.Title,
                    year: d.Year,
                    locations: d.Locations,
                    countries: d.Countries
                };
                return true;
            }
        });
        if (movie == null) {
            console.log("Could not find " + name);
            return;
        }
        //console.log(movie);

        if (movie.locations != "") {
            var locationList = {};
            movie.locations.split("*").forEach(function (location) {
                location = getCountry(location);
                var countryCode = findCountryCode(location);
                if (!locationList[countryCode]) {
                    locationList[countryCode] = location;
                }
            });
            d3.json("data/countries.geo.json", function (error, geojson) { // open file with world data
                countries = {};
                // Read geojson countries
                for (var r = 0; r < geojson.features.length; r++) { // for each country in geojson
                    var countryData = geojson.features[r];
                    var countryName = countryData.properties.name;
                    var countryCode = findCountryCode(countryName);
                    countries[countryCode] = countryData;
                }
                for (var countryCode in locationList) {
                    if (countries[countryCode]) {
                        addMovieFilmingLocation(countries[countryCode], "<b>Filmed in </b>" + locationList[countryCode], 0.7);
                    } else {
                        console.log("Could not find " + locationList[countryCode]);
                    }
                }
            });
        }

        if (movie.countries != "") {
            movie.countries.split("*").forEach(function (country) {
                addMovieLocationMarker(country, "<b>Produced in </b>" + country);
            });
        }

        // Find actors
        var actorMap = {};
        idBucket = Math.floor(movie.id / 50000); // id = 3524657P
        console.log("Bucket: " + idBucket);

        d3.dsv(';')("data/actorsInMovies/movieMapping_" + idBucket + ".csv", function (error, data) {
            data.forEach(function (d) {
                if (movie.id == d.MovieID.substring(0, d.MovieID.length - 1)) {// && Boolean(d.IsMovie)) {
                    var actorLetter = d.ActorID.substring(d.ActorID.length - 1);
                    if (!actorMap[actorLetter]) {
                        actorMap[actorLetter] = {};
                    }
                    actorMap[d.ActorID.substring(d.ActorID.length - 1)][d.ActorID.substring(0, d.ActorID.length - 1)] = {role: d.Role};
                }
            });
            addActorsToMap(actorMap);
        });
    });

}

function addActorsToMap(actorMap) {
    var countryList = [];
    var q = d3.queue();
    for (var letter in actorMap) {
        q.defer(d3.dsv(';'), "data/actors/actors_" + letter + ".csv");
    }
    q.awaitAll(function (error, files) {
        files.forEach(function (file) {
            file.forEach(function (actor) {
                if (actorMap[actor.Name[0]] && actorMap[actor.Name[0]][actor.ActorID]) {
                    if (actor.BirthLocation != "") {
                        countryList.push({name: actor.Name, isMale: (actor.IsMale == "True"), location: actor.BirthLocation, role: actorMap[actor.Name[0]][actor.ActorID].role});
                    }
                }
            });
        });
        countryList.forEach(function (actor) {
            var message = "<b><font color='#FF183C'>" + actor.name + "</font>: " + actor.role + "</b></br>Born in " + actor.location;
            var tries = 0;
            var success = false;
            while (!success && tries < 5000) {
                ++tries;
                success = addActorLocationMarker(actor.location, actor.isMale, message);
            }
        });
    });
}

function nameMatches(name1, name2) {
    if (name1 == name2) {
        return true;
    }
    return false;
    // Activate this code for search bar suggestions
//    var name1parts = name1.split(" ");
//    match = true;
//    name1parts.some(function (namePart) {
//        if (name2.indexOf(namePart) == -1) {
//            match = false;
//            return true;
//        }
//    });
//    return match;
}

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
                var marker = L.marker([data[0].Y, data[0].X], {icon: icon}).addTo(map);
                marker.bindPopup(message);
                marker.on('mouseover', function (e) {
                    this.openPopup();
                });
                presentMarkers.push(marker);
                countryCache[location] = data;
            });
        } else {
            data = countryCache[location];
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
        console.log("GeoCoder cannot find " + location);
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
            data = countryCache[location];
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

function addMovieFilmingLocation(countryData, message, opacity) {
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