var loadedSeriesLetter = "";
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
/*
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
		console.log("Actors for GoT: " + actors.length);
	});

	d3.dsv(';')("data/actorsInMoviesGOT.csv", function(data) {
		data.forEach(function(d) {
			d.ActorID = +d.ActorID;
			d.MovieOrSeriesID = +d.MovieOrSeriesID;
		});

		actorsInMovies = data;
		console.log("Done with actorsInMovies!");
	});
*/
}

function loadSeriesData(firstLetter) {
	var previousTitle = "";

	d3.dsv(';')("data/series/series_" + firstLetter + ".csv", function(data) {
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
		console.log("Done with series " + firstLetter + "!");
		loadedSeriesLetter = firstLetter;
		onFilter();
	});
}

function loadActorsInSeriesData(seriesID, followup) {
	var bucket = Math.floor(seriesID / 50000);

	d3.dsv(';')("data/actorsInSeries/mapping_" + bucket + ".csv", function(data) {
		data.forEach(function(d) {
			d.ActorID = +d.ActorID;
			d.MovieOrSeriesID = +d.MovieOrSeriesID;
		});

		actorsInMovies = data;
		console.log("Done with actorsInMovies!");
		followup();
	});

}

/**
 * Function to show filtered series
 */
d3.select('#custom-search-input-field').on('keyup', function() {
	var value = $(this).val();

	if (value.length === 0) {
		return;
	}

	var firstLetter = value[0].toUpperCase();
	var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

	if (letters.indexOf(firstLetter) < 0) {
	    firstLetter = "-";
	}

	if (loadedSeriesLetter !== firstLetter) {
		loadSeriesData(firstLetter)
		loadedSeriesLetter = firstLetter;
	} else {
		onFilter();
	}

});

function onFilter() {
	var filterText = d3.select('#custom-search-input-field').property('value');
	filteredData = series;

	if (filterText !== "") {
		var filteredData = filteredData.filter(function(d) {
			return (d.Title.toLowerCase().indexOf(filterText.toLowerCase()) === 0);
		});
	}

	var html = "";
	
	$.each(filteredData, function(index, value) {
		html = html + "<a class=\"selectSeries\" href=\"#\" data-seriesid=\"" + value.ID + "\"  >" +
			value.Title + " (" + value.Year + ")" + "</a>";
	});

	d3.select('#filter-results').html(html);
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

	filtered = episodes.filter(function(d) {
		return (d.Title === selectedShow.Title && d.Season !== 0 && d.Episode !== 0);
	});

	$.each(filtered, function( index, value ) {
		if (value.Season > numSeasons) {
			numSeasons = value.Season;
		}
		if (value.Episode > numEpisodes) {
			numEpisodes = value.Episode;
		}
	});

	//load the actorsInSeries data
	loadActorsInSeriesData(seriesID, function() {
		drawRatingsPerEpisode(selectedShow, numSeasons, numEpisodes);
		drawActorPanels(selectedShow, numSeasons, numEpisodes);		
	});

        seriesBubbles(filtered);
});


