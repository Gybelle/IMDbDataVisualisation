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
		html = html + "<a class=\"selectSeries searchResult searchResultActor\" href=\"#\" data-seriesid=\"" + value.ID + "\"  >" +
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
        d3.select(".searchResultMovie").attr("class", "selectSeries searchResult searchResultActor");
        $(this)[0].className = "selectSeries searchResult searchResultMovie";

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

		console.log(epsPerSeason);

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


		//make the tick lines black for better visiblity
		d3.selectAll('g.x.axis g.tick line').style("stroke", "black");

}

function highlightEpisodesOnRatings(episodes) {
	//if episodes is empty or null we have to remove all highlighting
	d3.selectAll('g.x.axis rect').remove();

	//if episodes is empty we only reset it
	if (episodes === undefined || episodes === null | episodes.length == 0) {
		return;
	}

	var ticks = d3.selectAll('.x.axis g.tick')[0];

	var prevTickWidth = -1;
	var prevTickPos = -1;

	var currentSeason = 1;


	var currentEpisodePos = 0;

	$.each(ticks, function() {
		var tickWidth = $(this).width();

		var height = (-1) * $(this).find('line')[0].y2.baseVal.value; //well...
		var tickPos = this.transform.baseVal[0].matrix.e; //trial and error :p

		if (prevTickWidth == -1) {
			//skip the first tick
			prevTickWidth = tickWidth;
			prevTickPos = tickPos;
			return;
		}

		//lets try and draw a rectangle for the entire season first :p
		var prevMiddle, middle;

		prevMiddle = (prevTickWidth / 2) + prevTickPos;
		middle = (tickWidth / 2) + tickPos;

		var seasonWidth = middle - prevMiddle;
		var season = episodes[currentSeason];

		if (season === undefined)
			return;

		var episodeWidth = seasonWidth / (season.length - 1);
		var xAxis = d3.select('g.x.axis');


		for (var i = 1; i < season.length; i++) {
			if (season[i] == 1) {
				//draw rectangle
				xAxis.append("rect")
					.attr("x", currentEpisodePos - (episodeWidth / 2))
					.attr("y", -height)
					.attr("width", episodeWidth)
					.attr("height", height)
					.style("opacity", 0.1);						
			}

			currentEpisodePos += episodeWidth;
		}

		prevTickWidth = tickWidth;
		prevTickPos = tickPos;
		currentSeason++;
	});

}

function drawActorPanels(selectedShow, numSeasons, numEpisodes) {
	$('#actorDistribution').html('Loading actors...');

	var mainTreshold = .1; //treshold of occurrences to be considered main character in range [0, 1]

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

		var divisionData = calculateActorDivisionData(mainActors, actorOccurrences, actorOccurrencesPerSeason, epsPerSeason, actorRoles);

		//clear the old grid first
		$('#actorDistribution').html('');

		var root = {children: divisionData};
		//draw the grid	
		var width = $('#actorDistribution').width();
		var height = $('#actorDistribution').height();

        var treemap = d3.layout.treemap()
                          .size([width,height])
                          .sticky(true)
                          .value(function(d) { return d.size; });

        var div = d3.select("#actorDistribution").append("div")
                          .style("position", "relative")
                          .style("width", width)
	    				  .style("height", height);

		var node = div.datum(root).selectAll(".node")
			.data(treemap.nodes)
			.enter().append("div")
			.attr("class", "node")
			.call(position)
			.style("background", function(d,i) { return d.color; })
			.html(function(d) {return d.children ? null : generateActorHtml(d, Math.max(0, d.dx - 1))} )
			.on('mouseover', function(d) {
				d3.select(this).style('box-shadow','3px 0px 30px #fff');
				highlightEpisodesOnRatings(d.appearances);
			});

		//show popover div with all the information visible
		$('.node').on('mouseover', function(e){
			$('#fullActorInformation').css({
				left:  e.pageX + 20,
				top:   e.pageY
			});
		});

		node.data(treemap.value(function(d) { return d.size; }).nodes).transition().duration(1500).call(position);

		//now adjust the html of each actor until it fits in the current rect
		$.each($('.node'), function(index, value) {
			var node = $(value);
			var innerHtml = $(node.find('.actor-desc-inner'));

			//keep removing things from the html until it fits or until only the role is left
			if ((innerHtml.height() + 10) > node.height()) {
				//first remove the appearances
				var appearances = innerHtml.find('.appearances');
				$(appearances).hide();
			}

			if ((innerHtml.height() + 10) > node.height()) {
				//Secondly remove the name of the actor (role is more recognizable)
				var name = innerHtml.find('.name');
				$(name).hide();
			}

		});

		function position() {
			this.style("left", function(d) { return d.x + "px"; })
				.style("top", function(d) { return d.y + "px"; })
				.style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
				.style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
		}

        d3.selectAll('.node').on('mouseout',function(){
			d3.select(this).style('box-shadow','none');
			highlightEpisodesOnRatings();
        });

	});
}

function generateActorHtml(data, width) {
	var html = "";

	//calculate episodeWidth
	var episodeWidth = width * 0.7 / data.maxEpsPerSeason;

	//name
	html = html + '<div class="name">'
		+ data.actor.FirstName + " " + data.actor.LastName + " (" + data.size + ")"
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

			html += '<div style="width: ' + episodeWidth + 'px" class="episode ' + cls + '"></div>';
		});

		html += '</div>'
	});

	html += '</div>';

	return '<div class="actor-desc-inner">' + html + '</div>';
}

function calculateActorDivisionData(mainActors, actorOccurrences, actorOccurrencesPerSeason, epsPerSeason, actorRoles) {

	//calculate the max amount of epsPerSeason
	var maxEpsPerSeason = 0;
	$.each(epsPerSeason, function (index, value) {
		if (value > maxEpsPerSeason) {
			maxEpsPerSeason = value;
		}
	});

	var data = new Array();
	
    for (var i = 0; i < mainActors.length; i++) {
    	var currentActor = mainActors[i];

		var size = actorOccurrences[currentActor.ActorID];

    	//calculate all appearances for this actor
		var appearances = [];

		$.each(actorOccurrencesPerSeason[currentActor.ActorID], function(index, value) {
			//each value is a season
			appearances[index] = [];

			//if no occurences in this season, we need to instantiate value
			if (value === undefined)
				value = [];

			for (var j = 1; j <= epsPerSeason[index]; j++) {
				if (value.indexOf(j) < 0) {
					appearances[index][j] = 0;
				} else {
					appearances[index][j] = 1;
				}
			}
		});

		var role = actorRoles[currentActor.ActorID];

	    data.push({
        	actor: currentActor,
        	appearances: appearances,
        	maxEpsPerSeason: maxEpsPerSeason,
        	role: role,
        	size: size,
            color: getNewColor()
        });

    }

	return data;
}


var colors = [];

function initColors() {
	colors = ["#FF7F0E", "#6599C0", "#F0CC76", "#64BD91", "#F59A6E", "#AFD572", "#E2D35C", "#D84E67", "#7073A0", "#58B16F", "#A2C5A5", "#C25D7F", "#FCD450", "#FF183C", "#2AB1CF", "#348B85", "#70C256", "#72CAFA", "#3A5DA1", "#4EA6AA", "#916589", "#C25D7F", "#4EE69B", "#D6AA51", "#DE6E48", "#AD6A8B", "#73539F", "#FF185D", "#57C27C", "#696C97", "#F7B6D2", "#DA707A", "#878787"];
        colors.reverse();
}
initColors();

function getNewColor() {
	var color = colors.pop();
	if (colors.length == 0) {
		initColors();
	}
	return color;
} 