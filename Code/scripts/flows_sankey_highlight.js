/*
 * @author: Michelle Gybels
 */

var pathHighlighted = [];
var moviePath = [];
var query1Path = [];
var query2Path = [];
var query3Path = [];
var query4Path = [];
var query5Path = [];
var query6Path = [];
var query7Path = [];
var query8Path = [];
var query9Path = [];
var query10Path = [];
var arrow = " → ";
var classHighlight = "highlighted_link";

function highlightPathInSankey(){
  var links = getLinkObjects();
  removePreviousHighlight(links);

  for(i = 0; i < links.length; i++){
    var link = links[i];
    var text = $(link).text();
    var foundLink = false;

    for(j = 0; j < pathHighlighted.length && !foundLink; j++){
      path = pathHighlighted[j];
      if (text.indexOf(path) != -1){
        foundLink = true;
        $(link).addClass(classHighlight);
      }
    }
  }
}

function removePreviousHighlight(links){
   for(i = 0; i < links.length; i++){
     var link = links[i];
     $(link).removeClass(classHighlight);
   }
}


function getLinkObjects(){
  var links = [];

  $( ".link" ).each(function( index ) {
    links.push(this);
   });

   return links;
}

function setFlowChartFilterMenu(){
  pathHighlighted = [];
  $("#menu-toggle").click(function(e) {
      e.preventDefault();
      $("#wrapper").toggleClass("toggled");
  });

  // actions when searching a movie
  $("#movieSearch_sankey").focusout(function(){
    movie = $(this).val();
    $("#movieCheckbox").prop('checked', true);
    findMoviePath(movie);
    highlightPathInSankey();
  });

  $("#movieSearch_sankey").keypress(function (e) {
    if (e.which == 13) {
      movie = $(this).val();
      $("#movieCheckbox").prop('checked', true);
      findMoviePath(movie);
      highlightPathInSankey();
      return false;
    }
  });

  //Get all query paths
  query1Path = findQueryMoviePaths(mostPopularMoviePaths);
  query2Path = findQueryMoviePaths(leastPopularMoviePaths);
  query3Path = findQueryMoviePaths(shortestMoviePaths);
  query4Path = findQueryMoviePaths(longestMoviePaths);
  query5Path = findQueryMoviePaths(mostExpensiveMoviePaths);
  query6Path = findQueryMoviePaths(leastExpensiveMoviePaths);
  query7Path = findQueryMoviePaths(highestRevenueMoviePaths);
  query8Path = findQueryMoviePaths(lowestRevenueMoviePaths);
  query9Path = findQueryMoviePaths(mostCEMoviePaths);
  query10Path = findQueryMoviePaths(leastCEMoviePaths);


  // highlighting paths
  setCheckboxEvents();

  // Tooltips
  setQueryTooltips()
}

function setAllUnchecked(){
  $( ":checkbox" ).each(function(index ) {
    $(this).prop('checked', false);
  });
}

function setAllChecked(){
  $( ":checkbox" ).each(function(index ) {
    $(this).prop('checked', true);
  });
}

function setCheckboxEvents(){
  $("#allCheckbox").change(function() {
    if(this.checked) {
        activateAllQueries();
        setAllChecked();
    }
    else {
      deactivateAllQueries();
      setAllUnchecked();
    }
    highlightPathInSankey();
  });

  $("#movieCheckbox").change(function() {
    if(this.checked) {
        var movie = $("#movieSearch_sankey").val();
        findMoviePath(movie);
    }
    else {
      $("#allCheckbox").prop('checked', false);
      removeMoviePathsFromHighlightedPaths(moviePath);
    }
    highlightPathInSankey();
  });


  $("#q1Checkbox").change(function() {
    if(this.checked) {
      addMoviePathsToHighlightedPaths(query1Path);
    }
    else {
      $("#allCheckbox").prop('checked', false);
      removeMoviePathsFromHighlightedPaths(query1Path);
    }
    highlightPathInSankey();
  });

  $("#q2Checkbox").change(function() {
    if(this.checked) {
      addMoviePathsToHighlightedPaths(query2Path);
    }
    else {
      $("#allCheckbox").prop('checked', false);
      removeMoviePathsFromHighlightedPaths(query2Path);
    }
    highlightPathInSankey();
  });

  $("#q3Checkbox").change(function() {
    if(this.checked) {
      addMoviePathsToHighlightedPaths(query3Path);
    }
    else {
      $("#allCheckbox").prop('checked', false);
      removeMoviePathsFromHighlightedPaths(query3Path);
    }
    highlightPathInSankey();
  });

  $("#q4Checkbox").change(function() {
    if(this.checked) {
      addMoviePathsToHighlightedPaths(query4Path);
    }
    else {
      $("#allCheckbox").prop('checked', false);
      removeMoviePathsFromHighlightedPaths(query4Path);
    }
    highlightPathInSankey();
  });

  $("#q5Checkbox").change(function() {
    if(this.checked) {
      addMoviePathsToHighlightedPaths(query5Path);
    }
    else {
      $("#allCheckbox").prop('checked', false);
      removeMoviePathsFromHighlightedPaths(query5Path);
    }
    highlightPathInSankey();
  });

  $("#q6Checkbox").change(function() {
    if(this.checked) {
      addMoviePathsToHighlightedPaths(query6Path);
    }
    else {
      $("#allCheckbox").prop('checked', false);
      removeMoviePathsFromHighlightedPaths(query6Path);
    }
    highlightPathInSankey();
  });

  $("#q7Checkbox").change(function() {
    if(this.checked) {
      addMoviePathsToHighlightedPaths(query7Path);
    }
    else {
      $("#allCheckbox").prop('checked', false);
      removeMoviePathsFromHighlightedPaths(query7Path);
    }
    highlightPathInSankey();
  });

  $("#q8Checkbox").change(function() {
    if(this.checked) {
      addMoviePathsToHighlightedPaths(query8Path);
    }
    else {
      $("#allCheckbox").prop('checked', false);
      removeMoviePathsFromHighlightedPaths(query8Path);
    }
    highlightPathInSankey();
  });

  $("#q9Checkbox").change(function() {
    if(this.checked) {
      addMoviePathsToHighlightedPaths(query9Path);
    }
    else {
      $("#allCheckbox").prop('checked', false);
      removeMoviePathsFromHighlightedPaths(query9Path);
    }
    highlightPathInSankey();
  });

  $("#q10Checkbox").change(function() {
    if(this.checked) {
      addMoviePathsToHighlightedPaths(query10Path);
    }
    else {
      $("#allCheckbox").prop('checked', false);
      removeMoviePathsFromHighlightedPaths(query10Path);
    }
    highlightPathInSankey();
  });


}

