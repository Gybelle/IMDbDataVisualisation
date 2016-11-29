# Movieprocessor: Reads raw datafile about movies and converts this to .csv.
# Authors: Michelle Gybels en Anaïs Ools

import csv

inputFile = open("Sources/movies.list", "r", encoding="utf8", errors="ignore")
outputLocationMovies = "Output/movies.csv"
outputLocationSeries = "Output/series.csv"

processedMovies = 0
ignoredMovies = 0
savedMovies = 0
processedSeries = 0
ignoredSeries = 0
savedSeries = 0

def createMoviesFile():
    with open(outputLocationMovies, "w", newline="\n", encoding="utf-8") as movieOutput:
        csvWriter = csv.writer(movieOutput, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)
        csvWriter.writerow(["ID", "Title", "Year", "EndYear", "Genre", "Country", "Rating", "Duration", "GrossRevenue", "Budget", "FilmingDates", "Location"])

def createSeriesFile():
    with open(outputLocationSeries, "w", newline="\n", encoding="utf-8") as serieOutput:
        csvWriter = csv.writer(serieOutput, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)
        csvWriter.writerow(
            ["ID", "Title", "EpisodeTitle", "Season", "Episode", "Year", "Year", "EndYear", "Genre", "Country", "Rating"])

def extractLineData(line):
    isMovie = True

    title = line[line.find("\"") + 1:line[line.find("\"") + 1:].find("\"") + 1]     #title
    oriLine = line
    line = line[line.find(title)+1:]

    yearString = line[line.find("(") + 1:line.find(")")]
    if yearString.isdigit():
        year = int(yearString)                                                      #year
    else:
        year = 0

    if title == "":
        title = oriLine[:oriLine.find("("+yearString+")")]

    if line[::-1][4] == "-":
        isMovie = False
        (season, episode) = (0, 0)                                                  #season, episode
        episodeTitle = ""                                                           #episodeTitle

    if "{" in line:
        isMovie = False
        episodeInfo = line[line.find("{") + 1:line.find("}")]
        episodeNumber = episodeInfo[::-1][episodeInfo[::-1].find(")") + 1: episodeInfo[::-1].find("(")][::-1]
        if "#" in episodeNumber and "." in episodeNumber[episodeNumber.find("#"):]:
            splittedNumber = episodeNumber[1:].split(".")
            season = splittedNumber[len(splittedNumber)-2]                          #season
            episode = splittedNumber[len(splittedNumber)-1]                         #episode
            episodeTitle = episodeInfo[0:episodeInfo.find("(#")].strip()            #episodeTitle
        else:
            (season, episode) = (0, 0)                                              #season, episode
            episodeTitle = episodeInfo[episodeInfo.find("(") + 1: episodeInfo.find(")")] #episodeTitle

    endYearString = line[::-1][:4][::-1]
    if endYearString.isdigit():
        endYear = int(endYearString)                                                #endYear
    else:
        endYear = 0                                                                 #endYear


    #minor fixes in years
    if isMovie and year == 0:
        year = endYear

    if isMovie:
        return (isMovie, (title, year, endYear))
    else:
        return (isMovie, (title, year, endYear, episodeTitle, season, episode))

def writeMovieToFile(id, info, csvWriter):
    global processedMovies, ignoredMovies, savedMovies
    processedMovies += 1

    #Row: ["ID", "Title", "Year", "EndYear", "Genre", "Country", "Rating", "Duration", "GrossRevenue", "Budget", "FilmingDates", "Location"]
    #Info: (title, year, endYear)

    #Ignore if movie has no year
    if info[1] == 0 :
        ignoredMovies += 1
    else:
        csvWriter.writerow([id, info[0], info[1], info[2], "", "", "", "", "", "", "", ""])
        savedMovies += 1

def writeSerieToFile(id, info, csvWriter):
    global processedSeries, ignoredSeries, savedSeries
    processedSeries += 1

    #Row: ["ID", "Title", "EpisodeTitle", "Season", "Episode", "Year", "Year", "EndYear", "Genre", "Country", "Rating"]
    #Info: (title, year, endYear, episodeTitle, season, episode)
    csvWriter.writerow([id, info[0], info[3], info[4], info[5], info[1], info[2], "", "", "", "", "", "", "", ""])
    savedSeries += 1

def processMovies():
    createMoviesFile()
    createSeriesFile()
    movieID = 0

    # Skip header
    header = True
    for line in inputFile:
        if not header:              # Skips the empty line
            break
        if header and "=" in line:
            header = False

    with open(outputLocationMovies, 'a', newline="\n", encoding="utf-8") as moviesOutput, open(outputLocationSeries, "a", newline="\n", encoding="utf-8") as serieOutput:
        movieWriter = csv.writer(moviesOutput, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)
        serieWriter = csv.writer(serieOutput, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)

        for line in inputFile:
            movieID += 1
            (isMovie, extractedMovieInfo) = extractLineData(line.strip())

            if isMovie:
                writeMovieToFile(movieID, extractedMovieInfo, movieWriter)
            else:
                writeSerieToFile(movieID, extractedMovieInfo, serieWriter)

            if movieID % 100000 == 0:
                print("STATE: %d movies processed. " % movieID)


def doneMessage():
    print("Done!")
    print("Movies processed: %d [Ignored: %d, Saved: %d]" % (processedMovies, ignoredMovies, savedMovies))
    print("Series processed: %d [Ignored: %d, Saved: %d]" % (processedSeries, ignoredSeries, savedSeries))


processMovies()
doneMessage()