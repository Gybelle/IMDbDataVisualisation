bucket1 = 0;
bucket2 = 10;
bucket3 = 25;
bucket4 = 50;
actor = null;
actorAge = null;

function setBiographyWidgetActor(newActor) {
    if (newActor == null || newActor.birthYear == "") {
        setIcons(6, 6, 6, 6, 1);
        setBiographyText();
        actor = null;
        return;
    }
    actor = newActor;
    getActorAge();
    setIcons(0, 0, 0, 0, 1);
    setBiographyText();
}

function setBiographyWidgetMovieMap(yearMovieMap) {
    if (actor == null) {
        return;
    }
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
                count1++;
            } else if (age <= bucket3) {
                count2++;
            } else if (age <= bucket4) {
                count3++;
            } else if (age > bucket4) {
                count4++;
            }
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

function setIcons(color1, color2, color3, color4, max) {
    male = true;
    if (actor != null) {
        male = actor.isMale;
    }
    var genderLetter = "m";
    if (!male) {
        genderLetter = "f";
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
    console.log("Age icons: " + genderLetter + " " + color1 + " " + color2 + " " + color3 + " " + color4);
    document.getElementById("lifetimeImg1").src = "img/AgeIcons/" + genderLetter + "_age1_col" + color1 + ".png";
    document.getElementById("lifetimeImg2").src = "img/AgeIcons/" + genderLetter + "_age2_col" + color2 + ".png";
    document.getElementById("lifetimeImg3").src = "img/AgeIcons/" + genderLetter + "_age3_col" + color3 + ".png";
    document.getElementById("lifetimeImg4").src = "img/AgeIcons/" + genderLetter + "_age4_col" + color4 + ".png";
    document.getElementById("lifetimeLegend").src = "img/AgeIcons/" + genderLetter + "_legend.png";
    if (max == 1) {
        document.getElementById("lifetimeLegendLabelTop").innerHTML = max + " movie";
    } else {
        document.getElementById("lifetimeLegendLabelTop").innerHTML = max + " movies";
    }
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
    setIcons(color1, color2, color3, color4, max);
}

function setBiographyText() {
    var name, birthLocation, ages;
    if (actor == null) {
        name = "No actor selected";
        birthLocation = "";
        ages = "";
    } else {
        name = actor.name;
        if (actor.birthLocation != "") {
            birthLocation = actor.birthLocation;
        } else {
            birthLocation = "Location of birth unknown.";
        }
        ages = "";
        if (actor.birthYear != "") {
            ages = "" + actor.birthYear;
        }
        if (actor.deathYear != "") {
            ages += " - " + actor.deathYear;
        }
    }
    document.getElementById("bio_name").innerHTML = name;
    document.getElementById("bio_birthLocation").innerHTML = birthLocation;
    document.getElementById("bio_birthDeathYear").innerHTML = ages;

}