// Inspiration: http://bl.ocks.org/d3noob/d8be922a10cb0b148cd5

function genreProductionRate(divID, w, h, beginYearString, endYearString, genreFilter, countryFilter) {
    // Define color scale
    //    var color = d3.scale.category20();
    var color = d3.scale.ordinal()
            .domain(["Documentary", "Short", "Comedy", "Family", "Sport", "Action", "Animation", "Romance", "Drama", "Western", "News", "Horror", "History", "Crime", "Sci-Fi", "Biography", "Fantasy", "Music", "War", "Adventure", "Thriller", "Musical", "Mystery", "Adult", "Film-Noir", "Reality-TV", "Talk-Show", "Game-Show", "Erotica", "Experimental", "Commercial", "Sex", "Hardcore"])
            .range(["#6599C0", "#F0CC76", "#64BD91", "#F59A6E", "#AFD572", "#FF7F0E", "#E2D35C", "#D84E67", "#7073A0", "#58B16F", "#A2C5A5", "#C25D7F", "#FCD450", "#FF183C", "#2AB1CF", "#348B85", "#70C256", "#72CAFA", "#3A5DA1", "#4EA6AA", "#916589", "#C25D7F", "#4EE69B", "#D6AA51", "#DE6E48", "#AD6A8B", "#73539F", "#FF185D", "#57C27C", "#696C97", "#F7B6D2", "#DA707A", "#878787"]);


    var margin = {top: 36, right: 36, bottom: 36, left: 42};
    w = w - margin.left - margin.right;
    h = h - margin.top - margin.bottom;

    var svg = d3.select(divID)
            .append('svg')
            .attr('width', w + margin.left + margin.right)
            .attr('height', h + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var parseDate = d3.time.format("%Y").parse;
    var beginYear = parseDate(beginYearString);
    var endYear = parseDate(endYearString);

    // Ranges:
    var x = d3.time.scale().range([0, w]);
    var y = d3.scale.linear().range([h, 0]);

    // Axes:
    var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(10);
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);

    //Define the line
    var countLine = d3.svg.line().interpolate("basis")
            .x(function (d) {
                return x(d.Year);
            })
            .y(function (d) {
                return y(d.Count);
            });

    // Get the data
    d3.dsv(';')("data/GenreYearCounty.csv", function (error, data) {
        data.forEach(function (d) {
            //d.Year = parseDate(d.Year);
            d.Count = +d.Count;
        });
        data.sort(function (a, b) {
            return d3.ascending(a.Year, b.Year);
        });

        // Filtering
        data = data.filter(function (d) {
            var year = parseDate(d.Year);
            return year >= beginYear && year <= endYear;
        });
        if (genreFilter != null) {
            data = data.filter(function (d) {
                return genreFilter.indexOf(d.Genre) >= 0;
            });
        }
        if (countryFilter != null) {
            data = data.filter(function (d) {
                return d.Country == countryFilter;
            });
        }

        // Group entries
        var groupedData = d3.nest()
                .key(function (d) {
                    return d.Genre;
                })
                .key(function (d) {
                    return d.Year;
                })
                .rollup(function (d) {
                    return {
                        Count: d3.sum(d, function (g) {
                            return g.Count;
                        })};
                })
                .entries(data);

        var maxCount = 0
        groupedData.forEach(function (d) {
            d.values.forEach(function (g) {
                if (g.values.Count > maxCount) {
                    maxCount = g.values.Count;
                }
            });
        });

        // Scale the range of the data
        x.domain(d3.extent(data, function (d) {
            return parseDate(d.Year);
        }));
        y.domain([0, maxCount]);

        // Add data lines to svg
        groupedData.forEach(function (d) {
            // Aggregate data
            var newValues = [];
            d.values.forEach(function (g) {
                newValues.push({
                    Year: parseDate(g.key),
                    Count: g.values.Count
                });
            });
            // Draw data
            svg.append("path")
                    .attr("class", "line")
                    .attr("d", countLine(newValues))
                    .style("stroke", color(d.key));
        });

        // Add x and y axis to svg
        svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + h + ")")
                .call(xAxis);
        svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);

        // The Legend
        /*
        var legend = d3.select(divID).append('div').attr("class", "legend");
        groupedData.forEach(function (d) {
            series = legend.append('div');
            series.append('div').attr("class", "series-marker").style("background-color", color(d.key));
            series.append('p').text(d.key);
        });*/
    });
}
