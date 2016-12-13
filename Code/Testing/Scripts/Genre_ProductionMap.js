// Inspiration: https://gist.github.com/d3noob/9211665
// Country data source: http://bl.ocks.org/mbostock/raw/4090846/world-110m.json
// Country data source: http://bl.ocks.org/mbostock/raw/4090846/world-country-names.tsv

function genreProductionMap(divID, w, h, beginYearString, endYearString, genreFilter) {
    // Define color scale
    var color = d3.scale.ordinal()
            .domain(["Documentary", "Short", "Comedy", "Family", "Sport", "Action", "Animation", "Romance", "Drama", "Western", "News", "Horror", "History", "Crime", "Sci-Fi", "Biography", "Fantasy", "Music", "War", "Adventure", "Thriller", "Musical", "Mystery", "Adult", "Film-Noir", "Reality-TV", "Talk-Show", "Game-Show", "Erotica", "Experimental", "Commercial", "Sex", "Hardcore"])
            .range(["#6599C0", "#F0CC76", "#64BD91", "#F59A6E", "#AFD572", "#FF7F0E", "#E2D35C", "#D84E67", "#7073A0", "#58B16F", "#A2C5A5", "#C25D7F", "#FCD450", "#FF183C", "#2AB1CF", "#348B85", "#70C256", "#72CAFA", "#3A5DA1", "#4EA6AA", "#916589", "#C25D7F", "#4EE69B", "#D6AA51", "#DE6E48", "#AD6A8B", "#73539F", "#FF185D", "#57C27C", "#696C97", "#F7B6D2", "#DA707A", "#878787"]);

    var margin = {top: 50, right: 50, bottom: 50, left: 50};
    w = w - margin.left - margin.right;
    h = h - margin.top - margin.bottom;

    // CREATING MAP ------------------------------------------------------------
    var map = createMap(divID);

    // Add an svg element the map
    var svg = d3.select(map.getPanes().overlayPane).append("svg");
    var g = svg.append("g").attr("class", "leaflet-zoom-hide");

    // LOADING COUNTRY DATA ----------------------------------------------------
    d3.tsv("js/mbostock/world-country-names.tsv", function (error, countries) {
        countries = countries.filter(function (d) {
            return d.name == "Belgium";
        });
        console.log(countries);
        
        d3.json("js/mbostock/world-110m.json", function (error, countryData) {
            
            console.log(countryData);
        });
    });
    //var countryData = d3.json, "js/mbostock/world-110m.json"
    //.defer(d3.tsv, "js/mbostock/world-country-names.tsv")
    //.await(ready);




//    var svg = d3.select(divID)
//            .append('svg')
//            .attr('width', w + margin.left + margin.right)
//            .attr('height', h + margin.top + margin.bottom)
//            .append('g')
//            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
//
//    var parseDate = d3.time.format("%Y").parse;
//    var beginYear = parseDate(beginYearString);
//    var endYear = parseDate(endYearString);
//
//    // Ranges:
//    var x = d3.time.scale().range([0, w]);
//    var y = d3.scale.linear().range([h, 0]);
//
//    // Axes:
//    var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(10);
//    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);
//
//    //Define the line
//    var countLine = d3.svg.line().interpolate("basis")
//            .x(function (d) {
//                return x(d.Year);
//            })
//            .y(function (d) {
//                return y(d.Count);
//            });
//
//    // Get the data
//    d3.dsv(';')("GenreYearCounty.csv", function (error, data) {
//        data.forEach(function (d) {
//            //d.Year = parseDate(d.Year);
//            d.Count = +d.Count;
//        });
//        data.sort(function (a, b) {
//            return d3.ascending(a.Year, b.Year);
//        });
//
//        // Filtering
//        data = data.filter(function (d) {
//            var year = parseDate(d.Year);
//            return year >= beginYear && year <= endYear;
//        });
//        if (genreFilter != null) {
//            data = data.filter(function (d) {
//                return genreFilter.indexOf(d.Genre) >= 0;
//            });
//        }
//        if (countryFilter != null) {
//            data = data.filter(function (d) {
//                return d.Country == countryFilter;
//            });
//        }
//
//        // Group entries
//        var groupedData = d3.nest()
//                .key(function (d) {
//                    return d.Genre;
//                })
//                .key(function (d) {
//                    return d.Year;
//                })
//                .rollup(function (d) {
//                    return {
//                        Count: d3.sum(d, function (g) {
//                            return g.Count;
//                        })};
//                })
//                .entries(data);
//
//        var maxCount = 0
//        groupedData.forEach(function (d) {
//            d.values.forEach(function (g) {
//                if (g.values.Count > maxCount) {
//                    maxCount = g.values.Count;
//                }
//            });
//        });
//
//        // Scale the range of the data
//        x.domain(d3.extent(data, function (d) {
//            return parseDate(d.Year);
//        }));
//        y.domain([0, maxCount]);
//
//        // Add data lines to svg
//        groupedData.forEach(function (d) {
//            // Aggregate data
//            var newValues = [];
//            d.values.forEach(function (g) {
//                newValues.push({
//                    Year: parseDate(g.key),
//                    Count: g.values.Count
//                });
//            });
//            // Draw data
//            svg.append("path")
//                    .attr("class", "line")
//                    .attr("d", countLine(newValues))
//                    .style("stroke", color(d.key));
//        });
//
//        // Add x and y axis to svg
//        svg.append("g")
//                .attr("class", "x axis")
//                .attr("transform", "translate(0," + h + ")")
//                .call(xAxis);
//        svg.append("g")
//                .attr("class", "y axis")
//                .call(yAxis);
//
//        // The Legend
//        var legend = d3.select(divID).append('div').attr("class", "legend");
//        groupedData.forEach(function (d) {
//            series = legend.append('div');
//            series.append('div').attr("class", "series-marker").style("background-color", color(d.key));
//            series.append('p').text(d.key);
//        });
//    });
}

/* Initialize map using LeafLet. The created map is returned. */
function createMap(divID) {
    var map = L.map(divID, {
        center: [20.0, 5.0],
        minZoom: 2,
        zoom: 2
    });
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
        id: 'mapbox.light'
    }).addTo(map);
    map.keyboard.disable();
    return map;
}