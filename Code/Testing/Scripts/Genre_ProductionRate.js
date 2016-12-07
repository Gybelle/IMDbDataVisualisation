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
    var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(20);
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(20);

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
            d.Year = parseDate(d.Year);
            d.Count = +d.Count;
        });
        var newData = data.sort(function (a, b) {
            return d3.ascending(a.Year, b.Year)
        });
        // FILTERS KOMEN HIER
        newData = d3.nest()
                .key(function (d) {
                    return d.Genre;
                })
                .rollup(function (d) {
                    return {
                        Year: d.Year,
                        Count: d3.sum(d, function (g) { return g.Count; })
                    };
                })
                .map(newData);
        console.log(newData);
        data = newData;

//        data = d3.nest()
//                .key(function (d) {
//                    return d.Genre, d.Year;
//                })
//                .rollup(function (d) {
//                    return d3.sum(d, function (g) {
//                        return g.Count;
//                    });
//                })
//                .entries(data)

        // Scale the range of the data
        x.domain(d3.extent(data, function (d) {
            return d.Year;
        }));
        y.domain([0, d3.max(data, function (d) {
                return d.Count;
            })]);

        // Group entries
        var groupedData = d3.nest()
                .key(function (d) {
                    return d.Genre;
                })
                .entries(data);
        console.log(groupedData);

        // Add data lines to svg
        groupedData.forEach(function (d) {
            svg.append("path")
                    .attr("class", "line")
                    .attr("d", countLine(d.values))
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
