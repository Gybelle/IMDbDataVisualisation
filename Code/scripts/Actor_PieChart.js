var unfilteredData = null;
var filteredData = null;
var divID = null;

function createActorPieChart(divId, data) {
    divID = divId;
    if (data == null) {
        data = [
            {language: 'No data', count: 0}
        ];
    }
    unfilteredData = data;
    filteredData = null;
    drawChart(unfilteredData);
}

function drawChart(data) {
    var width = widthSmallLargeChart;
    var height = heightSmallRow;
    var radius = Math.min(width, height) / 2;
    var donutWidth = 40;

    var color = d3.scale.ordinal()
            .range(["FF7F0E", "#6599C0", "#F0CC76", "#64BD91", "#F59A6E", "#AFD572", "#E2D35C", "#D84E67", "#7073A0", "#58B16F", "#A2C5A5", "#C25D7F", "#FCD450", "#FF183C", "#2AB1CF", "#348B85", "#70C256", "#72CAFA", "#3A5DA1", "#4EA6AA", "#916589", "#C25D7F", "#4EE69B", "#D6AA51", "#DE6E48", "#AD6A8B", "#73539F", "#FF185D", "#57C27C", "#696C97", "#F7B6D2", "#DA707A", "#878787"]);

    var arc = d3.svg.arc()
            .innerRadius(radius - donutWidth)
            .outerRadius(radius);

    var labelArc = d3.svg.arc()
            .outerRadius(radius - 20)
            .innerRadius(radius - 20);

    var pie = d3.layout.pie()
            .value(function (d) {
                return d.count;
            });

    d3.select("svg").remove();
    var svg = d3.select(divID).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var g = svg.selectAll(".arc")
            .data(pie(data)).enter()
            .append("g").attr("class", "arc");

    var path = g.append("path")
            .attr("d", arc)
            .style("fill", function (d) {
                return color(d.data.language);
            })
            .attr("class", "slice");

    var text = g.append("text")
            .attr("transform", function (d) {
                return "translate(" + labelArc.centroid(d) + ")";
            })
            .attr("dy", ".35em")
            .text(function (d) {
                if (d.data.count != 0) {
                    return d.data.count;
                }
                return;
            });

    addMouseOver(svg);

    /* The Legend */
    createLegend(data, svg, color);
}

function addMouseOver(svg) {
    var slice = svg.selectAll("path.slice");
    slice.on("mousemove", function (d) {
        if (d.data.count == 1) {
            $("#languageInfo").html(d.data.language + ": " + d.data.count + " movie");
        } else {
            $("#languageInfo").html(d.data.language + ": " + d.data.count + " movies");
        }
    });
    slice.on("mouseout", function (d) {
        $("#languageInfo").html("");
    });
}

function createLegend(data, svg, color) {
    var legendRectSize = 12;
    var legendSpacing = 4;
    var topDataColors = getTopData(data);

    var legend = svg.selectAll('.legend').remove()
            .data(topDataColors).enter()
            .append('g').attr('class', 'legend')
            .attr('transform', function (d, i) {
                var height = legendRectSize + legendSpacing;
                var offset = height * topDataColors.length / 2;
                var horz = -2 * legendRectSize;
                var vert = i * height - offset;
                return 'translate(' + horz + ',' + vert + ')';
            });

    legend.append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .style('fill', color)
            .style('stroke', color);

    legend.append('text')
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .text(function (d) {
                return d;
            });
}

function getTopData(data) {
    var topSize = 5;
    if (data.length > topSize) {
        data = data.sort(function (x, y) {
            return d3.descending(x.count, y.count);
        });
        data = data.slice(0, topSize);
    }
    var result = [];
    data.forEach(function (element) {
        result.push(element.language);
    });
    return result;
}
