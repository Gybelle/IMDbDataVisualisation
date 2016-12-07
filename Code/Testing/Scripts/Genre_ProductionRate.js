// Inspiration: http://bl.ocks.org/d3noob/d8be922a10cb0b148cd5

function genreProductionRate(divID, w, h) {
    // Define color scale
    var color = d3.scale.category20();
    var margin = {top: 50, right: 50, bottom: 50, left: 50};
    w = w - margin.left - margin.right;
    h = h - margin.top - margin.bottom;

    var svg = d3.select(divID)
            .append('svg')
            .attr('width', w + margin.left + margin.right)
            .attr('height', h + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var parseDate = d3.time.format("%Y").parse;

    // Ranges:
    var x = d3.time.scale().range([0, w]);
    var y = d3.scale.linear().range([h, 0]);

    // Axes:
    var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(10);
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);

    //Define the line
    var countLine = d3.svg.line()
            .x(function (d) {
                return x(d.Year);
            })
            .y(function (d) {
                return y(d.Count);
            });

    // Get the data
    d3.dsv(';')("GenreYearCounty.csv", function (error, data) {
        data.forEach(function (d) {
//            d.Year = parseDate(d.Year);
            d.Count = +d.Count;
        });
        data.sort(function (a, b) {
            return d3.ascending(a.Year, b.Year);
        });
        // FILTERS KOMEN HIER

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
        var legend = d3.select(divID).append('div').attr("class", "legend");
        groupedData.forEach(function (d) {
            series = legend.append('div');
            series.append('div').attr("class", "series-marker").style("background-color", color(d.key));
            series.append('p').text(d.key);
        });
    });
}
