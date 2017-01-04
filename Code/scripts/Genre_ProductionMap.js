// Inspiration: https://gist.github.com/d3noob/9211665
// Country data source: http://bl.ocks.org/mbostock/raw/4090846/world-110m.json
// Country data source: http://bl.ocks.org/mbostock/raw/4090846/world-country-names.tsv

var map = null;

/* Initialize map using LeafLet. The created map is returned. */
function createGenreProductionMap(divID) {
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
                addCountryToMap(map, countryData, colors[genre], countryName, countryName + ": " + genre);
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

function addCountryToMap(map, countryData, fillColor, country, tooltip) {
    if (map != null) {
        L.geoJson(countryData, {
            style: function (feature) {
                return {
                    "fillColor": fillColor,
                    "color": "#000000",
                    "weight": 0.5,
                    "opacity": 0.8,
                    "fillOpacity": 0.8
                };
            },
            onEachFeature: function (feature, layer) {
                layer.on("mouseover", function (e) {
                    document.getElementById("chartInfo").innerHTML = tooltip;
                    document.getElementById("chartInfo").style.visibility = "visible";
                });
                layer.on("mouseout", function (e) {
                    document.getElementById("chartInfo").style.visibility = "hidden";
                });
                layer.on("click", function (e) {
                    if (countryFilter == null) {
                        countryFilter = [findCountry(findCountryCode(country))];
                    } else {
                        countryFilter = null;
                    }
                    updateView(startDate, endDate, genreFilter, countryFilter);

                });
            }
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
