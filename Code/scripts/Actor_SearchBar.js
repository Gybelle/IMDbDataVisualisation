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

// CREATE ----------------------------------------------------------------------

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
    heightSmallRow = document.getElementById("lifetime").offsetHeight;
    widthSmallChart = document.getElementById("colLifetime").offsetWidth;
    $("#lifetime").css('width', widthSmallChart);
    heightNavbar = document.getElementById("menubar").offsetHeight;
    heightLargeRow = $(document).height() - heightNavbar - heightSmallRow;
    widthSmallLargeChart = document.getElementById("colLanguageChart").offsetWidth;
    $(".small_large_chart").css('width', widthSmallLargeChart);
    widthLargeChart = document.getElementById("colActorMap").offsetWidth;
    $(".large_chart").css('width', widthLargeChart);
    $(".large_chart").css('height', heightLargeRow);
    $("#languageInfo").css('top', heightSmallRow - 25);
}

// UPDATE ----------------------------------------------------------------------

function setActor(actorName) {
    yearFilterStart = null;
    yearFilterEnd = null;
    languageFilter = null;

    selectedActor = null;
    if (actorName == "") {
        return;
    }
    d3.dsv(';')("data/actors/actors_" + actorName[0] + ".csv", function (error, data) {
        // Find actor
        data.some(function (d) { // some stops when true is returned, thus searching can stop when a match is found
            if (nameMatches(actorName, d.Name)) {
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
            selectedActorMovies = [];
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
            });
        });
    });
}

function setMovie(movieName) {

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
    }
}