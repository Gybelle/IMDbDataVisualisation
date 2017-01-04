var pathHighlighted = [];
var moviePath = []
var query1Path = []
var query2Path = []
var query3Path = []
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


  // highlighting paths
  setCheckboxEvents();
}

function setCheckboxEvents(){
  $("#movieCheckbox").change(function() {
    if(this.checked) {
        var movie = $("#movieSearch_sankey").val();
        findMoviePath(movie);
    }
    else {
      removeMoviePathsFromHighlightedPaths(moviePath);
    }
    highlightPathInSankey();
  });


  $("#q1Checkbox").change(function() {
    if(this.checked) {
      addMoviePathsToHighlightedPaths(query1Path);
    }
    else {
      removeMoviePathsFromHighlightedPaths(query1Path);
    }
    highlightPathInSankey();
  });

  $("#q2Checkbox").change(function() {
    if(this.checked) {
      addMoviePathsToHighlightedPaths(query2Path);
    }
    else {
      removeMoviePathsFromHighlightedPaths(query2Path);
    }
    highlightPathInSankey();
  });

  $("#q3Checkbox").change(function() {
    if(this.checked) {
      addMoviePathsToHighlightedPaths(query3Path);
    }
    else {
      removeMoviePathsFromHighlightedPaths(query3Path);
    }
    highlightPathInSankey();
  });

  $("#q4Checkbox").change(function() {
    if(this.checked) {
      addMoviePathsToHighlightedPaths(query4Path);
    }
    else {
      removeMoviePathsFromHighlightedPaths(query4Path);
    }
    highlightPathInSankey();
  });

}

function findMoviePath(movie){
  path = moviePaths[movie]
  if (path === undefined){
    console.log(movie + " not found.");
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
