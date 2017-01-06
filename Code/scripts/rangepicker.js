/*
 * @author: Michelle Gybels
 */

minVal = 0, maxVal = 0, fromVal = 0, toVal = 0;
var startDate;
var endDate;

function createRangePicker(divID, yearMin, yearMax) {
    //Set Ranges
    minVal = yearMin.getFullYear();
    maxVal = yearMax.getFullYear();
    fromVal = minVal + 50;
    toVal = maxVal - 50;
    startDate = parseDate(fromVal.toString());
    endDate = parseDate(toVal.toString());

    //Create Slider
    $(divID).ionRangeSlider({
        type: "double",
        grid: true,
        min: minVal,
        max: maxVal,
        from: fromVal,
        to: toVal,
        step: 1,
        prettify_enabled: false,
        grid_snap: false,
        onFinish: function (data) {
            countryFilter = null;
            startDate = parseDate(data.from.toString());
            endDate = parseDate(data.to.toString());
            //console.log(genreFilter);
            setFilterYear(startDate, endDate);
        }
    });
    $('body').mouseup(function (e) {
    }); // fix to make slider not stick to mouse pointer
}

function getYearRange() {
    return (fromVal, toVal);
}
