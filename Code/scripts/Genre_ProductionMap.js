// Inspiration: https://gist.github.com/d3noob/9211665
// Country data source: http://bl.ocks.org/mbostock/raw/4090846/world-110m.json
// Country data source: http://bl.ocks.org/mbostock/raw/4090846/world-country-names.tsv

function genreProductionMap(divID, w, h, beginYearString, endYearString, genreFilter) {
    var margin = {top: 50, right: 50, bottom: 50, left: 50};
    w = w - margin.left - margin.right;
    h = h - margin.top - margin.bottom;

    // CREATING MAP ------------------------------------------------------------
    map = createMap(divID);

    // Add an svg element the map
    var svg = d3.select(map.getPanes().overlayPane).append("svg");
    var g = svg.append("g").attr("class", "leaflet-zoom-hide");

    // ADD DATA TO MAP ---------------------------------------------------------
    d3.json("data/countries.geo.json", function (error, geojson) { // open file with world data
        // Filter data
        var data = filterAndGroupData(genreYearCountryData, beginYearString, endYearString, genreFilter);

        // Add geojson countries to map
        for (var r = 0; r < geojson.features.length; r++) { // for each country in geojson
            var countryData = geojson.features[r];
            var countryName = countryData.properties.name;
            var countryCode = findCountryCode(countryName);
            var genre = findGenreOfCountry(countryCode, data);
            if (genre != null) {
                addCountryToMap(countryData, colors[genre]);
            }
        }
    });
}

/* Initialize map using LeafLet. The created map is returned. */
function createMap(divID) {
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
    return map;
}

function addCountryToMap(countryData, fillColor) {
    L.geoJson(countryData, {
        fillColor: fillColor,
        color: "#000000",
        weight: 0.5,
        opacity: 0.8,
        fillOpacity: 0.8
    }).addTo(map);
}

function filterAndGroupData(data, beginYear, endYear, genreFilter) {
    data = filterYear(data, beginYear, endYear);
    data = filterGenre(data, genreFilter);

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