function drawRatingsPerEpisode(selectedShow, numSeasons, numEpisodes) {
	//thanks to http://bl.ocks.org/benjchristensen/2579599

	//filter out all the episodes for the show
	var filtered = episodes.filter(function(d) {
		return (d.Title === selectedShow.Title && d.Season !== 0 && d.Episode !== 0);
	});

	var avgRating = 0;
	var totalEps = 0;

	var epsPerSeason = [];
	var data = [];
	$.each(filtered, function( index, value ) {
		var episode = new Object();
		episode.episodeNr = (value.Season - 1) * numEpisodes + value.Episode;
		episode.season = value.Season;
		episode.episode = value.Episode;
		episode.rating = value.Rating;

		if (episode.rating > 0) {
			data.push(episode);

			avgRating += episode.rating;
			totalEps++;
		}

		if (epsPerSeason[episode.season] === undefined) {
			epsPerSeason[episode.season] = 0;
		}
		epsPerSeason[episode.season]++;
	});

	avgRating /= totalEps;
	avgRating = Math.round(avgRating * 100) / 100; //round 2 decimals

	// define dimensions of graph
	var colRatingLineChart = $('#colRatingLineChart');
	var width = colRatingLineChart.width();
	var height = colRatingLineChart.height();
	var m = [20, 80, 20, 80]; // margins
	var w = width - m[1] - m[3]; // width
	var h = height - m[0] - m[2]; // height

	var wAvg = w * 0.1; //width for avg part
	w = w * 0.9;

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


		var avg = d3.select("#ratingLineChart").append("svg:svg")
		      .attr("width", wAvg)
		      .attr("height", h + m[0] + m[2])
		      .append("foreignObject")
    	.attr("class", "avg-rating-container")
	    /*.attr("x", function(d){ return d.x; })
	    .attr("y", function(d){ return d.y; })
        */.attr('width', wAvg)
        .attr('height', h + m[0] + m[2])          
        	.append("xhtml:body")
    .html('<div>Average Rating:</div><div class="rating">' + avgRating + "</div>")
    .style("background", "none");

		//calculate the ticks that represent the first episode of a new season
		var tickValues = [];
		var epCounter = 1;

		for (var i = 1; i <= epsPerSeason.length; i++) {
			tickValues.push(epCounter - 1);
			if (epsPerSeason[i] !== undefined) {
				epCounter += epsPerSeason[i];
			}
		}

		var seasonNr = 0;
		// create yAxis
		var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true).tickValues(tickValues).tickFormat(function(d) {
			//find the season this episodeNr belongs to

			seasonNr++;
			return "Season " + seasonNr;

		});


		// Add the x-axis.
		graph.append("svg:g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + h + ")")
		      .call(xAxis);

		graph.selectAll('g.tick').select('text')
			.style("text-anchor", "middle")
		    .attr("x", 0); //change this 0 to something else to center the ticks

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

	//filter out all the episodes for the show
	var filtered = episodes.filter(function(d) {
		return (d.Title === selectedShow.Title && d.Season !== 0 && d.Episode !== 0);
	});

	var totalEpisodes = filtered.length;
	var epsPerSeason = [];
	var episodeIDs = [];
	$.each(filtered, function( index, value ) {
		episodeIDs.push(value.ID);

		if (epsPerSeason[value.Season] === undefined) {
			epsPerSeason[value.Season] = 0;
		}
		epsPerSeason[value.Season]++;

	});

	var seriesActorsInMovies = actorsInMovies.filter(function(d) {
		return (episodeIDs.indexOf(d.MovieOrSeriesID) >= 0);
	});

	var actorIDs = [];
	var actorOccurrences = [];
	var actorOccurrencesPerSeason = []
	var actorRoles = [];

	$.each(seriesActorsInMovies, function( index, value ) {
		if (actorIDs.indexOf(value.ActorID) < 0) {
			actorIDs.push(value.ActorID);
			actorOccurrences[value.ActorID] = 0
			actorOccurrencesPerSeason[value.ActorID] = [];
		}
		actorOccurrences[value.ActorID]++;

		if (actorRoles[value.ActorID] === undefined) {
			actorRoles[value.ActorID] = value.Role;
		}

		//find the episode in the filtered var
		var episode = filtered.filter(function(d) {
			return (d.ID === value.MovieOrSeriesID);
		})[0];

		if (actorOccurrencesPerSeason[value.ActorID][episode.Season] === undefined) {
			actorOccurrencesPerSeason[value.ActorID][episode.Season] = [];
		}

		actorOccurrencesPerSeason[value.ActorID][episode.Season].push(episode.Episode);
	});

	/*
	 * now load the appropriate actors
	*/

	//first filter out main actors
	var mainActorIDs = [];
	$.each(actorOccurrences, function(k,v) {
		if ((v / totalEpisodes) >= mainTreshold) {
			mainActorIDs.push(k);
		}
	});

	var q = d3.queue();
	var addedBuckets = [];

	$.each(mainActorIDs, function(k,v) {
		var bucket = Math.floor(v / 10000);
		if (addedBuckets.indexOf(bucket) < 0) {
	    	q.defer(d3.dsv(';'), "data/actorsByID/actors_" + bucket + ".csv");
	    	addedBuckets.push(bucket);
		}
	});

/*
	d3.dsv(';')("data/actorsGOT.csv", function(data) {
		data.forEach(function(d) {
			d.ActorID = +d.ActorID;
		});

		actors = data;
		console.log("Done with actors!");

	});*/


	q.awaitAll(function (error, files) {
		var mainActors = [];
	    
	    files.forEach(function (file) {     
	        file.forEach(function (d) {
	        	d.ActorID = +d.ActorID;

	        	var index = mainActorIDs.indexOf(d.ActorID)
	        	if (index >= 0) {
	        		mainActors.push(d);

	        		//temp fix for duplicate ActorID bug:
	        		//remove ID from mainActorIDs
					mainActorIDs.splice(index, 1);
	        	}


	        });
	    });

/*
	    console.log(mainActors);
	    console.log(actorOccurrences);
	    console.log(actorOccurrencesPerSeason);
	    console.log(epsPerSeason);
	    console.log(actorRoles);
*/

		var divisionData = calculateActorDivisionData(mainActors, actorOccurrences, actorOccurrencesPerSeason, epsPerSeason, actorRoles);

		console.log(divisionData);

		//clear the old grid first
		$('#actorDistribution').html('');

		//draw the grid
		var grid = d3.select("#actorDistribution")
		    .append("svg")
		    .attr("width", $('#actorDistribution').width())
		    .attr("height", $('#actorDistribution').height());

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
	    	.enter().append("foreignObject")
	    	.attr("class", "actor-desc")
		    .attr("x", function(d){ return d.x; })
		    .attr("y", function(d){ return d.y; })
	        .attr('width',  function(d){ return d.width; })
	        .attr('height', function(d){ return d.height; })            
	        	.append("xhtml:body")
	    .html(function(d) {return generateActorHtml(d);} )
	    .style({
	    	"background": "none",
	    });

	});
}

