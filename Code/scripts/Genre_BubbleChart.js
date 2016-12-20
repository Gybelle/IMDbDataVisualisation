//Inspiration: https://jrue.github.io/coding/2014/exercises/basicbubblepackchart/

function genreBubbles(divID, w, h, inputdata) {
  var margin = {top: 6, right: 6, bottom: 6, left: 6};
  w = w - margin.left - margin.right;
  h = h - margin.top - margin.bottom;

  var diameter = w; //max size of the bubbles
  var bubble = d3.layout.pack().sort(null).size([diameter, diameter]).padding(1.5);

  var svg = d3.select(divID)
            .append('svg')
            .attr('width', w + margin.left + margin.right)
            .attr('height', h + margin.top + margin.bottom)
            .attr('class', 'genreBubble');


  data = groupDataBubbleChart(inputdata)
          .map(function(d){ d.value = +d["Count"]; return d;});

  // Chart setup
  var nodes = bubble.nodes({children: data}).filter(function(d) { return !d.children; });

  var bubbles = svg.append("g")
                  .attr("transform", "translate(0,0)")
                  .selectAll(".bubble")
                  .data(nodes)
                  .enter();

  // Create bubbles
  bubbles.append("circle")
      .attr("r", function(d){ return d.r; })
      .attr("cx", function(d){ return d.x; })
      .attr("cy", function(d){ return d.y; })
      .style("fill", function(d) {return colors[d.Genre];});


  // Format the text within each bubble
    bubbles.append("text")
            .attr("x", function(d){ return d.x; })
            .attr("y", function(d){ return d.y + 5; })
            .attr("text-anchor", "middle")
            .text(function(d){
              if(d.r > 20){
                return d.Genre;
              }
              return "";
            })
            .style({
                "fill":"white",
                "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
                "font-size": "12px",
            });

}

function groupDataBubbleChart(data) {
    //Group by genre
    var groupedData = d3.nest()
            .key(function (d){
              return d.Genre;
            })
           .entries(data);

    var dataPerGenre = [];
    groupedData.forEach(function(d){ //for each genre
      var totalRating = 0;
      var count = 0;
      d.values.forEach(function(g){ //for each entry
        totalRating += g.Count * g.Rating;
        count += g.Count;
      });
      var avg = totalRating / count;
      dataPerGenre.push({
        Genre: d.key,
        AverageRating: avg,
        Count: count
      });
    });

  return dataPerGenre;
}
