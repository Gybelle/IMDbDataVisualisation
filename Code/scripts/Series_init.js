var series = [];
var episodes = [];
var actors = [];
var actorsInMovies = [];

function initialiseSeries() {
	/**
	 * LOAD THE DATA
	 */
	console.log("Loading data...");

	var previousTitle = "";

	d3.dsv(';')("data/seriesGOT.csv", function(data) {
		data.forEach(function(d) {
			//check if this is a new Series by comparing the Title to the previously parsed entry
			if (d.Title === previousTitle) {
				//do nothing?
			} else {
				previousTitle = d.Title;
				var newSeries = new Object();
				newSeries.ID = +d.ID
				newSeries.Title = d.Title;
				newSeries.Year = +d.Year
				newSeries.Language = d.Language;

				series.push(newSeries);
			}
			d.ID = +d.ID;
			d.Year = +d.Year;
			d.Episode = +d.Episode;
			d.Season = +d.Season;
			d.Rating = +d.Rating;
		});

		episodes = data;
		console.log("Done with series!");
		onFilter();
	});

	d3.dsv(';')("data/actorsGOT.csv", function(data) {
		data.forEach(function(d) {
			d.ActorID = +d.ActorID;
		});

		actors = data;
		console.log("Done with actors!");
	});

	d3.dsv(';')("data/actorsInMoviesGOT.csv", function(data) {
		data.forEach(function(d) {
			d.ActorID = +d.ActorID;
			d.MovieOrSeriesID = +d.MovieOrSeriesID;
		});

		actorsInMovies = data;
		console.log("Done with actorsInMovies!");
	});


}


/**
 * Function to show filtered series
 */
d3.select('#custom-search-input-field').on('keyup', onFilter);

function onFilter() {
	var filterText = d3.select('#custom-search-input-field').property('value');

	filteredData = series;

	if (filterText !== "") {
		var filteredData = filteredData.filter(function(d) {
			return (d.Title.toLowerCase().indexOf(filterText.toLowerCase()) === 0);
		});
	}

	d3.select('#filter-results').html(filteredData.map(function(d) {
		var returnValue = "" +
			"<a class=\"selectSeries\" href=\"#\" data-seriesid=\"" + d.ID + "\"  >" +
			d.Title + " (" + d.Year + ")" +
			"</a>";
		return returnValue;
	}));

}

/**
 * Functions to select a series
 */
$(document.body).on('click', '.selectSeries' ,function(){
	//is this possible in D3?
	var seriesID = $(this).data("seriesid");

	var filtered = series.filter(function(d){
	    return (d.ID === seriesID);
    });

	if (filtered.length === 0)
		return;

	var selectedShow = filtered[0];

	//first of all, search the number of seasons and max amount of episodes per season
	var numSeasons = 0;
	var numEpisodes = 0;
	$.each(filtered, function( index, value ) {
		if (value.Season > numSeasons) {
			numSeasons = value.Season;
		}
		if (value.Episode > numEpisodes) {
			numEpisodes = value.Episode;
		}
	});


	drawRatingsPerEpisode(selectedShow, numSeasons, numEpisodes);
	drawActorPanels(selectedShow, numSeasons, numEpisodes);
});



function drawRatingsPerEpisode(selectedShow, numSeasons, numEpisodes) {
	//thanks to http://bl.ocks.org/benjchristensen/2579599

	//filter out all the episodes for the show
	var filtered = episodes.filter(function(d) {
		return (d.Title === selectedShow.Title && d.Season !== 0 && d.Episode !== 0);
	});

	var data = [];
	$.each(filtered, function( index, value ) {
		var episode = new Object();
		episode.episodeNr = (value.Season - 1) * numSeasons + value.Episode;
		episode.season = value.Season;
		episode.episode = value.Episode;
		episode.rating = value.Rating;

		if (episode.rating > 0) {
			data.push(episode);
		}
	});

	// define dimensions of graph
	var colRatingLineChart = $('#colRatingLineChart');
	var width = colRatingLineChart.width();
	var height = colRatingLineChart.height();
	var m = [20, 80, 20, 80]; // margins
	var w = width - m[1] - m[3]; // width
	var h = height - m[0] - m[2]; // height

	// X scale will fit all values from data[] within pixels 0-w
	var x = d3.scale.linear().domain([0, data.length]).range([0, w]);
	// Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
	var y = d3.scale.linear().domain([0, 10]).range([h, 0]);

	// create a line function that can convert data[] into x and y points
	var line = d3.svg.line()
		// assign the X function to plot our line as we wish
		.x(function(d,i) { 
			// verbose logging to show what's actually being done
			//console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
			// return the X coordinate where we want to plot this datapoint
			return x(i); 
		})
		.y(function(d) { 
			// verbose logging to show what's actually being done
			//console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
			// return the Y coordinate where we want to plot this datapoint
			return y(d.rating); 
		})

		//clear the old graph first
		$('#ratingLineChart').html('');

		// Add an SVG element with the desired dimensions and margin.
		var graph = d3.select("#ratingLineChart").append("svg:svg")
		      .attr("width", w + m[1] + m[3])
		      .attr("height", h + m[0] + m[2])
		    .append("svg:g")
		      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

		// create yAxis
		var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true);
		// Add the x-axis.
		graph.append("svg:g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + h + ")")
		      .call(xAxis);

		// create left yAxis
		var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
		// Add the y-axis to the left
		graph.append("svg:g")
		      .attr("class", "y axis")
		      .attr("transform", "translate(-25,0)")
		      .call(yAxisLeft);
		
			// Add the line by appending an svg:path element with the data line we created above
		// do this AFTER the axes above so that the line is above the tick-lines
			graph.append("svg:path").attr("d", line(data));
}

