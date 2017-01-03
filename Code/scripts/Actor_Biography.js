bucket1 = 0;
bucket2 = 10;
bucket3 = 25;
bucket4 = 50;
actor = null;
movie = null;
actorAge = null;

function setBiographyWidgetActor(newActor) {
    movie = null;
    if (newActor == null || newActor.birthYear == "") {
        setIcons(6, 6, 6, 6, 1);
        setBiographyText();
        actor = null;
        return;
    }
    actor = newActor;
    getActorAge();
    setIcons(0, 0, 0, 0, 1, -1, -1, -1, -1);
    setBiographyText();
}

function setBiographyWidgetMovieMap(movies) {
    if (actor == null) {
        return;
    }
    var yearMovieMap = {};
    movies.forEach(function (movie) {
        if (!yearMovieMap[movie.year]) {
            yearMovieMap[movie.year] = [];
        }
        yearMovieMap[movie.year].push(movie);
    });
    var birthYear = parseInt(actor.birthYear);
    var deathYear = new Date().getFullYear() + 1000;
    if (actor.deathYear != "") {
        deathYear = parseInt(actor.deathYear);
    }
    var count1 = 0, count2 = 0, count3 = 0, count4 = 0;
    for (var yearObj in yearMovieMap) {
        var year = parseInt(yearObj);
        if (year <= deathYear) {
            var age = year - birthYear;
            if (age <= bucket2) {
                count1 += yearMovieMap[yearObj].length;
            } else if (age <= bucket3) {
                count2 += yearMovieMap[yearObj].length;
            } else if (age <= bucket4) {
                count3 += yearMovieMap[yearObj].length;
            } else if (age > bucket4) {
                count4 += yearMovieMap[yearObj].length;
            }
        }
    }
    setIconScale(count1, count2, count3, count4);
}

function setBiographyWidgetMovie(newMovie) {
    actor = null;
    actorAge = null;
    if (newMovie == null || newMovie.year == "") {
        setIcons(6, 6, 6, 6, 1);
        setBiographyText();
        movie = null;
        return;
    }
    movie = newMovie;
    setIcons(0, 0, 0, 0, 1, -1, -1, -1, -1);
    setBiographyText();
}

function setBiographyWidgetActorMap(actors) {
    if (movie == null) {
        return;
    }
    var actorAgeMap = {};
    var year = parseInt(movie.year);
    actors.forEach(function (actor) {
        if (actor.birthYear != "" && (actor.deathYear == "" || parseInt(actor.deathYear) >= year)) {
            var age = year - parseInt(actor.birthYear);
            if (!actorAgeMap[age]) {
                actorAgeMap[age] = 0;
            }
            actorAgeMap[age]++;
        }
    });
    var count1 = 0, count2 = 0, count3 = 0, count4 = 0;
    for (var age in actorAgeMap) {
        if (age <= bucket2) {
            count1 += actorAgeMap[age];
        } else if (age <= bucket3) {
            count2 += actorAgeMap[age];
        } else if (age <= bucket4) {
            count3 += actorAgeMap[age];
        } else if (age > bucket4) {
            count4 += actorAgeMap[age];
        }
    }
    setIconScale(count1, count2, count3, count4);
}

function getActorAge() {
    if (actor == null || actor.birthYear == "") {
        actorAge = null;
    }
    currentAge = 0;
    if (actor.deathYear == "") {
        var currentYear = new Date().getFullYear();
        var birthYear = parseInt(actor.birthYear);
        var currentAge = currentYear - birthYear;
    } else {
        var deathYear = parseInt(actor.deathYear);
        var birthYear = parseInt(actor.birthYear);
        currentAge = deathYear - birthYear;
    }
    actorAge = currentAge;
}

