/*
 * @author: Anaïs Ools, Michelle Gybels
 */

var modalH = 500 - 10;
var modalW = 500;
var legendSizeSmall = 5;
var legendSizeLarge = 20;
var donutWidthSmall = 30;
var donutWidthLarge = 50;

function createActorPieChart(divID, movies) {
    var data = [];
    if (movies == null || movies.length == 0) {
        data = [
            {language: 'No data', count: 0}
        ];
    } else {
        var languageMap = {};
        movies.forEach(function (movie) {
            movie.languages.forEach(function (language) {
                if (language != "" && language != "None") {
                    if (!languageMap[language]) {
                        languageMap[language] = 0;
                    }
                    languageMap[language]++;
                }
            });
        });
        for (var language in languageMap) {
            data.push({language: language, count: languageMap[language]});
        }
    }
    data.sort(function (x, y) {
        return d3.descending(x.count, y.count);
    });
    var smallChartH = heightSmallRow - 10;
    var smallChartW = document.getElementById("languageChart").offsetWidth - 50;

    drawPieChart("#languageChartLarge", data, "#languageInfoLarge", "languageChartLarge", modalH, modalW, legendSizeLarge, donutWidthLarge);
    drawPieChart(divID, data, "#languageInfo", "languageChart", smallChartH, smallChartW, legendSizeSmall, donutWidthSmall);
}

function createMoviePieChart(divID, actors) {
    var data = [];
    if (actors == null || actors.length == 0) {
        data = [
            {language: 'No data', count: 0}
        ];
    } else {
        var nationalityMap = {};
        actors.forEach(function (actor) {
            if (actor.birthLocation != "") {
                var nationality = getCountry(actor.birthLocation);
                if (!nationalityMap[nationality]) {
                    nationalityMap[nationality] = 0;
                }
                nationalityMap[nationality]++;
            }
        });
        for (var nationality in nationalityMap) {
            data.push({language: nationality, count: nationalityMap[nationality]});
        }
    }
    data.sort(function (x, y) {
        return d3.descending(x.count, y.count);
    });
    var smallChartH = heightSmallRow - 10;
    var smallChartW = document.getElementById("languageChart").offsetWidth - 50;

    drawPieChart("#languageChartLarge", data, "#languageInfoLarge", "languageChartLarge", modalH, modalW, legendSizeLarge, donutWidthLarge);
    drawPieChart(divID, data, "#languageInfo", "languageChart", smallChartH, smallChartW, legendSizeSmall, donutWidthSmall);

}

function drawPieChart(divID, data, divIDinfo, divIDLangChart, h, w, sizeLegend, donutWidth) {
    $(divIDinfo).html("");
    var width = w;
    var height = h;
    var radius = (Math.min(width, height) / 2) - 5;

    var color = d3.scale.ordinal()
            .range(["FF7F0E", "#6599C0", "#F0CC76", "#64BD91", "#F59A6E", "#AFD572", "#E2D35C", "#D84E67", "#7073A0", "#58B16F", "#A2C5A5", "#C25D7F", "#FCD450", "#FF183C", "#2AB1CF", "#348B85", "#70C256", "#72CAFA", "#3A5DA1", "#4EA6AA", "#916589", "#C25D7F", "#4EE69B", "#D6AA51", "#DE6E48", "#AD6A8B", "#73539F", "#FF185D", "#57C27C", "#696C97", "#F7B6D2", "#DA707A", "#878787"]);

    var arc = d3.svg.arc()
            .innerRadius(radius - donutWidth)
            .outerRadius(radius);
    var arcOver = d3.svg.arc()
            .innerRadius(radius - donutWidth + 8)
            .outerRadius(radius + 5);

    var labelArc = d3.svg.arc()
            .outerRadius(radius - 15)
            .innerRadius(radius - 15);

    var pie = d3.layout.pie()
            .value(function (d) {
                return d.count;
            });

    d3.select(divID).select("svg").remove();
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

    // highlight an already selected language
    d3.selectAll("path.slice").forEach(function (slices) {
        slices.forEach(function (slice) {
            var language = slice.__data__.data.language;
            if (language == languageFilter) {
                slice.id = "selectedLanguage";
                d3.select(divID).selectAll("#selectedLanguage").attr("class", "slice selected").transition().attr("d", arcOver);
                slice.id = "";
            }
        });
    });

    addMouseOver(svg, path, arc, arcOver, divIDinfo);

    /* The Legend */
    createLegend(data, svg, color, sizeLegend);
}

function addMouseOver(svg, path, arc, arcOver, divIDinfo) {
    var slice = svg.selectAll("path.slice");
    slice.on("mouseover", function (d) {
        if (selectedActor != null) {
            if (d.data.count == 1) {
                $(divIDinfo).html(d.data.language + ": " + d.data.count + " movie");
            } else {
                $(divIDinfo).html(d.data.language + ": " + d.data.count + " movies");
            }
        }
        else if (selectedMovie != null) {
            if (d.data.count == 1) {
                $(divIDinfo).html(d.data.language + ": " + d.data.count + " actor");
            } else {
                $(divIDinfo).html(d.data.language + ": " + d.data.count + " actors");
            }
        }
    });
    slice.on("mouseleave", function (d) {
        $(divIDinfo).html("");
    });
    path.on("click", function (d) {
        var clicked = d3.select(this);
        if (clicked.classed("selected")) { // unselect
            clicked.transition().attr("d", arc);
            clicked.attr("class", "slice");
            filterLanguage(null);
        } else { // select
            d3.selectAll(".slice").attr("class", "slice").transition().attr("d", arc);
            clicked.transition().duration(800).attr("d", arcOver);
            clicked.attr("class", "slice selected");
            filterLanguage(d.data.language);
        }
    });
}

function createLegend(data, svg, color, sizeLegend) {
    var legendRectSize = 12;
    var legendSpacing = 4;
    var topDataColors = getTopData(data, sizeLegend);

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

function getTopData(data, sizeLegend) {
    var topSize = sizeLegend;
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
