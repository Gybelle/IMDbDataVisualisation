var numKeywordBubbles = 15;

function seriesBubbles(episodes) {
    var data = processSeriesBubbleChartData(episodes);
    if (data.length == 0) {
        d3.select("#keywordBubbles").select("svg").remove();
        d3.select("#keywordBubblesLarge").select("svg").remove();
        return;
    }
    createBubbleChart(data, "#keywordBubbles", widthBubbles, heightSmallRow);
    createBubbleChart(data, "#keywordBubblesLarge", 500, 490);
}

function createBubbleChart(data, divID, w, h) {
    var margin = {top: 3, right: 3, bottom: 3, left: 3};
    w = w - margin.left - margin.right;
    h = h - margin.top - margin.bottom;
    var diameter = h; //max size of the bubbles
    var bubble = d3.layout.pack().size([w, h]).padding(2.5).sort(null);
    var color = d3.scale.ordinal()
            .range(["FF7F0E", "#6599C0", "#F0CC76", "#64BD91", "#F59A6E", "#AFD572", "#E2D35C", "#D84E67", "#7073A0", "#58B16F", "#A2C5A5", "#C25D7F", "#FCD450", "#FF183C", "#2AB1CF", "#348B85", "#70C256", "#72CAFA", "#3A5DA1", "#4EA6AA", "#916589", "#C25D7F", "#4EE69B", "#D6AA51", "#DE6E48", "#AD6A8B", "#73539F", "#FF185D", "#57C27C", "#696C97", "#F7B6D2", "#DA707A", "#878787"]);

    d3.select(divID).select("svg").remove();
    var svg = d3.select(divID)
            .append('svg')
            .attr('width', w + margin.left + margin.right)
            .attr('height', h + margin.top + margin.bottom)
            .attr('class', 'genreBubble');

    // Chart setup
    var nodes = bubble.nodes({children: data}).filter(function (d) {
        return !d.children;
    });

    // Create bubbles   
    var bubbles = svg.append("g")
            .attr("transform", "translate(0,0)")
            .selectAll(".bubble")
            .data(nodes);
    bubbles.enter()
            .append("circle")
            .attr("r", function (d) {
                return 0;
            })
            .attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            })
            .style("fill", function (d) {
                return color(d.key);
            });
    bubbles.transition().duration(2000).delay(700).attr('r', function (d) {
        return d.r;
    });

    // Format the text within each bubble
    var text = bubbles.enter().append("text")
            .attr("x", function (d) {
                return d.x;
            })
            .attr("y", function (d) {
                return d.y + 3;
            })
            .attr("dy", "0em")
            .attr("text-anchor", "middle")
            .text(function (d) {
                if (d.r > 15) {
                    return d.key;
                }
                return "";
            })
            .call(wrap, 0)
            .style({
                "fill": "black",
                "font-family": "Helvetica Neue, Helvetica, Arial, sans-serif",
                "font-weight": "bold",
                "font-size": "11px"
            });
    text.attr("fill-opacity", 0).transition().duration(3000).delay(700).attr("fill-opacity", 1);
}

function processSeriesBubbleChartData(episodeData) {
    var keywords = {};
    episodeData.forEach(function (episode) {
        episode.Keywords.split("*").forEach(function (keyword) {
            if (keyword != "") {
                if (!keywords[keyword]) {
                    keywords[keyword] = 0;
                }
                keywords[keyword]++;
            }
        });
    });
    var filtered = Object.keys(keywords).reduce(function (filtered, key) {
        if (keywords[key] > 1)
            filtered[key] = keywords[key];
        return filtered;
    }, {});
    var list = [];
    for (var element in filtered) {
        list.push({key: element, value: filtered[element]});
    }
    if (list.length > numKeywordBubbles) {
        list = list.slice(0, numKeywordBubbles);
    }
    return list;
}

function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this);
        var words = text.text().split("-").reverse();
        if (text.text() != "" && words.length > 1) {
            var word, line = [], lineNumber = 0, lineHeight = 1;
            var x = text[0][0].x.baseVal[0].value;
            var y = text[0][0].y.baseVal[0].value - ((words.length + 1) * 4) + 3;
            var dy = parseFloat(text[0][0].dy.baseVal[0].value);
            var tspan = text.text(null);//.append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", lineNumber++ * lineHeight + dy + "em").text(word);
                }
            }
        }
    });
}
