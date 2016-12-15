//Inspiration: https://jrue.github.io/coding/2014/exercises/basicbubblepackchart/

function genreBubbles(divID, w, h, beginYearString, endYearString, genreFilter, countryFilter) {
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


  data = filterData(genreYearCountryData, beginYearString, endYearString, genreFilter)
          .map(function(d){ d.value = +d["Count"]; return d;});

  // Chart setup
  var nodes = bubble.nodes({children: data}).filter(function(d) { return !d.children; });

  var bubbles = svg.append("g")
                  .attr("id", "bubbleList")
                  .attr("transform", "translate(0,0)")
                  .style({
                    "width": w,
                    "height": h,
                  })
                  .selectAll(".bubble")
                  .data(nodes)
                  .enter();

  bubbleIDs = [];
  // Create bubbles
  bubbles.append("svg")
      .attr("id", function(d){
        idText = "idBubble_" + d.Genre
        bubbleIDs.push(idText);
        return idText;
      })
      .attr("valueR", function(d){ return d.r; })
      .attr("valueX", function(d){ return d.x; })
      .attr("valueY", function(d){ return d.y; })
      .attr("valueScore", function(d){ return d.AverageRating * 10; })
      .attr("valueGenre", function(d){ return d.Genre; })


  setLiquidFillToBubbles(bubbleIDs)

/*
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
            */

}

function setLiquidFillToBubbles(svgList){
  var gaugeList = [];
  var configList = [];
  i= 0;
  svgList.forEach(function(d){ //d = id
      var genre = d.split("_")[1];
      configList[i] = liquidFillGaugeDefaultSettings();
      configList[i].circleColor = colors[genre];
      configList[i].textColor = "#000000";
      configList[i].waveTextColor = "#000000";
      configList[i].waveColor = colors[genre];
      gaugeList[i] = loadLiquidFillGauge(d, configList[i]);
      var node = d3.select(d).collide(0.5);



      /*
      var config1 = liquidFillGaugeDefaultSettings();
    config1.circleColor = "#FF7777";
    config1.textColor = "#FF4444";
    config1.waveTextColor = "#FFAAAA";
    config1.waveColor = "#FFDDDD";
    config1.circleThickness = 0.2;
    config1.textVertPosition = 0.2;
    config1.waveAnimateTime = 1000;
    var gauge2= loadLiquidFillGauge("fillgauge2", 28, config1); */
      i += 1;


  });
}

function filterData(data, beginYear, endYear, genreFilter) {
    data = filterYear(data, beginYear, endYear);
    data = filterGenre(data, genreFilter);

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

//source: http://bl.ocks.org/mbostock/1748247
function collide(alpha) {
  var quadtree = d3.geom.quadtree(nodes);
  return function(d) {
    var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
    quadtree.visit(function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d)) {
        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
        if (l < r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    });
  };
}