function generateActorHtml(data) {
	var html = "";

	//name
	html = html + '<div class="name">'
		+ data.actor.FirstName + " " + data.actor.LastName
		+ '</div>';

	//role
	html = html + '<div class="role">'
		+ 'Role: ' + " " + data.role
		+ '</div>';


	//appearances
	html += '<div class="appearances">';

	$.each(data.appearances, function (index, value) {
		if (index == 0)
			return;

		html += '<div class="season">';
		html += '<div class="label">S' + index + '</div>'

		$.each(value, function(i, v) {
			if (i == 0)
				return;

			var cls = "";
			if (v == 1) {
				cls = "yes";
			} else {
				cls = "no";
			}

			html += '<div style="width: ' + data.episodeWidth + 'px" class="episode ' + cls + '"></div>';
		});

		html += '</div>'
	});

	html += '</div>';

	return '<div class="actor-desc-inner">' + html + '</div>';
}

function calculateActorDivisionData(mainActors, actorOccurrences, actorOccurrencesPerSeason, epsPerSeason, actorRoles) {
	//first, calculate the total amount of occurences
	var total = 0;
	$.each(mainActors, function( index, value ) {
		total += actorOccurrences[value.ActorID];
	});

	var totalMainActors = mainActors.length;

	//now calculate each main actors percentage of occurrence
	var division = [];
	$.each(mainActors, function( index, value ) {
		actor = new Object();
		actor.actor = value;
		actor.percentage = actorOccurrences[value.ActorID] / total;

		division.push(actor);
	});

	//calculate the max amount of epsPerSeason
	var maxEpsPerSeason = 0;
	$.each(epsPerSeason, function (index, value) {
		if (value > maxEpsPerSeason) {
			maxEpsPerSeason = value;
		}
	});


	//let's say 80% of our surface is the 'max'
	var totalHeigthFactor = .8;
	var widthTotal = $('#actorDistribution').width();
	var heightTotal = $('#actorDistribution').height();

	var totalSurface = widthTotal * totalHeigthFactor * heightTotal ;


	var data = new Array();

	var numCols = 5;
	if (totalMainActors < numCols) {
		numCols = totalMainActors;
	}
	
    var width = Math.round(widthTotal / numCols); //this should be calculated using the percentages

    var episodeWidth = width * 0.7 / maxEpsPerSeason;


    var currentColumn  = 0;

    for (var i = 0; i < mainActors.length; i++) {
    	var currentActor = mainActors[i];

    	var height = Math.round((totalSurface * division[i].percentage) / width);

    	//calculate all appearances for this actor
		var appearances = [];
		console.log(actorOccurrencesPerSeason[currentActor.ActorID]);
		$.each(actorOccurrencesPerSeason[currentActor.ActorID], function(index, value) {
			//each value is a season
			appearances[index] = [];

			//if no occurences in this season, we continue
			if (value === undefined)
				return;

			for (var j = 1; j <= epsPerSeason[index]; j++) {
				if (value.indexOf(j) < 0) {
					appearances[index][j] = 0;
				} else {
					appearances[index][j] = 1;
				}
			}
		});

		var role = actorRoles[currentActor.ActorID];

    	//now calculate the position, trying to fill top-down from left to right
    	//use the data object as reference for already placed squares

		//we'll start at (1, 1) and see if spaces are occupied
	    var xpos = 1;
    	var ypos = 1;
    	var nextYPos = 1;

    	var positionFound = false;
    	while (!positionFound) {

    		if (data.length == 0) {
    			//edge condition: the first one will always be placed top left
    			positionFound = true;
    			continue;
    		}

    		positionFound = true;
	    	for (var j = 0; j < data.length && positionFound; j++) {

	    		//2 conditions need to be met:
	    		// * The space may not already be occupied
	    		// * The space has to be inside our bounds 
	    		//    --> doesn't get checked for now to avoid infinite loops, probably needs revision
	    		//    --> Ideally the solution would be to change the totalHeightFactor variable for this, if we need to go out of x bounds
	    		//    --> So every time we dont have enough room, lower the totalHeightFactor and repeat this whole process

	    		var xTaken = (xpos >= data[j].x && xpos < data[j].x + data[j].width);
	    		var yTaken = (ypos >= data[j].y && ypos < data[j].y + data[j].height);

	    		if (xTaken && yTaken) {
    				positionFound = false;
	    		}

	    		//store information for later to avoid doing this same loop:
	    		if (data[j].x == xpos) {
	    			if ((data[j].y + data[j].height) > nextYPos) {
	    				nextYPos = data[j].y + data[j].height;
	    			}
	    		}
	    	}

	    	if (positionFound) {
	    		continue;
	    	}

	    	//if the position wasnt found, we need to determine the next available position
	    	//in case the height fits in our window, we can place it to the next Y
	    	if (nextYPos > ypos && (nextYPos + height <= heightTotal)) {
	    		ypos = nextYPos;
	    	} else {
	    		xpos += width;
	    		ypos = 1;
	    		nextYPos = 1;
	    	}

    	}

	    data.push({
        	actor: currentActor,
        	appearances: appearances,
        	episodeWidth: episodeWidth,
        	role: role,
            x: xpos,
            y: ypos,
            width: width,
            height: height,
            color: getNewColor()
        });

    }

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