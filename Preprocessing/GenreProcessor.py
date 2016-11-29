# Movieprocessor: Reads raw datafile about the genres of films and series and converts this to .csv.
# Authors: Michelle Gybels

import csv

inputFile = open("Sources/genres.list", "r", encoding="utf8", errors="ignore")
outputLocationMovies = "Output/movies.csv"

#Dictionaries
movieData = {}

def writeToFiles(lineCount, info):
    print("LineCount: %d -- Time to write!" % lineCount)
    #TODO in progress :-)

def extractLineData(line):
    title = line[line.find("\"") + 1:line[line.find("\"") + 1:].find("\"") + 1]
    oriLine = line
    line = line[line.find(title) + 1:]

    yearString = line[line.find("(") + 1:line.find(")")]
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

    return (isMovie, (title, year, genre))


def processGenres():
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

    with open(outputLocationMovies, 'a', newline="\n", encoding="utf-8") as moviesOutput:
        movieWriter = csv.writer(moviesOutput, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)

        for line in inputFile:
            lineCount += 1
            (isMovie, extractedInfo) = extractLineData(line.strip())

            if isMovie:
                writeToFiles(lineCount, extractedInfo)









processGenres()