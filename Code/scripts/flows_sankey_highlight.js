pathHighlighted = ["2 hours → Two months", "Two months → [1M-5M["]
arrow = " → "
classHighlight = "highlighted_link"

function highlightPathInSankey(){
  removePreviousHighlight()



}

function removePreviousHighlight(){
   var links = getLinkObjects();
   console.log("start");

   for(i = 0; i < links.length; i++){
     var link = links[i];
     var text = $(link).text();

     for(j = 0; j < pathHighlighted.length; j++){
       console.log(text);
       path = pathHighlighted[j];
       console.log(path);
       if (text.indexOf(path) != -1){
         console.log("found!");
         $(link).addClass(classHighlight);
       }
     }
     //console.log(text);
   }

   console.log("end");
}


function getLinkObjects(){
  var links = [];

  $( ".link" ).each(function( index ) {
    links.push(this);
   });

   return links;
}
