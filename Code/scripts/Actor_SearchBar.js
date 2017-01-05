

// Data
selectedActor = null;
selectedActorMovies = [];

selectedMovie = null;
selectedMovieActors = [];

yearFilterStart = null;
yearFilterEnd = null;

languageFilter = null;

countriesGeoJSON = null;

// Layout
divIDMap = null;
divIDLanguageChart = null;
widthSmallChart = 0;
heightSmallRow = 0;
widthSmallLargeChart = 0;
heightLargeRow = 0;

/*
 * HOW TO USE:
 *
 * Call initialiseCharts() to initialise.
 * Afterwards, use filterYears(beginYear, endYear) and filterLanguage(languageFilter) to recalculate the charts.
 * Use setActor(actorName) and setMovie(movieName) to set a new actor or movie.
 */

// CREATE CHARTS----------------------------------------------------------------

function initialiseCharts(idMap, idLanguageChart) {
    divIDMap = idMap;
    divIDLanguageChart = idLanguageChart;

    setLayout();

    d3.json("data/countries.geo.json", function (error, geojson) { // open file with world data
        countriesGeoJSON = {};
        // Read geojson countries
        for (var r = 0; r < geojson.features.length; r++) { // for each country in geojson
            var countryData = geojson.features[r];
            var countryName = countryData.properties.name;
            var countryCode = findCountryCode(countryName);
            countriesGeoJSON[countryCode] = countryData;
        }

    });

    createActorsMap(divIDMap);
    setBiographyWidgetActor(null);
    createActorPieChart("#" + divIDLanguageChart, null);
}

function setLayout() {
    heightNavbar = document.getElementById("menubar").offsetHeight;
    heightSmallRow = document.getElementById("lifetime").offsetHeight;
    heightLargeRow = $(document).height() - heightNavbar - heightSmallRow;
    widthLargeChart = document.getElementById("actorsMap").offsetWidth - 10;
    widthSmallChart = document.getElementById("menubar").offsetWidth - widthLargeChart - 200;
    //$("#lifetime").css('width', widthLargeChart * (5 / 9));
    //$(".small_chart").css('width', widthSmallChart);
    //$(".large_chart").css('width', widthLargeChart);
    $(".large_chart").css('height', heightLargeRow);
    $("#languageInfo").css('top', heightSmallRow - 20);
    $("#lifetimeInfo").css('top', heightSmallRow - 20);
    $("#filter-results").css('height', heightLargeRow - 100);
}

// UPDATE CHARTS----------------------------------------------------------------

