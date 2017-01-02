pathHighlighted = ["2 hours → Two months", "Two months → [1M-5M["]
arrow = " → "
classHighlight = "highlighted_link"

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
        pathHighlighted.p
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
  pathHighlighted = []
  $("#menu-toggle").click(function(e) {
      e.preventDefault();
      $("#wrapper").toggleClass("toggled");
  });
}

function getMovieFlowDatalist(objectID){
  movieList = "Java, JavaScript, Python";
  $("#"+objectID).attr("data-list", movieList);
  

}