function setIcons(color1, color2, color3, color4, max, count1, count2, count3, count4) {
    var genderLetter = "x";
    if (actor != null) {
        var male = true;
        male = actor.isMale;
        var genderLetter = "m";
        if (!male) {
            genderLetter = "f";
        }
    }
    if (actorAge != null) {
        if (actorAge < bucket1) {
            color1 = 6;
        }
        if (actorAge < bucket2) {
            color2 = 6;
        }
        if (actorAge < bucket3) {
            color3 = 6;
        }
        if (actorAge < bucket4) {
            color4 = 6;
        }
    }
    //console.log("Age icons: " + genderLetter + " " + color1 + " " + color2 + " " + color3 + " " + color4);
    document.getElementById("lifetimeImg1").src = "img/AgeIcons/" + genderLetter + "_age1_col" + color1 + ".png";
    document.getElementById("lifetimeImg2").src = "img/AgeIcons/" + genderLetter + "_age2_col" + color2 + ".png";
    document.getElementById("lifetimeImg3").src = "img/AgeIcons/" + genderLetter + "_age3_col" + color3 + ".png";
    document.getElementById("lifetimeImg4").src = "img/AgeIcons/" + genderLetter + "_age4_col" + color4 + ".png";
    document.getElementById("lifetimeLegend").src = "img/AgeIcons/" + genderLetter + "_legend.png";
    if (movie == null) {
        if (max == 1) {
            document.getElementById("lifetimeLegendLabelTop").innerHTML = max + " movie";
        } else {
            document.getElementById("lifetimeLegendLabelTop").innerHTML = max + " movies";
        }
    } else {
        if (max == 1) {
            document.getElementById("lifetimeLegendLabelTop").innerHTML = max + " actor";
        } else {
            document.getElementById("lifetimeLegendLabelTop").innerHTML = max + " actors";
        }
    }
    if (actor != null && actor.birthYear != null && actorAge != null) {
        var birthYear = +actor.birthYear;
        var deathYear = 0;
        var age = actorAge;
        if (actor.deathYear != null) {
            deathYear = +actor.deathYear;
        }
        var currentYear = new Date().getFullYear();
        var year0, year1, year2, year3, year4, year5, year6, year7;
        year0 = birthYear + bucket1;
        year1 = (year0 != null) ? birthYear + ((bucket2 > age) ? age : bucket2) : null;
        year2 = (year1 != null && year1 + 1 <= birthYear + age) ? year1 + 1 : null;
        year3 = (year2 != null) ? birthYear + ((bucket3 > age) ? age : bucket3) : null;
        year4 = (year3 != null && year3 + 1 <= birthYear + age) ? year3 + 1 : null;
        year5 = (year4 != null) ? birthYear + ((bucket4 > age) ? age : bucket4) : null;
        year6 = (year5 != null && year5 + 1 <= birthYear + age) ? year5 + 1 : null;
        year7 = (year6 != null) ? ((deathYear == 0) ? currentYear : deathYear) : null;
        makeIconClickable("lifetimeWrapper1", year0, year1, count1);
        makeIconClickable("lifetimeWrapper2", year2, year3, count2);
        makeIconClickable("lifetimeWrapper3", year4, year5, count3);
        makeIconClickable("lifetimeWrapper4", year6, year7, count4);
    } else if (movie != null) {
        var year = parseInt(movie.year);
        var year0, year1, year2, year3, year4, year5, year6, year7;
        year0 = year - bucket1;
        year1 = year - bucket2;
        year2 = year - bucket2 - 1;
        year3 = year - bucket3;
        year4 = year - bucket3 - 1;
        year5 = year - bucket4;
        year6 = year - bucket4 - 1;
        year7 = null;
        makeIconClickable("lifetimeWrapper1", year1, year0, count1);
        makeIconClickable("lifetimeWrapper2", year3, year2, count2);
        makeIconClickable("lifetimeWrapper3", year5, year4, count3);
        makeIconClickable("lifetimeWrapper4", year7, year6, count4);
    }
}

