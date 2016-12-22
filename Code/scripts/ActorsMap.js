var map = null;
var geocodeDecoder = null;
var manIcon = null;
var womanIcon = null;

/* Initialize map using LeafLet. The created map is returned. */
function createActorsMap(divID) {
    var map = L.map(divID, {
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

    //var svg = d3.select(map.getPanes().overlayPane).append("svg");
    //var g = svg.append("g").attr("class", "leaflet-zoom-hide");
    return map;
}

function map_setActor(map, name) {
    var actor = null;
    if (name == "") {
        console.log("No name to find");
        return;
    }

    console.log("Finding actor");
    console.log("First letter " + name[0]);

    d3.dsv(';')("data/actors/actors_" + name[0] + ".csv", function (error, data) {
        // Find actor
        data.some(function (d) {
            if (nameMatches(name, d.Name)) {
                console.log("Found " + d.Name);
                actor = {
                    name: d.Name,
                    id: d.ActorID,
                    isMale: (d.IsMale == "True"),
                    birthYear: d.BirthYear,
                    birthLocation: d.BirthLocation,
                    deathYear: d.DeathYear,
                    deathLocation: d.DeathLocation
                };
                return true;
            }
        });
        if (actor == null) {
            console.log("Could not find " + name)
            return;
        }

        // Process actor
        if (actor.birthYear != "") {
            var currentYear = new Date().getFullYear();
            actor.age = currentYear - +actor.birthYear;
        }

        // Find birth location
        if (actor.birthLocation != "") {
            addBirthLocationMarker(actor.birthLocation, actor.isMale);
        }

        // Find movies
        var movieMap = {};
        movie = false;
        idBucket = Math.floor(actor.id / 100000);
        console.log("Bucket: " + idBucket);

        d3.dsv(';')("data/actorsInMovies/actorMapping_" + idBucket + ".csv", function (error, data) {
            data.forEach(function (d) {
                if (actor.id == d.ActorID.substring(0, d.ActorID.length - 1)) {// && Boolean(d.IsMovie)) {
                    var movieLetter = d.MovieID.substring(d.MovieID.length - 1);
                    if (!movieMap[movieLetter]) {
                        movieMap[movieLetter] = {};
                    }
                    movieMap[d.MovieID.substring(d.MovieID.length - 1)][d.MovieID.substring(0, d.MovieID.length - 1)] = {role: d.Role};
                }
            });
            addMoviesToMap(movieMap)
        });
        console.log(actor);
    });
}

function addMoviesToMap(movieMap) {
    var countryMap = {};
    var locationMap = {};
    var q = d3.queue();
    for (var letter in movieMap) {
        q.defer(d3.dsv(';'), "data/movies/movies_" + letter + ".csv");
    }
    q.awaitAll(function (error, files) {
        // find movies
        files.forEach(function (file) {
            file.forEach(function (movie) {
                if (movieMap[movie.Title[0]] && movieMap[movie.Title[0]][movie.ID]) {
                    if (movie.Countries != "") {
                        movie.Countries.split("*").forEach(function (country) {
                            if (!countryMap[country]) {
                                countryMap[country] = [];
                            }
                            countryMap[country].push({title: movie.Title, year: movie.Year, role: movieMap[movie.Title[0]][movie.ID].role});
                        });
                    }
                    if (movie.Locations != "") {
                        movie.Locations.split("*").forEach(function (location) {
                            var country = getCountry(location);
                            if (!locationMap[country]) {
                                locationMap[country] = {};
                            }
                            locationMap[country][movie.Title + " (" + movie.Year + ")"] = movieMap[movie.Title[0]][movie.ID].role;
                        });
                    }
                }
            });
        });
        // add locations to map
        console.log(locationMap);
        var locationMinMax = getMovieCountRange(locationMap);
        console.log(locationMinMax[0] + " tot " + locationMinMax[1]);
        var minMaxStep = (locationMinMax[1] - locationMinMax[0]) / 5;
        console.log(minMaxStep);
        d3.json("data/countries.geo.json", function (error, geojson) { // open file with world data
            countries = {};
            // Read geojson countries
            for (var r = 0; r < geojson.features.length; r++) { // for each country in geojson
                var countryData = geojson.features[r];
                var countryName = countryData.properties.name;
                var countryCode = findCountryCode(countryName);
                countries[countryCode] = countryData;
            }
            console.log(countries);
            for (var location in locationMap) {
                var message = "";
                var num = Object.keys(locationMap[location]).length;
                var opacity = 0.3 + 0.1 * (Math.floor((num - locationMinMax[0]) / minMaxStep));
                for (var movie in locationMap[location]) {
                    message += "<font color='#FF183C'>" + movie + "</font>";
                    if (locationMap[location][movie] && locationMap[location][movie] != "") {
                        message += ": " + locationMap[location][movie];
                    }
                    message += "</br>";
                }
                countryCode = findCountryCode(location);
                if (countryCode && countries[countryCode]) {
                    addMovieFilmingLocation(countries[countryCode], location, message, opacity);
                } else {
                    console.log("Could not find " + location);
                }
            }
        });

        // add movies to map
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
                success = addMovieLocationMarker(country, country, message);
            }
        }
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

function addBirthLocationMarker(location, isMale) {
    try {
        var icon = null;
        if (isMale) {
            icon = manIcon;
        }
        else {
            icon = womanIcon;
        }
        geocodeDecoder.GetLocations(location, function (data) {
            var marker = L.marker([data[0].Y, data[0].X], {icon: icon}).addTo(map);
            marker.bindPopup("<b>Born in</b> " + location);
            marker.on('mouseover', function (e) {
                this.openPopup();
            });
        });
        return true;
    }
    catch (TypeError) {
        console.log("GeoCoder cannot find " + location);
        return false;
    }
}

function addMovieLocationMarker(location, locationName, message) {
    try {
        geocodeDecoder.GetLocations(location, function (data) {
            var marker = L.marker([data[0].Y, data[0].X]).addTo(map);
            //marker.bindPopup("<b>" + locationName + "</b></br>" + message);
            var popup = L.popup({
                maxHeight: 250
            }).setContent("<b>Produced in " + locationName + "</b></br>" + message);
            marker.bindPopup(popup);
            marker.on('mouseover', function (e) {
                this.openPopup();
            });
        });
        return true;
    }
    catch (TypeError) {
        return false;
    }
}

function addMovieFilmingLocation(countryData, locationName, message, opacity) {
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
            }).setContent("<b>Filmed in " + locationName + "</b></br>" + message);
            layer.bindPopup(popup);
        }
    }).addTo(map);
}

