minVal = 0, maxVal = 0, fromVal = 0, toVal = 0;

function createRangePicker(divID, yearMin, yearMax) {
    //Set Ranges
    minVal = yearMin.getFullYear();
    maxVal = yearMax.getFullYear();
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
            startDate = parseDate(data.from.toString());
            endDate = parseDate(data.to.toString());
            updateView(startDate, endDate, genreFilter, countryFilter);
        }
    });
    $('body').mouseup(function(e){}); // fix to make slider not stick to mouse pointer
}

function getYearRange() {
    return (fromVal, toVal);
}