function drawActorPanels(selectedShow, numSeasons, numEpisodes) {
	var mainTreshold = .5; //treshold of occurrences to be considered main character in range [0, 1]
	var mainAmount = 10; //alternatively, choose a static amount of main cast (not yet implemented)

	//filter out all the episodes for the show
	var filtered = episodes.filter(function(d) {
		return (d.Title === selectedShow.Title && d.Season !== 0 && d.Episode !== 0);
	});

	var episodeIDs = [];
	$.each(filtered, function( index, value ) {
		episodeIDs.push(value.ID);
	});

	var seriesActorsInMovies = actorsInMovies.filter(function(d) {
		return (episodeIDs.indexOf(d.MovieOrSeriesID) >= 0);
	});

	var actorIDs = [];
	var actorOccurrences = [];
	$.each(seriesActorsInMovies, function( index, value ) {
		if (actorIDs.indexOf(value.ActorID) < 0) {
			actorIDs.push(value.ActorID);
			actorOccurrences[value.ActorID] = 0
		}
		actorOccurrences[value.ActorID]++;
	});

	var seriesActors = actors.filter(function(d) {
		return (actorIDs.indexOf(d.ActorID) >= 0);
	});

	//filter out main actors
	var mainActors = seriesActors.filter(function(d) {
		return ((actorOccurrences[d.ActorID] / filtered.length) >= mainTreshold);
	});

	var divisionData = calculateActorDivisionData(mainActors, actorOccurrences);

	//clear the old grid first
	$('#actorDistribution').html('');

	//draw the grid
	var grid = d3.select("#actorDistribution")
	    .append("svg")
	    .attr("width", $('#actorDistribution').width())
	    .attr("height", $('#actorDistribution').height());

	/*var row = grid.selectAll(".row")
	    .data(divisionData)
	    .enter().append("g")
	    .attr("class", "row");*/

	var column = grid.selectAll(".square")
	    .data(divisionData)
	    .enter().append("rect")
	    .attr("class","square")
	    .attr("x", function(d) { return d.x; })
	    .attr("y", function(d) { return d.y; })
	    .attr("width", function(d) { return d.width; })
	    .attr("height", function(d) { return d.height; })
	    .style("fill", function(d) { return d.color; })
	    .style("stroke", "#222");

    grid.selectAll(".actor-desc").data(divisionData)
    	.enter().append("text")
    	.attr("class", "actor-desc")
	    .attr("x", function(d){ return d.x + d.width / 2; })
	    .attr("y", function(d){ return d.y + d.height / 2; })
	    .attr("text-anchor", "middle")
	    .text(function(d){
	      return d.actor.FirstName + " " + d.actor.LastName;
	    })
	    .style({
	        "fill":"white",
	        "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
	        "font-size": "20px",
	    });

}

function calculateActorDivisionData(mainActors, actorOccurrences) {
	//first, calculate the total amount of occurences
	var total = 0;
	$.each(mainActors, function( index, value ) {
		total += actorOccurrences[value.ActorID];
	});

	//now calculate each main actors percentage of occurrence
	var division = [];
	$.each(mainActors, function( index, value ) {
		actor = new Object();
		actor.actor = value;
		actor.percentage = total / actorOccurrences[value.ActorID] / 100;
		division.push(actor);
	});




	//let's say 60% of our surface is the 'max'
	var totalHeigthFactor = 1;
	var widthTotal = $('#actorDistribution').width();
	var heightTotal = $('#actorDistribution').height();

	var totalSurface = widthTotal * totalHeigthFactor * heightTotal ;


	/*
	actorSurface = actorHeight * actorWidth
	realSurface = realHeight * realWidth
	actorSurface = realSurface * actorPercentage
	actorHeight * actorWidth = realHeight * realWidth * actorPercentage
	*/


	var data = new Array();
	var numCols = 5;
	//var numRows = 2;
    var xpos = 1;
    var ypos = 1;
    var width = widthTotal / numCols; //this should be calculated using the percentages
    //var height = heightTotal / numRows; //this should be calculated using the percentages

    var currentColumn  = 0;

    for (var i = 0; i < mainActors.length; i++) {
    	var currentActor = mainActors[i];

    	console.log(division[i].percentage);

    	var height = (totalSurface * division[i].percentage) / width;

	    data.push({
        	actor: currentActor,
            x: xpos,
            y: ypos,
            width: width,
            height: height,
            color: getNewColor()
        })


	    //currentColumn++;

	   	if (currentColumn >= numCols) {
	   		currentColumn = 0;
	   		xpos = 1;
	   	} else {
	   		xpos += width;
	   	}


    }



/*
    for (var row = 0; row < numRows; row++) {

        for (var column = 0; column < numCols; column++) {
            data.push({
            	actor: mainActors[row * numCols + column],
                x: xpos,
                y: ypos,
                width: width,
                height: height,
                color: getNewColor()
            })
            xpos += width;
        }
        xpos = 1;
        ypos += height; 
    }
*/
	return data;
}


var colors = [];

function initColors() {
	colors = [
	'#2c8af2',
	'#9eb8cf',
	'#f43c8f',
	'#c452f2',
	'#f80808',
	'#5ee0a5',
	'#ffc000',
	'#c240c8',
	'#a7c0d6',
	'#f25913'	
	];
}
initColors();

function getNewColor() {
	var color = colors.pop();
	if (colors.length == 0) {
		initColors();
	}
	return color;
} 