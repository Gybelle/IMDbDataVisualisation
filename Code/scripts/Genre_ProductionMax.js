// Inspiration: https://bl.ocks.org/mbostock/3885304
// Inspiration: http://bl.ocks.org/d3noob/8952219

function genreProductionMax(divID, w, h, beginYearString, endYearString, genreFilter, countryFilter) {
    // Define color scale
    var color = d3.scale.ordinal()
            .domain(["Documentary", "Short", "Comedy", "Family", "Sport", "Action", "Animation", "Romance", "Drama", "Western", "News", "Horror", "History", "Crime", "Sci-Fi", "Biography", "Fantasy", "Music", "War", "Adventure", "Thriller", "Musical", "Mystery", "Adult", "Film-Noir", "Reality-TV", "Talk-Show", "Game-Show", "Erotica", "Experimental", "Commercial", "Sex", "Hardcore"])
            .range(["#6599C0", "#F0CC76", "#64BD91", "#F59A6E", "#AFD572", "#FF7F0E", "#E2D35C", "#D84E67", "#7073A0", "#58B16F", "#A2C5A5", "#C25D7F", "#FCD450", "#FF183C", "#2AB1CF", "#348B85", "#70C256", "#72CAFA", "#3A5DA1", "#4EA6AA", "#916589", "#C25D7F", "#4EE69B", "#D6AA51", "#DE6E48", "#AD6A8B", "#73539F", "#FF185D", "#57C27C", "#696C97", "#F7B6D2", "#DA707A", "#878787"]);

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
    var beginYear = parseDate(beginYearString);
    var endYear = parseDate(endYearString);

    // Ranges:
    //var x = d3.time.scale().range([0, w]);
    var x = d3.scale.ordinal().rangeRoundBands([0, w], 0);
    var y = d3.scale.linear().range([h, 0]);

    // Axes:
    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format("%Y")); // .ticks(10)
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(1);

    // Get the data
    d3.dsv(';')("data/GenreYearCounty.csv", function (error, data) {
        data.forEach(function (d) {
            d.Count = +d.Count;
            d.Rating = +d.AvgRating;
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
        data = data.filter(function (d) {
            return d.AvgRating != 0;
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
                g.values.forEach(function(m) { // for each country-entry
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
                Year: parseDate(d.key),
                MaxGenre: maxGenre,
                MaxGenreCount: maxGenreRating
            });
        });

        // Scale the range of the data
        //x.domain(d3.extent(data, function (d) { return parseDate(d.Year); }));
        x.domain(maxPerYear.map(function (d) {
            return d.Year;
        }));
        //x.domain([beginYear, endYear]);
        y.domain([0, 1]);

        // Add x and y axis to svg
        svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + h + ")")
                .call(xAxis);
        /* Uncomment to add y axis
         svg.append("g")
         .attr("class", "y axis")
         .call(yAxis);
         */

        // Add data to svg
        svg.selectAll("bar")
                .data(maxPerYear)
                .enter().append("rect")
                .style("fill", function (d) {
                    return color(d.MaxGenre);
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
                });
    });
}
