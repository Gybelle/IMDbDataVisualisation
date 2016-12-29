var pie = null;
var arc = null;
var path = null;
var color = null;
var svg = null;
var text = null;
var tooltip = null;

function createActorPieChart(divID, data) {
    if (data == null) {
        data = [
            {language: 'No data', count: 0}
        ];
    }

    var width = widthSmallLargeChart;
    var height = heightSmallRow;
    var radius = Math.min(width, height) / 2;
    var donutWidth = 65;

    color = d3.scale.ordinal()
            .range(["#6599C0", "#F0CC76", "#64BD91", "#F59A6E", "#AFD572", "#FF7F0E", "#E2D35C", "#D84E67", "#7073A0", "#58B16F", "#A2C5A5", "#C25D7F", "#FCD450", "#FF183C", "#2AB1CF", "#348B85", "#70C256", "#72CAFA", "#3A5DA1", "#4EA6AA", "#916589", "#C25D7F", "#4EE69B", "#D6AA51", "#DE6E48", "#AD6A8B", "#73539F", "#FF185D", "#57C27C", "#696C97", "#F7B6D2", "#DA707A", "#878787"]);

    arc = d3.svg.arc()
            .innerRadius(radius - donutWidth)
            .outerRadius(radius);

    var labelArc = d3.svg.arc()
            .outerRadius(radius - 20)
            .innerRadius(radius - 20);

    pie = d3.layout.pie()
            .value(function (d) {
                return d.count;
            });

    d3.select("svg").remove();
    svg = d3.select(divID).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var g = svg.selectAll(".arc")
            .data(pie(data)).enter()
            .append("g").attr("class", "arc");

    path = g.append("path")
            .attr("d", arc)
            .style("fill", function (d) {
                return color(d.data.language);
            })
            .attr("class", "slice");

    text = g.append("text")
            .attr("transform", function (d) {
                return "translate(" + labelArc.centroid(d) + ")";
            })
            .attr("dy", ".35em")
            .text(function (d) {
                return d.data.count;
            });

    addMouseOver(data);

    /* The Legend */
    //createLegend();
}

function addMouseOver(data) {
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

function createLegend() {
    var legendRectSize = 8;
    var legendSpacing = 3;

    var legend = svg.selectAll('.legend').remove()
            .data(color.domain()).enter()
            .append('g').attr('class', 'legend')
            .attr('transform', function (d, i) {
                var height = legendRectSize + legendSpacing;
                var offset = height * color.domain().length / 2;
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

function updateActorPieChart(newData) {
    console.log(newData);

    var tmpData = [
        {language: 'English', count: 20},
        {language: 'Swedish', count: 15},
        {language: 'Something', count: 2},
        {language: 'Something else', count: 2}
    ];

//    pie.value(function (d) {
//        return d.count;
//    });
//    path = path.data(pie);
//    path.attr("d", arc);


    path = path.data(pie(tmpData));
    path.attr("d", arc)
            .style("fill", function (d) {
                return color(d.data.language);
            });
    ;
    text = text.text(function (d) {
        return d.data.count;
    });
    //path.transition().duration(750).attrTween("d", arcTween);
    createLegend();
}