function setQueryTooltips(){
  $(".checkboxLabel").mouseover(function() {
                        setTooltipField($(this).find('input:checkbox:first').val());
                      })
                   .mouseout(function() {
                        $("#checkBoxInformationText").text("");
                      });
}
function setTooltipField(checkboxValue){
  $("#checkBoxInformationText").text(queryTooltips[checkboxValue]);
}

function activateAllQueries(){
  var movie = $("#movieSearch_sankey").val();
  findMoviePath(movie);
  addMoviePathsToHighlightedPaths(query1Path);
  addMoviePathsToHighlightedPaths(query2Path);
  addMoviePathsToHighlightedPaths(query3Path);
  addMoviePathsToHighlightedPaths(query4Path);
  addMoviePathsToHighlightedPaths(query5Path);
  addMoviePathsToHighlightedPaths(query6Path);
  addMoviePathsToHighlightedPaths(query7Path);
  addMoviePathsToHighlightedPaths(query8Path);
  addMoviePathsToHighlightedPaths(query9Path);
  addMoviePathsToHighlightedPaths(query10Path);
}

function deactivateAllQueries(){
  pathHighlighted = [];
}

function findMoviePath(movie){
  path = moviePaths[movie]
  if (path === undefined){
    //console.log(movie + " not found.");
  } else {
    addMovieToMoviePath(path);
    addMoviePathsToHighlightedPaths(moviePath);
  }
}

function addMovieToMoviePath(path){
  path = path.replace(/#/g , arrow);
  moviePath = path.split("*");
}


function addMoviePathsToHighlightedPaths(paths){
  for(i = 0; i < paths.length; i++){
    path = paths[i];
    pathHighlighted.push(path);
  }
}

function addPathsToHighlightedPaths(pathsDict){
  paths = Object.keys(pathsDict);
  for(i = 0; i < Object.keys(paths).length; i++){
    movie = paths[i];
    pathsMovie = pathsDict[movie].replace(/#/g , arrow).split("*");
    for(j = 0; j < pathsMovie.length; j++) {
      path = pathsMovie[j];
      pathHighlighted.push(path);
    }
  }
}

function removeMoviePathsFromHighlightedPaths(paths){
  for(i=0; i < paths.length; i++){
    path = paths[i];
    pathHighlighted.splice( pathHighlighted.indexOf(path), 1 );
  }
}

function removePathsFromHighlightedPaths(paths){
  paths = Object.keys(pathsDict);
  for(i = 0; i < Object.keys(paths).length; i++){
    movie = paths[i];
    pathsMovie = pathsDict[movie].replace(/#/g , arrow).split("*");
    for(j = 0; j < pathsMovie.length; j++) {
      path = pathsMovie[j];
      pathHighlighted.splice( pathHighlighted.indexOf(path), 1 );
    }
  }
}

function getMovieFlowDatalist(objectID){
  movieKeys = Object.keys(moviePaths);
  $("#"+objectID).attr("data-list", movieKeys);
}


function findQueryMoviePaths(pathsDict){
  result = [];
  paths = Object.keys(pathsDict);
  for(i = 0; i < Object.keys(paths).length; i++){
    movie = paths[i];
    pathsMovie = pathsDict[movie].replace(/#/g , arrow).split("*");
    for(j = 0; j < pathsMovie.length; j++) {
      path = pathsMovie[j];
      if (result.indexOf(path) == -1){
        result.push(path);
      }
    }
  }
  return result;
}
