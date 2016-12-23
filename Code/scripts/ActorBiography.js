bucket1 = 0;
bucket2 = 10;
bucket3 = 25;
bucket4 = 50;
actor = null;

function setBiographyWidgetActor(newActor) {
    if (newActor == null || newActor.birthYear == "") {
        setIcons(true, 6, 6, 6, 6);
        actor = null;
        return;
    }
    actor = newActor;
    currentAge = 0;
    if (actor.deathYear == "") {
        var currentYear = new Date().getFullYear();
        console.log(currentYear);
        var birthYear = parseInt(actor.birthYear);
        console.log(birthYear);
        var currentAge = currentYear - birthYear;
    } else {
        var deathYear = parseInt(actor.deathYear);
        console.log(deathYear);
        var birthYear = parseInt(actor.birthYear);
        console.log(birthYear);
        var currentAge = deathYear - birthYear;
    }
    console.log(currentAge);
    var color1 = 0, color2 = 0, color3 = 0, color4 = 0;
    if (currentAge < bucket1) {
        color1 = 6;
    }
    if (currentAge < bucket2) {
        color2 = 6;
    }
    if (currentAge < bucket3) {
        color3 = 6;
    }
    if (currentAge < bucket4) {
        color4 = 6;
    }
    setIcons(actor.isMale, color1, color2, color3, color4);
}

function setBiographyWidgetMovieMap(yearMovieMap) {
    console.log(yearMovieMap);
    if (actor == null) {
        return;
    }
    var birthYear = parseInt(actor.birthYear);
    var deathYear = new Date().getFullYear() + 1000;
    if (actor.deathYear != "") {
        var deathYear = parseInt(actor.deathYear);
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
            console.log(age);
        }
    }
    console.log(count1 + " " + count2 + " " + count3 + " " + count4);
    setIconScale(count1, count2, count3, count4);
}

function setIcons(male, color1, color2, color3, color4) {
    var genderLetter = "m";
    if (!male) {
        genderLetter = "f";
    }
    document.getElementById("lifetimeImg1").src = "img/AgeIcons/" + genderLetter + "_age1_col" + color1 + ".png";
    document.getElementById("lifetimeImg2").src = "img/AgeIcons/" + genderLetter + "_age2_col" + color2 + ".png";
    document.getElementById("lifetimeImg3").src = "img/AgeIcons/" + genderLetter + "_age3_col" + color3 + ".png";
    document.getElementById("lifetimeImg4").src = "img/AgeIcons/" + genderLetter + "_age4_col" + color4 + ".png";
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
    console.log("Min: " + min + ", max: " + max);
    var color1, color2, color3, color4;
    if (count1 == 0) {
        color1 = 0;
    } else {

    }

}