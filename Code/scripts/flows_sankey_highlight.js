var pathHighlighted = ["2 hours → Two months", "Two months → [1M-5M["];
var moviePath = []
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
  pathHighlighted = ["test", "llala"];
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
      return false;    //<---- Add this line
    }
  });

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
      removePathsToHighlightedPaths(moviePath);
      moviePath = [];
    }
    highlightPathInSankey();
});
}

function findMoviePath(movie){
  path = moviePaths[movie]
  if (path === undefined){
    console.log(movie + " not found.");
    moviePath = [];
  } else {
    addMovieToMoviePath(path);
    addPathsToHighlightedPaths(moviePath)
  }
}

function addMovieToMoviePath(path){
  moviePath = [];
  path = path.replace(/#/g , arrow);
  moviePath = path.split("*");
}

function addPathsToHighlightedPaths(paths){
  for(i = 0; i < paths.length; i++){
    path = paths[i];
    pathHighlighted.push(path);
  }
}

function removePathsToHighlightedPaths(paths){
  console.log("hello");
}

function getMovieFlowDatalist(objectID){
  movieKeys = Object.keys(moviePaths);
  $("#"+objectID).attr("data-list", movieKeys);
}