function setActor(actorName) {
    yearFilterStart = null;
    yearFilterEnd = null;
    languageFilter = null;
    selectedActor = null;
    selectedActorMovies = [];
    selectedMovie = null;
    selectedMovieActors = [];

    if (actorName == "") {
        return;
    }
    setSearchBarText(actorName);
    setLoading(true);

    d3.dsv(';')("data/actors/actors_" + actorName[0] + ".csv", function (error, data) {
        // Find actor
        data.some(function (d) { // some stops when true is returned, thus searching can stop when a match is found
            if (actorName == d.Name) {
                selectedActor = {
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
        if (selectedActor == null) {
            console.log("Could not find " + actorName);
            return;
        }

        if (selectedActor.birthYear != "") {
            var currentYear = new Date().getFullYear();
            selectedActor.age = currentYear - +selectedActor.birthYear;
        }

        map_setActor(selectedActor, null);
        setBiographyWidgetActor(selectedActor);

        // Find movies
        var movieMap = {};
        d3.dsv(';')("data/actorsInMovies/actorMapping_" + Math.floor(selectedActor.id / 100000) + ".csv", function (error, data) {
            data.forEach(function (d) {
                if (selectedActor.id == d.ActorID.substring(0, d.ActorID.length - 1)) {
                    var movieLetter = d.MovieID.substring(d.MovieID.length - 1);
                    if (!movieMap[movieLetter]) {
                        movieMap[movieLetter] = {};
                    }
                    movieMap[d.MovieID.substring(d.MovieID.length - 1)][d.MovieID.substring(0, d.MovieID.length - 1)] = {role: d.Role};
                }
            });
            var q = d3.queue();
            for (var letter in movieMap) {
                q.defer(d3.dsv(';'), "data/movies/movies_" + letter + ".csv");
            }
            q.awaitAll(function (error, files) {
                // find movies
                files.forEach(function (file) {
                    file.forEach(function (movie) {
                        if (movieMap[movie.Title[0]] && movieMap[movie.Title[0]][movie.ID]) {
                            selectedActorMovies.push({
                                id: movie.ID,
                                title: movie.Title,
                                year: movie.Year,
                                role: movieMap[movie.Title[0]][movie.ID].role,
                                countries: uniqueCountriesOf(movie.Countries.split("*")),
                                locations: uniqueCountriesOf(movie.Locations.split("*")),
                                languages: movie.Language.split("*")
                            });
                        }
                    });
                });
                updateCharts();
                clearSearchBar();
                setLoading(false);
            });
        });
    });
}

function setActorByID(actorID) {
    yearFilterStart = null;
    yearFilterEnd = null;
    languageFilter = null;
    selectedActor = null;
    selectedActorMovies = [];
    selectedMovie = null;
    selectedMovieActors = [];

    if (actorID == "") {
        return;
    }

    d3.dsv(';')("data/actors/actors_" + actorID.slice(-1) + ".csv", function (error, data) {
        // Find actor
        data.some(function (d) { // some stops when true is returned, thus searching can stop when a match is found
            if (actorID.substring(0, actorID.length - 1) == d.ActorID) {
                selectedActor = {
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
        if (selectedActor == null) {
            console.log("Could not find " + actorID);
            return;
        }
        setSearchBarText(selectedActor.name);
        setLoading(true);

        if (selectedActor.birthYear != "") {
            var currentYear = new Date().getFullYear();
            selectedActor.age = currentYear - +selectedActor.birthYear;
        }

        map_setActor(selectedActor, null);
        setBiographyWidgetActor(selectedActor);

        // Find movies
        var movieMap = {};
        d3.dsv(';')("data/actorsInMovies/actorMapping_" + Math.floor(selectedActor.id / 100000) + ".csv", function (error, data) {
            data.forEach(function (d) {
                if (selectedActor.id == d.ActorID.substring(0, d.ActorID.length - 1)) {
                    var movieLetter = d.MovieID.substring(d.MovieID.length - 1);
                    if (!movieMap[movieLetter]) {
                        movieMap[movieLetter] = {};
                    }
                    movieMap[d.MovieID.substring(d.MovieID.length - 1)][d.MovieID.substring(0, d.MovieID.length - 1)] = {role: d.Role};
                }
            });
            var q = d3.queue();
            for (var letter in movieMap) {
                q.defer(d3.dsv(';'), "data/movies/movies_" + letter + ".csv");
            }
            q.awaitAll(function (error, files) {
                // find movies
                files.forEach(function (file) {
                    file.forEach(function (movie) {
                        if (movieMap[movie.Title[0]] && movieMap[movie.Title[0]][movie.ID]) {
                            selectedActorMovies.push({
                                id: movie.ID,
                                title: movie.Title,
                                year: movie.Year,
                                role: movieMap[movie.Title[0]][movie.ID].role,
                                countries: uniqueCountriesOf(movie.Countries.split("*")),
                                locations: uniqueCountriesOf(movie.Locations.split("*")),
                                languages: movie.Language.split("*")
                            });
                        }
                    });
                });
                updateCharts();
                clearSearchBar();
                setLoading(false);
            });
        });
    });
}

function setMovie(movieName) {
    yearFilterStart = null;
    yearFilterEnd = null;
    languageFilter = null;
    selectedActor = null;
    selectedActorMovies = [];
    selectedMovie = null;
    selectedMovieActors = [];

    if (movieName == "") {
        return;
    }
    setSearchBarText(movieName);
    setLoading(true);

    var movieTitle = movieName.substring(0, movieName.indexOf("(")).trim();
    var movieYear = movieName.substring(movieName.indexOf("(") + 1, movieName.indexOf(")"));

    d3.dsv(';')("data/movies/movies_" + movieName[0] + ".csv", function (error, data) {
        // Find movie
        data.some(function (d) { // some stops when true is returned, thus searching can stop when a match is found
            if (movieTitle == d.Title && movieYear == d.Year) {
                selectedMovie = {
                    id: d.ID,
                    title: d.Title,
                    year: +d.Year,
                    locations: uniqueCountriesOf(d.Locations.split("*")),
                    countries: uniqueCountriesOf(d.Countries.split("*"))
                };
                return true;
            }
        });
        if (selectedMovie == null) {
            console.log("Could not find " + movieName);
            return;
        }

        map_setMovie(selectedMovie, null);
        setBiographyWidgetMovie(selectedMovie);

        // Find actors
        var actorMap = {};
        d3.dsv(';')("data/actorsInMovies/movieMapping_" + Math.floor(selectedMovie.id / 50000) + ".csv", function (error, data) {
            data.forEach(function (d) {
                if (selectedMovie.id == d.MovieID.substring(0, d.MovieID.length - 1)) {// && Boolean(d.IsMovie)) {
                    var actorLetter = d.ActorID.substring(d.ActorID.length - 1);
                    if (!actorMap[actorLetter]) {
                        actorMap[actorLetter] = {};
                    }
                    actorMap[d.ActorID.substring(d.ActorID.length - 1)][d.ActorID.substring(0, d.ActorID.length - 1)] = {role: d.Role};
                }
            });
            var q = d3.queue();
            for (var letter in actorMap) {
                q.defer(d3.dsv(';'), "data/actors/actors_" + letter + ".csv");
            }
            q.awaitAll(function (error, files) {
                files.forEach(function (file) {
                    file.forEach(function (actor) {
                        if (actorMap[actor.Name[0]] && actorMap[actor.Name[0]][actor.ActorID]) {
                            selectedMovieActors.push({
                                name: actor.Name,
                                id: actor.ActorID,
                                isMale: (actor.IsMale == "True"),
                                birthYear: actor.BirthYear,
                                birthLocation: actor.BirthLocation,
                                deathYear: actor.DeathYear,
                                deathLocation: actor.DeathLocation,
                                role: actorMap[actor.Name[0]][actor.ActorID].role
                            });
                        }
                    });
                });
                updateCharts();
                clearSearchBar();
                setLoading(false);
            });
        });
    });
}

function setMovieByID(movieID) {
    yearFilterStart = null;
    yearFilterEnd = null;
    languageFilter = null;
    selectedActor = null;
    selectedActorMovies = [];
    selectedMovie = null;
    selectedMovieActors = [];

    if (movieID == "") {
        return;
    }

    console.log(movieID.slice(-1));
    d3.dsv(';')("data/movies/movies_" + movieID.slice(-1) + ".csv", function (error, data) {
        // Find movie
        data.some(function (d) { // some stops when true is returned, thus searching can stop when a match is found
            if (d.ID == movieID.substring(0, movieID.length - 1)) {
                selectedMovie = {
                    id: d.ID,
                    title: d.Title,
                    year: +d.Year,
                    locations: uniqueCountriesOf(d.Locations.split("*")),
                    countries: uniqueCountriesOf(d.Countries.split("*"))
                };
                return true;
            }
        });
        if (selectedMovie == null) {
            console.log("Could not find " + movieID);
            return;
        }
        setSearchBarText(selectedMovie.title + " (" + selectedMovie.year + ")");
        setLoading(true);

        map_setMovie(selectedMovie, null);
        setBiographyWidgetMovie(selectedMovie);

        // Find actors
        var actorMap = {};
        d3.dsv(';')("data/actorsInMovies/movieMapping_" + Math.floor(selectedMovie.id / 50000) + ".csv", function (error, data) {
            data.forEach(function (d) {
                if (selectedMovie.id == d.MovieID.substring(0, d.MovieID.length - 1)) {// && Boolean(d.IsMovie)) {
                    var actorLetter = d.ActorID.substring(d.ActorID.length - 1);
                    if (!actorMap[actorLetter]) {
                        actorMap[actorLetter] = {};
                    }
                    actorMap[d.ActorID.substring(d.ActorID.length - 1)][d.ActorID.substring(0, d.ActorID.length - 1)] = {role: d.Role};
                }
            });
            var q = d3.queue();
            for (var letter in actorMap) {
                q.defer(d3.dsv(';'), "data/actors/actors_" + letter + ".csv");
            }
            q.awaitAll(function (error, files) {
                files.forEach(function (file) {
                    file.forEach(function (actor) {
                        if (actorMap[actor.Name[0]] && actorMap[actor.Name[0]][actor.ActorID]) {
                            selectedMovieActors.push({
                                name: actor.Name,
                                id: actor.ActorID,
                                isMale: (actor.IsMale == "True"),
                                birthYear: actor.BirthYear,
                                birthLocation: actor.BirthLocation,
                                deathYear: actor.DeathYear,
                                deathLocation: actor.DeathLocation,
                                role: actorMap[actor.Name[0]][actor.ActorID].role
                            });
                        }
                    });
                });
                updateCharts();
                clearSearchBar();
                setLoading(false);
            });
        });
    });
}

function filterYears(beginYear, endYear) {
    yearFilterStart = beginYear;
    yearFilterEnd = endYear;
    updateCharts();
}

function filterLanguage(language) {
    languageFilter = language;
    updateCharts();
}

function updateCharts() {
    if (selectedActor != null) {
        var data = selectedActorMovies;
        var dataOnlyYearFilter = selectedActorMovies;
        var dataOnlyLanguageFilter = selectedActorMovies;
        if (yearFilterStart != null) {
            data = data.filter(function (movie) {
                return movie.year >= yearFilterStart;
            });
            dataOnlyYearFilter = dataOnlyYearFilter.filter(function (movie) {
                return movie.year >= yearFilterStart;
            });
        }
        if (yearFilterEnd != null) {
            data = data.filter(function (movie) {
                return movie.year <= yearFilterEnd;
            });
            dataOnlyYearFilter = dataOnlyYearFilter.filter(function (movie) {
                return movie.year <= yearFilterEnd;
            });
        }
        if (languageFilter != null) {
            data = data.filter(function (movie) {
                return movie.languages.indexOf(languageFilter) != -1;
            });
            dataOnlyLanguageFilter = dataOnlyLanguageFilter.filter(function (movie) {
                return movie.languages.indexOf(languageFilter) != -1;
            });
        }
        createActorPieChart("#" + divIDLanguageChart, dataOnlyYearFilter);
        setBiographyWidgetMovieMap(dataOnlyLanguageFilter);
        map_setActor(selectedActor, data);
    } else if (selectedMovie != null) {
        var data = selectedMovieActors;
        var dataOnlyYearFilter = selectedMovieActors;
        var dataOnlyLanguageFilter = selectedMovieActors;

        if (yearFilterStart != null) {
            data = data.filter(function (actor) {
                if (actor.birthYear == "") {
                    return false;
                }
                return +actor.birthYear >= yearFilterStart;
            });
            dataOnlyYearFilter = dataOnlyYearFilter.filter(function (actor) {
                if (actor.birthYear == "") {
                    return false;
                }
                return +actor.birthYear >= yearFilterStart;
            });
        }
        if (yearFilterEnd != null) {
            data = data.filter(function (actor) {
                if (actor.birthYear == "") {
                    return false;
                }
                return +actor.birthYear <= yearFilterEnd;
            });
            dataOnlyYearFilter = dataOnlyYearFilter.filter(function (actor) {
                if (actor.birthYear == "") {
                    return false;
                }
                return +actor.birthYear <= yearFilterEnd;
            });
        }
        if (languageFilter != null) {
            data = data.filter(function (actor) {
                return getCountry(actor.birthLocation) == languageFilter;
            });
            dataOnlyLanguageFilter = dataOnlyLanguageFilter.filter(function (actor) {
                return getCountry(actor.birthLocation) == languageFilter;
            });
        }
        createMoviePieChart("#" + divIDLanguageChart, dataOnlyYearFilter);
        setBiographyWidgetActorMap(dataOnlyLanguageFilter);
        map_setMovie(selectedMovie, data);
    }
}

// SEARCH BAR FUNCTIONS --------------------------------------------------------

function initialiseSearchBar() {
    d3.select('#custom-search-input-field').on('keyup', function (data) {
        var text = d3.select('#custom-search-input-field').property('value');
        if (text == "") {
            addSearchBarSuggestions([], []);
        } else {
            findMatching(text);
        }
    });
}

function addSearchBarSuggestions(actors, movies) {
    var matches = [];
    actors.forEach(function (item) {
        var element = document.createElement('div');
        element.innerHTML = item.name;
        element.className = "searchResult searchResultActor";
        element.addEventListener('click', function () {
            setActorByID(item.id);
        });
        matches.push({key: item.name, value: element});
    });
    movies.forEach(function (item) {
        var element = document.createElement('div');
        element.innerHTML = item.title;
        element.className = "searchResult searchResultMovie";
        element.addEventListener('click', function () {
            setMovieByID(item.id);
        });
        matches.push({key: item.title, value: element});
    });
    matches.sort(function (x, y) {
        return d3.ascending(x.key, y.key);
    });
    d3.select('#filter-results').html("");
    matches.forEach(function (element) {
        document.getElementById('filter-results').appendChild(element.value);
    });

}

function findMatching(text) {
    var firstLetter = getLetter(text[0]);
    d3.dsv(';')("data/actors/actors_" + firstLetter + ".csv", function (error, actors) {
        var matchingActors = [];
        actors.some(function (actor) {
            if (nameMatches(text, actor.Name)) {
                matchingActors.push({id: actor.ActorID + getLetter(actor.Name[0]), name: actor.Name});
            }
            if (matchingActors.length > 50) {
                return true;
            }
        });
        var matchingMovies = [];
        d3.dsv(';')("data/movies/movies_" + firstLetter + ".csv", function (error, movies) {
            movies.some(function (movie) {
                if (nameMatches(text, movie.Title + " (" + movie.Year + ")")) {
                    matchingMovies.push({id: movie.ID + getLetter(movie.Title[0]), title: movie.Title + " (" + movie.Year + ")"});
                }
                if (matchingMovies.length > 50) {
                    return true;
                }
            });
            addSearchBarSuggestions(matchingActors, matchingMovies);
        });
    });
}

function nameMatches(name1, name2) {
    if (name1 == name2) {
        return true;
    }
    var name1parts = name1.split(" ");
    var match = true;
    name1parts.some(function (namePart) {
        if (name2.toLowerCase().indexOf(namePart.toLowerCase()) == -1) {
            match = false;
            return true; // quit Some()
        }
    });
    return match;
}

function setSearchBarText(text) {
    if (text != d3.select('#custom-search-input-field').property('value')) {
        clearSearchBar();
    }
    document.getElementById("custom-search-input-field").value = text;
}

function clearSearchBar() {
    document.getElementById("custom-search-input-field").value = "";
    addSearchBarSuggestions([], []);
}

function setLoading(loading) {
    if (loading) {
        d3.select("#searchIcon").attr("class", "glyphicon glyphicon-time");
        d3.select("#searchButton").attr("style", "height: 40px; background-color: darkorange; border-color: darkred;");
    } else {
        d3.select("#searchIcon").attr("class", "glyphicon glyphicon-search");
        d3.select("#searchButton").attr("style", "height: 40px; background-color: #31b0d5; border-color: #268abc;");
    }
}

function getLetter(letter) {
    return (letter.toUpperCase() >= "A" && letter.toUpperCase() <= "Z") ? letter.toUpperCase() : "-";
}