function getMovieCountRange(locationMap) {
    var min = -1;
    var max = -1;
    for (var location in locationMap) {
        num = Object.keys(locationMap[location]).length;
        if (min == -1 || num < min) {
            min = num;
        }
        if (max == -1 || num > max) {
            max = num;
        }
    }
    return [min, max];
}

function clearMapLayers(map) {
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

function groupDataMap(data) {
    // Find max per country
    var groupedData = d3.nest()
            .key(function (d) {
                return d.Country;
            })
            .key(function (d) {
                return d.Genre;
            })
            .rollup(function (d) {
                return {
                    Count: d3.sum(d, function (g) {
                        return +g.Count;
                    })};
            })
            .entries(data);

    var result = [];
    groupedData.forEach(function (d) { // for each country
        var max = 0;
        var genre = null;
        d.values.forEach(function (g) {
            if (g.values.Count > max) {
                max = g.values.Count;
                genre = g.key;
            }
        });
        result.push({
            country: findCountryCode(d.key),
            genre: genre
        });
    });
    return result;
}

function findGenreOfCountry(countryCode, data) {
    if (countryCode == null) {
        return null;
    }
    genreFound = null;
    data.forEach(function (d) {
        if (d.country == countryCode) {
            genreFound = d.genre;
        }
    });
    return genreFound;
}
