//Inspiration: https://jrue.github.io/coding/2014/exercises/basicbubblepackchart/

function genreBubbles(divID, w, h, beginYearString, endYearString, genreFilter, countryFilter) {
  var margin = {top: 6, right: 6, bottom: 6, left: 6};
  w = w - margin.left - margin.right;
  h = h - margin.top - margin.bottom;

  var diameter = w; //max size of the bubbles
  var color = d3.scale.ordinal()
          .domain(["Documentary", "Short", "Comedy", "Family", "Sport", "Action", "Animation", "Romance", "Drama", "Western", "News", "Horror", "History", "Crime", "Sci-Fi", "Biography", "Fantasy", "Music", "War", "Adventure", "Thriller", "Musical", "Mystery", "Adult", "Film-Noir", "Reality-TV", "Talk-Show", "Game-Show", "Erotica", "Experimental", "Commercial", "Sex", "Hardcore"])
          .range(["#6599C0", "#F0CC76", "#64BD91", "#F59A6E", "#AFD572", "#FF7F0E", "#E2D35C", "#D84E67", "#7073A0", "#58B16F", "#A2C5A5", "#C25D7F", "#FCD450", "#FF183C", "#2AB1CF", "#348B85", "#70C256", "#72CAFA", "#3A5DA1", "#4EA6AA", "#916589", "#C25D7F", "#4EE69B", "#D6AA51", "#DE6E48", "#AD6A8B", "#73539F", "#FF185D", "#57C27C", "#696C97", "#F7B6D2", "#DA707A", "#878787"]);

  var bubble = d3.layout.pack().sort(null).size([diameter, diameter]).padding(1.5);

  var svg = d3.select(divID)
            .append('svg')
            .attr('width', w + margin.left + margin.right)
            .attr('height', h + margin.top + margin.bottom)
            .attr('class', 'genreBubble');


  data = filterData(genreYearCountryData, beginYearString, endYearString, genreFilter)
          .map(function(d){ d.value = +d["Count"]; return d;});

  // Chart setup
  var nodes = bubble.nodes({children: data}).filter(function(d) { return !d.children; });

  var bubbles = svg.append("g")
                  .attr("transform", "translate(0,0)")
                  .selectAll(".bubble")
                  .data(nodes)
                  .enter();

  // Create bubbles
  bubbles.append("circle")
      .attr("r", function(d){ return d.r; })
      .attr("cx", function(d){ return d.x; })
      .attr("cy", function(d){ return d.y; })
      .style("fill", function(d) {return colors[d.Genre];});




  // Format the text within each bubble
    bubbles.append("text")
            .attr("x", function(d){ return d.x; })
            .attr("y", function(d){ return d.y + 5; })
            .attr("text-anchor", "middle")
            .text(function(d){
              if(d.r > 20){
                return d.Genre;
              }
              return "";
            })
            .style({
                "fill":"white",
                "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
                "font-size": "12px",
            });

}

function filterData(data, beginYear, endYear, genreFilter) {
    data = filterYear(data, beginYear, endYear);
    data = filterGenre(data, genreFilter);

    //Group by genre
    var groupedData = d3.nest()
            .key(function (d){
              return d.Genre;
            })
           .entries(data);

    var dataPerGenre = [];
    groupedData.forEach(function(d){ //for each genre
      var totalRating = 0;
      var count = 0;
      d.values.forEach(function(g){ //for each entry
        totalRating += g.Count * g.Rating;
        count += g.Count;
      });
      var avg = totalRating / count;
      dataPerGenre.push({
        Genre: d.key,
        AverageRating: avg,
        Count: count
      });
    });

  return dataPerGenre;
}
