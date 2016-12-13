var minVal, maxVal, fromVal, toVal;

function createRangePicker(divID, initMin, initMax){
  minVal = initMin;
  maxVal = initMax;
  fromVal = minVal + 50;
  toVal = maxVal - 50;

  $(divID).ionRangeSlider({
    type: "double",
    grid: true,
    min: minVal,
    max: maxVal,
    from: fromVal,
    to: toVal,
    step: 5,
    prettify_enabled: false,
    grid_snap: true
  });
}
