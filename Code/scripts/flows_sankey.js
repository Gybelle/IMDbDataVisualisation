/*
 * @author: Michelle Gybels
 */

function createSankeyChart(){

  // Based on http://bl.ocks.org/d3noob/5015397
  var parentW = $("#sankeyChart").width();
  var parentH = 740;
  var units = "movies";

  var margin = {top: 10, right: 10, bottom: 10, left: 10},
      width = parentW - margin.left - margin.right,
      height = parentH - margin.top - margin.bottom;

  var formatNumber = d3.format(",.0f"),    // zero decimal places
      format = function(d) { return formatNumber(d) + " " + units; },
      color = d3.scale.category20();

  // append the svg canvas to the page
  var svg = d3.select("#sankeyChart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // Set the sankey diagram properties
  var sankey = d3.sankey()
      .nodeWidth(36)
      .nodePadding(10)
      .size([width, height]);

  var path = sankey.link();

  // load the data
  d3.json("data/flowData/flowData.json", function(error, graph) {
      var nodeMap = {};
      graph.nodes.forEach(function(x) { nodeMap[x.name] = x; });
      graph.links = graph.links.map(function(x) {
        return {
          source: nodeMap[x.source],
          target: nodeMap[x.target],
          value: x.value
        };
      });

    sankey
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(32);

  // add in the links
    var link = svg.append("g").selectAll(".link")
        .data(graph.links)
      .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .sort(function(a, b) { return b.dy - a.dy; });

  // add the link titles
    link.append("title")
          .text(function(d) {
      		return d.source.name + " → " +
                  d.target.name + ":\n" + format(d.value); });

  // add in the nodes
    var node = svg.append("g").selectAll(".node")
        .data(graph.nodes)
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
  		  return "translate(" + d.x + "," + d.y + ")"; })
      .call(d3.behavior.drag()
        .origin(function(d) { return d; })
        .on("dragstart", function() {
  		  this.parentNode.appendChild(this); })
        .on("drag", dragmove));

  // add the rectangles for the nodes
    node.append("rect")
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) {
            return d.color = colorsSankey[d.name];
  		      //return d.color = color(d.name.replace(/ .*/, ""));
          })
        .style("stroke", function(d) {
  		  return d3.rgb(d.color).darker(2); })
      .append("title")
        .text(function(d) {
  		  return d.name + "\n" + format(d.value); });

  // add in the title for the nodes
    node.append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name; })
      .filter(function(d) { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

  // the function for moving the nodes
    function dragmove(d) {
      d3.select(this).attr("transform",
          "translate(" + d.x + "," + (
                  d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
              ) + ")");
      sankey.relayout();
      link.attr("d", path);
    }
  }); //end load data

  // The Legend

  var categories = ["RunningTimes", "FilmingDays", "Budged", "Gross", "Rating"];
  var legend = d3.select("#sankeyChart").append('div').attr("class", "legend");
  categories.forEach(function(c) {
    categorie = legend.append('div');
    categorie.append('div').attr("class", "categories-marker")
          .style("background-color", colorsSankey[c]);
    categorie.append('p').text(sankeyCategories[c]);
  });
} // end createSankeyChart()
