function createDonutChartExternalDataTest(divID){
  //Dimensions of chart
  var width = 360;
  var height = 360;
  var radius = Math.min(width, height) / 2;
  var donutWidth = 75;

  //Define color scale
  var color =  d3.scale.category20()
  // Alternative:
  //var color = d3.scaleOrdinal()
    //.range(['#A60F2B', '#648C85', '#B3F2C9', '#528C18', '#C3F25C']);

  var svg = d3.select('divID')
    .append('svg').attr('width', width).attr('height', height)
    .append('g').attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')');

  /* The Pie chart */
  //Determine the size of overall chart
  var arc = d3.svg.arc()
    .innerRadius(radius - donutWidth)
    .outerRadius(radius);
  //start and end angles of each segment
  var pie = d3.layout.pie()
    .value(function(d){
      return d.count;
    }).sort(null)		//disable sorting

    d3.dsv(';')('data.csv', function(error, dataset) {
      dataset.forEach(function(d) {
           d.count = +d.count;
           console.log(d.count)
    });

      //final step creating the chart:
      var path = svg.selectAll('path')
        .data(pie(dataset)).enter()
        .append('path').attr('d', arc).attr('fill', function(d){
          return color(d.data.label)
        });

      /* The Legend */
      // Once upon a time in the far west...
      var legendRectSize = 18;
      var legendSpacing = 4;

      var legend = svg.selectAll('.legend')
        .data(color.domain()).enter()
        .append('g').attr('class', 'legend').attr('transform', function(d, i){
          var height = legendRectSize + legendSpacing;
          var offset =  height * color.domain().length / 2;
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
          .text(function(d) { return d; });
      }); //end d3.csv
}
