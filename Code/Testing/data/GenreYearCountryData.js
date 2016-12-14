var genreYearCountryData = [];
parseDate = d3.time.format("%Y").parse;

d3.dsv(';')("GenreYearCountry.csv", function (error, data) {
    data.forEach(function (d) {
        d.Year = parseDate(d.Year);
        d.Count = +d.Count;
        d.Rating = +d.AvgRating;
    });
    genreYearCountryData = data;
});

function genreYearCountryData_sortByYear() {
    genreYearCountryData.sort(function (a, b) {
        return d3.ascending(a.Year, b.Year);
    });
}

function genreYearCountryData_filterYear(beginYear, endYear) {
    beginYear = parseDate(beginYear);
    endYear = parseDate(endYear);
    return genreYearCountryData.filter(function (d) {
        return d.year >= beginYear && d.year <= endYear;
    });
}

function genreYearCountryData_filterGenre(genreFilter) {
    if (genreFilter != null) {
        return genreYearCountryData.filter(function (d) {
            return genreFilter.indexOf(d.Genre) >= 0;
        });
    }
    return genreYearCountryData;
}

function genreYearCountryData_filterCountry(countryFilter) {
    if (countryFilter != null) {
        return genreYearCountryData.filter(function (d) {
            return d.Country == countryFilter;
        });
    }
    return genreYearCountryData;
}



