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
        //shadowUrl: 'leaf-shadow.png',
        iconSize: [30, 30],
        //shadowSize: [50, 64],
        iconAnchor: [15, 15],
        //shadowAnchor: [4, 62],
        popupAnchor: [0, -10]
    });
    womanIcon = L.icon({
        iconUrl: 'img/icon_woman.png', // source: http://www.flaticon.com/authors/pixel-perfect
        //shadowUrl: 'leaf-shadow.png',
        iconSize: [30, 30],
        //shadowSize: [50, 64],
        iconAnchor: [15, 15],
        //shadowAnchor: [4, 62],
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
            addBirthLocationMarker(map, actor.birthLocation, actor.isMale);
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

            var movies = {};
            var q = d3.queue();
            for (var letter in movieMap) {
                q.defer(d3.dsv(';'), "data/movies/movies_" + letter + ".csv");
            }
            q.awaitAll(function (error, files) {
                // find movies
                files.forEach(function (file) {
                    file.forEach(function (movie) {
                        if (movieMap[movie.Title[0]]) {
                            if (movieMap[movie.Title[0]][movie.ID]) {
                                if (movie.Countries != "") {
                                    movie.Countries.split("*").forEach(function (country) {
                                        if (!movies[country]) {
                                            movies[country] = []
                                        }
                                        movies[country].push({title: movie.Title, year: movie.Year, role: movieMap[movie.Title[0]][movie.ID].role});
                                    })
                                }
                            }
                        }
                    });
                });
                // add movies to map
                for (var country in movies) {
                    var message = "";
                    movies[country].forEach(function (movie) {
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
                        success = addMovieLocationMarker(map, country, country, message);
                    }
                }
            });
        });
        console.log(actor);

    });
}

function findMovies(letter, movieMap, map) {
    d3.dsv(';')("data/movies/movies_" + letter + ".csv", function (error, data) {
        data.forEach(function (d) {
            if (movieMap[letter][d.ID]) {
                var title = "\"" + d.Title + "\" (" + d.Year + ")";
                movieMap[letter][d.ID].title = title;
                if (d.Countries != "") {
                    var countries = d.Countries.split("*");
                    countries.forEach(function (country) {
                        success = addMovieLocationMarker(map, country, country, title);
                        l = country;
                        while (!success && l.indexOf(",") >= 0) {
                            l = l.substring(l.indexOf(",") + 1);
                            success = addMovieLocationMarker(map, l, country, title);
                        }
                        if (!success) {
                            console.log(country + " DOES NOT EXIST!");
                        }
                    });
                }
            }
        });
        //console.log(movieMap);
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

function addBirthLocationMarker(map, location, isMale) {
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
        });
        return true;
    }
    catch (TypeError) {
        console.log("GeoCoder cannot find " + location);
        return false;
    }
}

function addMovieLocationMarker(map, location, locationName, message) {
    try {
        geocodeDecoder.GetLocations(location, function (data) {
            var marker = L.marker([data[0].Y, data[0].X]).addTo(map);
            //marker.bindPopup("<b>" + locationName + "</b></br>" + message);
            var popup = L.popup({
                maxHeight: 250
            }).setContent("<b>" + locationName + "</b></br>" + message);
            marker.bindPopup(popup);
        });
        return true;
    }
    catch (TypeError) {
        return false;
    }
}

function updateMap(map, inputdata) {
    clearMapLayers(map);
    d3.json("data/countries.geo.json", function (error, geojson) { // open file with world data
        // Group data
        var data = groupDataMap(inputdata);
        // Add geojson countries to map
        for (var r = 0; r < geojson.features.length; r++) { // for each country in geojson
            var countryData = geojson.features[r];
            var countryName = countryData.properties.name;
            var countryCode = findCountryCode(countryName);
            var genre = findGenreOfCountry(countryCode, data);
            if (genre != null) {
                addCountryToMap(map, countryData, colors[genre]);
            }
        }
    });
}

function clearMapLayers(map) {
    map.eachLayer(function (layer) {
        if (layer._path != undefined) {
            map.removeLayer(layer);
        }
    });
}

function addCountryToMap(map, countryData, fillColor) {
    if (map != null) {
        L.geoJson(countryData, {
            fillColor: fillColor,
            color: "#000000",
            weight: 0.5,
            opacity: 0.8,
            fillOpacity: 0.8
        }).addTo(map);
    } else {
        console.log("Map is null");
    }
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
