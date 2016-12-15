// Inspiration: http://bl.ocks.org/d3noob/d8be922a10cb0b148cd5

function genreProductionRate(divID, w, h, inputdata) {
    var margin = {top: 36, right: 36, bottom: 36, left: 42};
    w = w - margin.left - margin.right;
    h = h - margin.top - margin.bottom;

    var svg = d3.select(divID)
            .append('svg')
            .attr('width', w + margin.left + margin.right)
            .attr('height', h + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

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
    var data = groupDataLineChart(sortByYear(inputdata));

    // Find max count
    var maxCount = 0;
    data.forEach(function (d) {
        d.values.forEach(function (g) {
            if (g.values.Count > maxCount) {
                maxCount = g.values.Count;
            }
        });
    });

    // Scale the range of the data
    x.domain(d3.extent(inputdata, function (d) {
        return d.Year;
    }));
    y.domain([0, maxCount]);

    // Add data lines to svg
    data.forEach(function (d) {
        // Aggregate data
        var newValues = [];
        d.values.forEach(function (g) {
            newValues.push({
                Year: new Date(g.key),
                Count: g.values.Count
            });
        });
        // Draw data
        svg.append("path")
                .attr("class", "line")
                .attr("d", countLine(newValues))
                .style("stroke", colors[d.key]);
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
}

function groupDataLineChart(data) {
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
    return groupedData;
}