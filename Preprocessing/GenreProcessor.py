'''
GenreProcessor: Reads raw datafile about the genres of films and series and updates movies.csv.
Run this file after running MovieProcessor.py
Author: Michelle Gybels
'''


import csv
import re
import shutil

sourceFileLocation = "Sources/genres.list"
outputLocationMovies = "Output/movies.csv"
outputLocationGenreDict = "Output/genresDict.csv"
outputLocationMoviesUpdated = "Output/movies_genre.csv"

#Dictionaries
movieData = {}
updatedMovieCount = 0

def writeDictToFile():
    with open(outputLocationGenreDict, "w", newline="\n", encoding="utf-8") as dict:
        csvWriter = csv.writer(dict, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)

        for movie in movieData:
            title = movie[0].strip()
            year = movie[1]
            genres = genresToString(movieData.get(movie))
            csvWriter.writerow([title, year, genres])

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
    print("STATE:\t Reading genres data from source.")
    lineCount = 0

    #Skip header
    header = True
    inDataSection = False
    sourceFile = open(sourceFileLocation, "r", newline="\n", encoding="utf-8", errors="ignore")
    for line in sourceFile:
        if not header:
            break
        if header and inDataSection and "=" in line:
            header = False
        if "THE GENRES LIST" in line and "8:" in line:
            inDataSection = True


    for line in sourceFile:
        lineCount += 1
        (isMovie, extractedInfo) = extractLineData(line.strip())

        addToDictionary(extractedInfo)

    sourceFile.close()
    print("STATE:\t Finished reading data from source. %d lines processed." % lineCount)
    writeDictToFile()


def genresToString(genreList):
    genreString = ""

    if genreList:
        for genre in genreList:
            genreString += genre + "*"

    return genreString[:-1]

def readDictInMemory():
    movieData.clear()
    with open(outputLocationGenreDict, "r", newline="\n", encoding="utf-8") as dict:
        csvReader = csv.reader(dict)
        for row in csvReader:
            rowString = ""

            for element in row:
                rowString += "," + element

            movieRecord = rowString.split(";")

            iRecord = -1
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
            title = title[1:]
            title.strip()

            genreList = ""
            if iRecord+1 < len(movieRecord):
                genreList = movieRecord[iRecord+1]

            if genreList != "":
                key = (title, year)
                movieData[key] = genreList

def updateMovieDataFile():
    movieFile = open(outputLocationMovies, "r", newline="\n", encoding="utf-8")
    tempMovieFile = open(outputLocationMoviesUpdated, "w", newline="\n", encoding="utf-8")

    #update header
    csvWriter = csv.writer(tempMovieFile, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)
    header = movieFile.readline().strip('\r\n').split(";") + ["Genre", ]
    csvWriter.writerow(header)

    for line in movieFile:
        movieInfo = readMovieRecord(line)
        movieGenres = findGenresForMovie(movieInfo)

        if movieGenres != "":
            genreString = ";" + movieGenres
            updatedLine = line.strip() + genreString + "\n"
            tempMovieFile.write(updatedLine)

    movieFile.close()
    tempMovieFile.close()
    shutil.move(outputLocationMoviesUpdated, outputLocationMovies)

def readMovieRecord(line):
    movieRecord = line.rstrip('\n').rstrip('\r').split(";")
    title = movieRecord[1].strip()
    year = movieRecord[2]
    if title == "" and not isYear(year):
        title = movieRecord[2]
        year = movieRecord[3]

    return (title, year)

def isYear(year):
    r = re.compile('[0-9][0-9][0-9][0-9]')
    if re.match(r, year):
        return True
    return False

def findGenresForMovie(movie):
    global updatedMovieCount
    genreList = movieData.get(movie)
    if genreList:
        updatedMovieCount += 1
        return genreList
    else:
        return ""

def printEndGenreProcMessage():
    print("------------------------------------------------")
    print("Processing Genres Finished")
    print("Genres processed for %d movies/series" % len(movieData))
    print("------------------------------------------------")

def printEndMessage():
    global updatedMovieCount
    print("------------------------------------------------")
    print("Updating Movies Finished")
    print("Movies updated: %d" % updatedMovieCount)
    print("------------------------------------------------")

processGenres()
readDictInMemory()
printEndGenreProcMessage()
updateMovieDataFile()
printEndMessage()







