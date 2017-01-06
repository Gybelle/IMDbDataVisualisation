/*
 * @author: Anaïs Ools
 */

function genreProductionMax(divID, w, h, inputdata) {
    var margin = {top: 10, right: 56, bottom: 36, left: 36};
    w = w - margin.left - margin.right;
    h = h - margin.top - margin.bottom - 35;

    var title = d3.select(divID)
            .append('div')
            .attr('id', "barChartTitle")
            .attr('class', "chartTitle")
            .html("Highest rated genre per year");
    var svg = d3.select(divID)
            .append('svg')
            .attr('width', w + margin.left + margin.right)
            .attr('height', h + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Ranges:
    var x = d3.scale.ordinal().rangeRoundBands([0, w], 0);
    var y = d3.scale.linear().range([h, 0]);

    // Axes:
    var xAxis = d3.svg.axis().scale(x).orient("bottom") //.tickFormat(d3.time.format("%Y")); // .ticks(10)
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);

    // Get the data
    var data = groupDataBarChart(sortByYear(inputdata));

    // Scale the range of the data
    x.domain(data.map(function (d) {
        return d.Year;
    }));
    y.domain([0, 1]);

    // Add x and y axis to svg
    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis);

    // Add data to svg
    svg.selectAll("bar")
            .data(data)
            .enter().append("rect")
            .style("fill", function (d) {
                return colors[d.MaxGenre];
            })
            .attr("x", function (d) {
                return x(d.Year);
            })
            .attr("width", x.rangeBand())
            .attr("y", function (d) {
                return y(1);
            })
            .attr("height", function (d) {
                return h - y(1);
            })
            .on("mouseover", function (d) {
                if (d.Year) {
                    d3.select("#barChartTitle").html("Highest rated genre in " + d.Year + ": " + d.MaxGenre);
                }
            })
            .on("mouseleave", function (d) {
                d3.select("#barChartTitle").html("Highest rated genre per year");
            });

    correctTicks(x.domain());
}

function groupDataBarChart(data) {
    data = data.filter(function (d) {
        return d.Rating != 0;
    });

    // Group entries by (year, genre)
    var groupedData = d3.nest()
            .key(function (d) {
                return d.Year;
            })
            .key(function (d) {
                return d.Genre;
            })
            .entries(data);

    // Group entries again, by genre
    var maxPerYear = [];
    groupedData.forEach(function (d) { // for each year
        var maxGenre = null;
        var maxGenreRating = -1;
        d.values.forEach(function (g) { // for each genre within year
            var totalRating = 0;
            var count = 0;
            g.values.forEach(function (m) { // for each country-entry
                totalRating += m.Count * m.Rating;
                count += m.Count;
            });
            var avg = totalRating / count;

            if (avg > maxGenreRating) {
                maxGenre = g.key;
                maxGenreRating = avg;
            }
        });
        maxPerYear.push({
            Year: new Date(d.key).getFullYear(),
            MaxGenre: maxGenre,
            MaxGenreCount: maxGenreRating
        });
    });
    return maxPerYear;
}

function correctTicks(domain) {
    var numTicks = 7;
    if (domain.length <= numTicks) {
        return;
    }
    var min = domain[0], max = domain[domain.length - 1];
    var diff = max - min;
    var step = diff / (numTicks - 1);
    var desiredTicks = [];
    for (var i = 0; i < numTicks; i++) {
        desiredTicks.push(Math.round(min + (step * i)));
    }
    var ticks = d3.select("#genreProductionMax").selectAll(".tick");
    ticks[0].forEach(function (tick) {
        if (desiredTicks.indexOf(tick.__data__) == -1) {
            tick.remove();
        }
    });
}