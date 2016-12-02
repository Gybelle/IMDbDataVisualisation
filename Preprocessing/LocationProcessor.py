# LocationProcessor: Reads raw datafile about the location of films and series and updates movies.csv.
# Author: Michelle Gybels

import csv
import re
import shutil

sourceFileLocation = "Sources/locations.list"
movieFileLocation = "Output/movies.csv"
dictFileLocation = "Output/locationDict.csv"
movieFileUpdatedLocation = "Output/movies_locations.csv"

#Dictionaries
movieData = {}
updatedMovieCount = 0

def locationsToString(locationList):
    locationString = ""

    if locationList:
        for location in locationList:
            locationString += location + "*"

    return locationString[:-1]

def writeDictToFile():
    with open(dictFileLocation, "w", newline="\n", encoding="utf-8") as dict:
        csvWriter = csv.writer(dict, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)

        for movie in movieData:
            title = movie[0].strip()
            year = movie[1]
            locations = locationsToString(movieData.get(movie))
            csvWriter.writerow([title, year, locations])

def addToDictionary(info):
    key = (info[0], info[1])
    location = info[2]

    if key in movieData:
        locationList = movieData.get(key)
        if location not in locationList:
            updatedLocationList = locationList.append(location)

    else:
        movieData[key] = [info[2]]

def isSerie(line):
    if line.find("{") == -1 or line.find("}") == -1:
        return False
    else:
        return True

def extractYear(line):
    yearFound = re.search(r"\(([0-9][0-9][0-9][0-9])\)", line)
    if yearFound:
        return yearFound.group(1)
    else:
        yearFound = re.search(r"\(([0-9][0-9][0-9][0-9])\/", line)
        if yearFound:
            return yearFound.group(1)
    return ""

def extractTitle(line, year):
    yearString = "(" + year + ")"
    title = line[:line.find(yearString)].strip()

    if title != "" and title[0] == "\"" and title[len(title)-1] == "\"":
        title = title[1:len(title)-1]

    return title

def extractLineData(line):
    isMovie = not isSerie(line)
    if isMovie:
        year = extractYear(line)
        title = extractTitle(line, year)
        location = line[line.find("\t"):].strip()
        return (True, (title, year, location))
    else:
        return (False, None)

def isYear(year):
    r = re.compile('[0-9][0-9][0-9][0-9]')
    if re.match(r, year):
        return True
    return False


    # items = line.rstrip('\r\n').split(";")
    # movie = items[1].strip() + " (" + items[2] + ")"
    #
    # rating = ""
    # if movie in ratingsList:
    #     matches += 1
    #     rating = ratingsList[movie]
    #     ratingsList.pop(movie)
    #
    # csvWriter.writerow(items + [rating, ])

def processLocations():
    print("STATE:\t Reading location data from source.")
    sourceFile = open(sourceFileLocation, "r", newline="\n", encoding="utf-8", errors="ignore")
    lineCount = 0

    # Skip header
    header = True
    inDataSection = False
    for line in sourceFile:
        if not header:
            break
        if header and inDataSection and "=" in line:
            header = False
        if "LOCATIONS LIST" in line:
            inDataSection = True

    for line in sourceFile:
        lineCount += 1
        (isMovie, extractedInfo) = extractLineData(line.strip())

        if isMovie:
            addToDictionary(extractedInfo)

    print("STATE:\t Finished reading data from source. %d lines processed." % lineCount)
    writeDictToFile()

def updateMovieDataFile():
    movieFile = open(movieFileLocation, "r", newline="\n", encoding="utf-8")
    tempMovieFile = open(movieFileUpdatedLocation, "w", newline="\n", encoding="utf-8")

    # update header
    csvWriter = csv.writer(tempMovieFile, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)
    header = movieFile.readline().strip('\r\n').split(";") + ["Locations", ]
    csvWriter.writerow(header)

    for line in movieFile:
        movieInfo = readMovieRecord(line)
        movieLocations = findLocationsForMovie(movieInfo)

        locationString = ";" + movieLocations
        updatedLine = line.strip() + locationString + "\n"
        tempMovieFile.write(updatedLine)

    movieFile.close()
    tempMovieFile.close()
    shutil.move(movieFileUpdatedLocation, movieFileLocation)

def readMovieRecord(line):
    movieRecord = line.rstrip('\n').rstrip('\r').split(";")
    title = movieRecord[1].strip()
    year = movieRecord[2]
    if title == "" and not isYear(year):
        title = movieRecord[2]
        year = movieRecord[3]

    return (title, year)

def findLocationsForMovie(movie):
    global updatedMovieCount
    locationList = movieData.get(movie)
    if locationList:
        updatedMovieCount += 1
        return locationsToString(locationList)
    else:
        return ""

def printEndLocationProcMessage():
    print("------------------------------------------------")
    print("Processing Locations Finished")
    print("Locations processed for %d movies/series" % len(movieData))
    print("------------------------------------------------")

def printEndMessage():
    global updatedMovieCount
    print("------------------------------------------------")
    print("Updating Movies Finished")
    print("Movies updated: %d" % updatedMovieCount)
    print("------------------------------------------------")

processLocations()
printEndLocationProcMessage()
updateMovieDataFile()
printEndMessage()