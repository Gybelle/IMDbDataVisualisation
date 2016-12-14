var genreYearCountryData = [];
parseDate = d3.time.format("%Y").parse;

d3.dsv(';')("data/GenreYearCountry.csv", function (error, data) {
    data.forEach(function (d) {
        d.Year = parseDate(d.Year);
        d.Count = +d.Count;
        d.Rating = +d.AvgRating;
    });
    genreYearCountryData = data;
});

function sortByYear(data) {
    data.sort(function (a, b) {
        return d3.ascending(a.Year, b.Year);
    });
}

function filterYear(data, beginYear, endYear) {
    beginYear = parseDate(beginYear);
    endYear = parseDate(endYear);
    return data.filter(function (d) {
        return d.Year >= beginYear && d.Year <= endYear;
    });
}

function filterGenre(data, genreFilter) {
    if (genreFilter != null) {
        return data.filter(function (d) {
            return genreFilter.indexOf(d.Genre) >= 0;
        });
    }
    return data;
}

function filterCountry(data, countryFilter) {
    if (countryFilter != null) {
        return data.filter(function (d) {
            return d.Country == countryFilter;
        });
    }
    return data;
}



