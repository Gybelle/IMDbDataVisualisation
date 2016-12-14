minVal = 0, maxVal = 0, fromVal = 0, toVal = 0;

function createRangePicker(divID, idLineChart, idBarChart){
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
        //width = 700;
        width = document.getElementById("colLineChart").offsetWidth;
        height = 300;

        genreFilter = ["Comedy", "Action", "Animation", "Fantasy", "Western"]; // null
        countryFilter = null;

        //Remover children from previous charts...
        var nodeLineChart = document.getElementById(idLineChart);
        height = document.getElementById("colLineChart").offsetHeight;
        while(nodeLineChart.firstChild){
          nodeLineChart.removeChild(nodeLineChart.firstChild);
        }
        var nodeBarChart = document.getElementById(idBarChart);
        while(nodeBarChart.firstChild){
          nodeBarChart.removeChild(nodeBarChart.firstChild);
        }

        //Set width of chart
        $(".chart").css('width',width);

        //Create new charts
        genreProductionRate("#"+idLineChart, width, height, data.from.toString(), data.to.toString(), genreFilter, countryFilter);
        genreProductionMax("#"+idBarChart, width, height, data.from.toString(), data.to.toString(), genreFilter, countryFilter);
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