function makeIconClickable(divID, beginYear, endYear, count) {
    var div = d3.select("#" + divID);
    div.on("click", function (d) {
        if (div.classed("selectedLifetimeWrapper")) {
            div.attr("class", "lifetimeWrapper");
            filterYears(null, null);
        } else {
            d3.select("#lifetimeWrapper1").attr("class", "lifetimeWrapper");
            d3.select("#lifetimeWrapper2").attr("class", "lifetimeWrapper");
            d3.select("#lifetimeWrapper3").attr("class", "lifetimeWrapper");
            d3.select("#lifetimeWrapper4").attr("class", "lifetimeWrapper");
            div.attr("class", "lifetimeWrapper selectedLifetimeWrapper");
            filterYears(beginYear, endYear);
        }
    });
    div.on("mousemove", function (d) {
        if (actor != null) {
            if (count == 1) {
                $("#lifetimeInfo").html(beginYear + " - " + endYear + ": " + count + " movie");
            } else if (count != -1) {
                $("#lifetimeInfo").html(beginYear + " - " + endYear + ": " + count + " movies");
            }
        } else if (movie != null) {
            if (beginYear != null) {
                if (count == 1) {
                    $("#lifetimeInfo").html("Born between " + beginYear + " and " + endYear + ": " + count + " actor");
                } else if (count != -1) {
                    $("#lifetimeInfo").html("Born between " + beginYear + " and " + endYear + ": " + count + " actors");
                }
            } else {
                if (count == 1) {
                    $("#lifetimeInfo").html("Born before " + endYear + ": " + count + " actor");
                } else if (count != -1) {
                    $("#lifetimeInfo").html("Born before " + (endYear + 1) + ": " + count + " actors");
                }
            }

        }
    });
    div.on("mouseout", function (d) {
        $("#lifetimeInfo").html("");
    });
}

function setIconScale(count1, count2, count3, count4) {
    var max = -1, min = -1;
    if (min == -1 || count1 < min) {
        min = count1;
    }
    if (min == -1 || count2 < min) {
        min = count2;
    }
    if (min == -1 || count3 < min) {
        min = count3;
    }
    if (min == -1 || count4 < min) {
        min = count4;
    }
    if (count1 != 0 && count1 > max) {
        max = count1;
    }
    if (count2 != 0 && count2 > max) {
        max = count2;
    }
    if (count3 != 0 && count3 > max) {
        max = count3;
    }
    if (count4 != 0 && count4 > max) {
        max = count4;
    }
    if (max == -1) {
        max = 1;
    }
    var color1, color2, color3, color4;
    var bucketSize = (max - min) / 4;
    if (count1 == 0) {
        color1 = 0;
    } else {
        color1 = Math.floor((count1 - min) / bucketSize) + 1;
    }
    if (count2 == 0) {
        color2 = 0;
    } else {
        color2 = Math.floor((count2 - min) / bucketSize) + 1;
    }
    if (count3 == 0) {
        color3 = 0;
    } else {
        color3 = Math.floor((count3 - min) / bucketSize) + 1;
    }
    if (count4 == 0) {
        color4 = 0;
    } else {
        color4 = Math.floor((count4 - min) / bucketSize) + 1;
    }
    setIcons(color1, color2, color3, color4, max, count1, count2, count3, count4);
}

function setBiographyText() {
    var field1 = "No actor selected", field2 = "", field3 = "";
    if (actor != null) {
        field1 = actor.name;
        if (actor.birthLocation != "") {
            field2 = actor.birthLocation;
        } else {
            field2 = "Location of birth unknown.";
        }
        if (actor.birthYear != "") {
            field3 = "" + actor.birthYear;
        }
        if (actor.deathYear != "") {
            field3 += " - " + actor.deathYear;
        }
    } else if (movie != null) {
        field1 = movie.title;
        field2 = movie.year;
    }
    document.getElementById("bio_name").innerHTML = field1;
    document.getElementById("bio_birthLocation").innerHTML = field2;
    document.getElementById("bio_birthDeathYear").innerHTML = field3;
}