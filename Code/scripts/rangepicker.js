minVal = 0, maxVal = 0, fromVal = 0, toVal = 0;

function createRangePicker(divID, idLineChart, idBarChart, idMap, idBubbleChart){
  d3.dsv(';')("data/GenreYearCounty.csv", function (error, data) {
    var min = 4000;
    var max = 0;
    data.forEach(function (d) {
        d.Year = +d.Year;
        if(d.Year < min){
          min = d.Year;
        }
        if(d.Year > max){
          max = d.Year;
        }
    });

    //Set Ranges
    minVal = min;
    maxVal = max;
    fromVal = minVal + 50;
    toVal = maxVal - 50;

    //Create Slider
    $(divID).ionRangeSlider({
      type: "double",
      grid: true,
      min: minVal,
      max: maxVal,
      from: fromVal,
      to: toVal,
      step: 5,
      prettify_enabled: false,
      grid_snap: false,
      onFinish: function (data) {
        //genreFilter = ["Comedy", "Action", "Animation", "Fantasy", "Western"]; // null
        genreFilter = null;
        countryFilter = null;

        //Remover children from previous charts...
        var nodeBubbleChart = document.getElementById(idBubbleChart);
        while(nodeBubbleChart.firstChild){
          nodeBubbleChart.removeChild(nodeBubbleChart.firstChild);
        }
        var nodeLineChart = document.getElementById(idLineChart);
        while(nodeLineChart.firstChild){
          nodeLineChart.removeChild(nodeLineChart.firstChild);
        }
        var nodeBarChart = document.getElementById(idBarChart);
        while(nodeBarChart.firstChild){
          nodeBarChart.removeChild(nodeBarChart.firstChild);
        }
        var nodeMapChart = document.getElementById(idMap);
        //clearMapLayers();

        //Set width of charts
          //bar- and linechart:
        heightSmallRow = nodeLineChart.offsetHeight;
        widthSmallChart = document.getElementById("colLineChart").offsetWidth;
        $(".chart").css('width', widthSmallChart);
          //bubblechart:
        heightNavbar = document.getElementById("menubar").offsetHeight;
        heightSlider = document.getElementById("yearSlider").offsetHeight;
        heightLargeRow = $(document).height() - heightNavbar - heightSlider - heightSmallRow;
        widthSmallLargeChart = document.getElementById("colBubbleChart").offsetWidth;
        $(".small_large_chart").css('width', widthSmallLargeChart);
        // mapchart
        widthLargeChart = document.getElementById("colGenreMap").offsetWidth;
        $(".large_chart").css('width', widthLargeChart);
        $(".large_chart").css('height', heightLargeRow);

        //Create new charts
        genreProductionRate("#"+idLineChart, widthSmallChart, heightSmallRow, data.from.toString(), data.to.toString(), genreFilter, countryFilter);
        genreProductionMax("#"+idBarChart, widthSmallChart, heightSmallRow, data.from.toString(), data.to.toString(), genreFilter, countryFilter);
        genreProductionMap(idMap, widthLargeChart, heightLargeRow, data.from.toString(), data.to.toString(), genreFilter);
        genreBubbles("#"+idBubbleChart, widthSmallLargeChart, heightLargeRow, data.from.toString(), data.to.toString(), genreFilter, countryFilter);
      }
    });

    //on change
    /*
    $(divID).on("finish", function(){
      var $this = $(this),
        from = $this.data("from"),
        to = $this.data("to");

      console.log(from + " - " + to);
    });*/

  });
}

function getYearRange(){
  return (fromVal, toVal);
}
