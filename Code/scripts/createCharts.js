/*
 * @author: Anaïs Ools
 */

genreYearCountryData = [];
genreYearCountryData_filtered = [];
genreYearCountryData_filteredByCountry = [];
yearMin = 0;
yearMax = 0;
divIDRangePicker = null;
divIDLineChart = null;
divIDBarChart = null;
divIDMap = null;
divIDBubbleChart = null;
parseDate = d3.time.format("%Y").parse;
map = null;
widthSmallChart = 0;
heightSmallRow = 0;
widthSmallLargeChart = 0;
heightLargeRow = 0;

// Filters
currentFilter_beginYear = null;
currentFilter_endYear = null;
currentFilter_genreFilter = null;
currentFilter_countryFilter = null;

/*
 * HOW TO USE:
 *
 * Call initialiseCharts() to initialise.
 * Afterwards, use update(beginYear, endYear, genreFilter, countryFilter) to recalculate the charts.
 */

// CREATE ----------------------------------------------------------------------

function initialiseCharts(idRangePicker, idLineChart, idBarChart, idMap, idBubbleChart) {
    divIDRangePicker = idRangePicker;
    divIDLineChart = idLineChart;
    divIDBarChart = idBarChart;
    divIDMap = idMap;
    divIDBubbleChart = idBubbleChart;

    d3.dsv(';')("data/GenreYearCountry.csv", function (error, data) {
        // reading data
        data.forEach(function (d) {
            d.Year = parseDate(d.Year);
            d.Count = +d.Count;
            d.Rating = +d.AvgRating;
            if (d.Year < yearMin) {
                yearMin = d.Year;
            }
            if (d.Year > yearMax) {
                yearMax = d.Year;
            }
        });
        genreYearCountryData = data;

        fromVal = yearMin + 50;
        toVal = yearMax - 50;

        createCharts();
    });
}

function createCharts() {
    setChartLayout();
    map = createGenreProductionMap(divIDMap);
    createRangePicker("#" + divIDRangePicker, yearMin, yearMax);
}

// UPDATE ----------------------------------------------------------------------

function updateView(beginYear, endYear, genreFilter, countryFilter) {
    if (genreFilter != null && genreFilter.length == 0) {
        genreFilter = null;
    }

    filterData(beginYear, endYear, genreFilter, countryFilter);
    if (genreYearCountryData_filteredByCountry.length == 0) {
        return;
    }

    setChartLayout();

    updateMap(map, genreYearCountryData_filteredByCountry);

    var nodeLineChart = document.getElementById(divIDLineChart);
    while (nodeLineChart.firstChild) {
        nodeLineChart.removeChild(nodeLineChart.firstChild);
    }
    var nodeBarChart = document.getElementById(divIDBarChart);
    while (nodeBarChart.firstChild) {
        nodeBarChart.removeChild(nodeBarChart.firstChild);
    }
    var nodeBubbleChart = document.getElementById(divIDBubbleChart);
    while (nodeBubbleChart.firstChild) {
        nodeBubbleChart.removeChild(nodeBubbleChart.firstChild);
    }
    genreProductionMax("#" + divIDBarChart, widthSmallChart, heightSmallRow, genreYearCountryData_filteredByCountry);
    genreProductionRate("#" + divIDLineChart, widthSmallChart, heightSmallRow, genreYearCountryData_filteredByCountry);
    genreBubbles("#" + divIDBubbleChart, widthSmallLargeChart, heightLargeRow, genreYearCountryData_filteredByCountry);
}

function setFilterYear(beginYear, endYear) {
    currentFilter_beginYear = beginYear;
    currentFilter_endYear = endYear;
    updateView(beginYear, endYear, currentFilter_genreFilter, currentFilter_countryFilter);
}

function setFilterGenre(genreFilter) {
    currentFilter_genreFilter = genreFilter;
    updateView(currentFilter_beginYear, currentFilter_endYear, genreFilter, currentFilter_countryFilter);
}

function setFilterCountry(countryFilter) {
    currentFilter_countryFilter = countryFilter;
    updateView(currentFilter_beginYear, currentFilter_endYear, currentFilter_genreFilter, countryFilter);
}

function setChartLayout() {
    //Set width of charts
    //bar- and linechart:
    heightSmallRow = document.getElementById(divIDLineChart).offsetHeight;
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
    $("#chartInfo").css('top', heightLargeRow - 39);
}

// FILTER ----------------------------------------------------------------------

function filterData(beginYear, endYear, genreFilter, countryFilter) {
    genreYearCountryData_filtered = filterYear(genreYearCountryData, beginYear, endYear);
    genreYearCountryData_filtered = filterGenre(genreYearCountryData_filtered, genreFilter);
    genreYearCountryData_filteredByCountry = filterCountry(genreYearCountryData_filtered, countryFilter);
}

function sortByYear(data) {
    data.sort(function (a, b) {
        return d3.ascending(a.Year, b.Year);
    });
    return data;
}

function filterYear(data, beginYear, endYear) {
    return data.filter(function (d) {
        return d.Year >= beginYear && d.Year <= endYear;
    });
}

function filterGenre(data, genreFilter) {
    if (genreFilter != null) {
        return data.filter(function (d) {
            return genreFilter.indexOf(d.Genre) >= 0;
        });
    }
    return data;
}

function filterCountry(data, countryFilter) {
    if (countryFilter != null) {
        return data.filter(function (d) {
            return d.Country == countryFilter;
        });
    }
    return data;
}