# Movieprocessor: Reads raw datafile about the genres of films and series and converts this to .csv.
# Author: Michelle Gybels

import csv
import re

inputFile = open("Sources/genres.list", "r", encoding="utf8", errors="ignore")
outputLocationMovies = "Output/movies.csv"
outputLocationUpdatedMovies = "Output/moviesGenre.csv"

#Dictionaries
movieData = {}
moviesNotFound = []

def writeDictToFile():
    with open("Output/genresDict.csv", "w", newline="\n", encoding="utf-8") as dict:
        csvWriter = csv.writer(dict, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)

        for movie in movieData:
            title = movie[0]
            year = movie[1]
            genres = genresToString(movieData.get(movie))
            csvWriter.writerow([title, year, genres])

def createMoviesFile():
    with open(outputLocationUpdatedMovies, "w", newline="\n", encoding="utf-8") as movieGenreOutput:
        csvWriter = csv.writer(movieGenreOutput, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)
        csvWriter.writerow(["ID", "Title", "Year", "EndYear", "Genre", "Country", "Rating", "Duration", "GrossRevenue", "Budget", "FilmingDates", "Location"])

def readMovieRecord(row):
    rowString = ""

    for element in row:
        rowString += "," + element

    movieRecord = rowString.split(";")

    iRecord = 0
    id = movieRecord[iRecord]
    r = re.compile('[0-9][0-9][0-9][0-9]')  # To find year

    yearFound = False
    title = ""
    year = 0

    while iRecord < len(movieRecord) - 1 and not yearFound:
        iRecord += 1
        if re.fullmatch(r, movieRecord[iRecord]):
            yearFound = True
            year = movieRecord[iRecord]
            title = title[:-1]
        else:
            titlePart = movieRecord[iRecord]
            title += titlePart
            if titlePart != "":
                title += ";"
    title.strip()

    if iRecord < len(movieRecord) - 9:
        # Read the other fields
        endYear = movieRecord[iRecord + 1]
        genre = movieRecord[iRecord + 2]
        country = movieRecord[iRecord + 3]
        rating = movieRecord[iRecord + 4]
        duration = movieRecord[iRecord + 5]
        grossRevenue = movieRecord[iRecord + 6]
        budget = movieRecord[iRecord + 7]
        filmingDates = movieRecord[iRecord + 8]
        location = movieRecord[iRecord + 9]
    else:
        (endYear, genre, country, rating, duration, grossRevenue, budget, filmingDates, location) =  ("", "", "", "", "", "", "", "", "")

    return (id, title, year, endYear, genre, country, rating, duration, grossRevenue, budget, filmingDates, location)

def findGenresForMovie(movie):
    if movie in movieData:
        genreList = movieData.get(movie)
        print(genreList) #TODO deelte
    else:
        moviesNotFound.append(movie)
        #print("Not found: %s, %s" % (movie[0], movie[1]))


def writeToFile(lineCount):
    print("STATE:\t Updating %d movies in movies.csv" % len(movieData))

    with open(outputLocationMovies, 'r', newline="\n", encoding="utf-8") as moviesOutput, open(outputLocationUpdatedMovies, "w", newline="\n", encoding="utf-8") as movieGenreOutput:
        movieWriter = csv.writer(movieGenreOutput, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)
        movieReader = csv.reader(moviesOutput)

        iterRows = iter(movieReader)
        next(iterRows)
        for row in movieReader:
            movieRecord = readMovieRecord(row)
            genreList = findGenresForMovie((movieRecord[1].strip(), movieRecord[2]))

            #TODO write this ...






def addToDictionary(info):
    key = (info[0], info[1])
    genre = info[2]

    if key in movieData:
        genreList = movieData.get(key)

        if genre not in genreList:
            updatedGenreList = genreList.append(genre)

    else:
        movieData[key] = [info[2]]


def extractLineData(line):
    r = re.compile('[0-9][0-9][0-9][0-9]')  # To find year
    title = line[line.find("\"") + 1:line[line.find("\"") + 1:].find("\"") + 1]
    oriLine = line
    line = line[line.find(title) + 1:]

    yearString = line[line.find("(") + 1:line.find(")")]
    if re.match(r, yearString):
        yearMatch = re.match(r, yearString).group()
        yearString = yearMatch

    if yearString.isdigit():
        year = int(yearString)  # year
    else:
        year = 0

    if title == "":
        title = oriLine[:oriLine.find("(" + yearString + ")")]
        isMovie = False
    else:
        isMovie = True

    genre = line[line.find("\t"):].strip()

    title = title.replace("'", "\'")
    title.strip()

    return (isMovie, (title, year, genre))


def processGenres():
    print("STATE:\t Reading data from source.")
    lineCount = 0

    #Skip header
    header = True
    inGenreSection = False
    for line in inputFile:
        if not header:
            break
        if header and inGenreSection and "=" in line:
            header = False
        if "THE GENRES LIST" in line and "8:" in line:
            inGenreSection = True


    for line in inputFile:
        lineCount += 1
        (isMovie, extractedInfo) = extractLineData(line.strip())

        addToDictionary(extractedInfo)


    print("STATE:\t Finished reading data from source. %d lines processed." % lineCount)
    writeDictToFile()
    writeToFile(lineCount)


def genresToString(genreList):
    genreString = ""

    if genreList:
        for genre in genreList:
            genreString += genre + "*"

    return genreString[:-1]




processGenres()



