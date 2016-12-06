function genreProductionRate(divID, w, h){
  //Define color scale
  var color =  d3.scale.category20()

  var svg = d3.select(divID)
    .append('svg').attr('width', w).attr('height', h)
    .append('g').attr('transform', 'translate(' + (w / 2) +  ',' + (h / 2) + ')');

  var parseTime = d3.time.format("%d %m %Y").parse;

  //Ranges:
  var x = d3.time.scale().range([0, w]);
  var y = d3.scale.linear().range([h, 0]);

  //Axes:
  var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(1);
  var yAxis = d3.svg.axis().scale(y).orient("left").ticks(1);

  //Define the line
  var countLine = d3.svg.line()
    .x(function(d) {
      return x(d.year);
    })
    .y(function(d) {
      return y(d.count);
    })





}
