'''
ActorPostProcessor: Reads the file with Actor information and splits this into smaller, managable files.
Run this file after running ActorProcessor.py
Author: Anaïs Ools
'''

import csv

actorsList = {}
moviesList = {}
actorIDs = {}
movieIDs = {}
actorBuckets = {}
movieBuckets = {}


def readActorsFromFile(file):
    line = file.readline()  # ignore first line
    count = 0
    for line in file:
        items = line.rstrip('\r\n').split(";")
        name = items[2]
        if items[1] != "":
            name = items[1] + " " + name
        if len(name) > 0:
            letter = name[0].upper()
            if not letter.isalpha():
                letter = "-"
            if letter not in actorsList:
                actorsList[letter] = []
            actorsList[letter].append((items[0], name, items[3], items[4], items[5], items[6], items[7]))
        else:
            print("NOT PROCESSING ", end="")
            print(items)


def writeActorsToFiles():
    for letter in actorsList:
        outputFile = open("Output/actors_" + letter + ".csv", "w", newline="\n", encoding="utf-8")
        csvWriter = csv.writer(outputFile, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)
        csvWriter.writerow(["ActorID", "Name", "IsMale", "BirthYear", "BirthLocation", "DeathYear", "DeathLocation"])

        for actor in actorsList[letter]:
            csvWriter.writerow([actor[0], actor[1], actor[2], actor[3], actor[4], actor[5], actor[6]])
        outputFile.close()


def readMoviesFromFile(file):
    line = file.readline()  # ignore first line
    count = 0
    for line in file:
        items = line.rstrip('\r\n').split(";")
        movie = items[1] + " (" + items[2] + ")"
        letter = movie[0].upper()
        if not letter.isalpha():
            letter = "-"
        if letter not in moviesList:
            moviesList[letter] = []
        moviesList[letter].append(items)


def writeMoviesToFiles():
    for letter in moviesList:
        outputFile= open("Output/movies_" + letter + ".csv", "w", newline="\n", encoding="utf-8")
        csvWriter = csv.writer(outputFile, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)
        csvWriter.writerow(["ID", "Title", "Year", "EndYear", "Genre", "Budget", "Gross", "FilmingDays", "Language", "Locations", "Countries", "Rating", "Duration"])

        for movie in moviesList[letter]:
            csvWriter.writerow(movie)
        outputFile.close()


def replaceIDs():
    for letter in actorsList:
        for actor in actorsList[letter]:
            actorIDs[actor[0]] = letter
    actorsList.clear()
    for letter in moviesList:
        for movie in moviesList[letter]:
            movieIDs[movie[0]] = letter
    moviesList.clear()


def createNewIDMapping():
    inputFile = open("Output/actorsInMovies.csv", "r", newline="\n", encoding="utf-8")
    line = inputFile.readline()
    for line in inputFile:
        items = line.rstrip('\r\n').split(";")
        if items[2] == "True": # is a movie
            actorID = items[0]
            movieID = items[1]
            if actorID in actorIDs and movieID in movieIDs:
                actorBucket = int(int(actorID)/100000)
                movieBucket = int(int(movieID)/ 50000)
                actorID = actorID + actorIDs[actorID]
                movieID = movieID + movieIDs[movieID]
                if actorBucket not in actorBuckets:
                    actorBuckets[actorBucket] = []
                if movieBucket not in movieBuckets:
                    movieBuckets[movieBucket] = []
                actorBuckets[actorBucket].append((actorID, movieID, items[3]))
                movieBuckets[movieBucket].append((actorID, movieID, items[3]))

    print("Writing mapping")
    inputFile.close()
    for actorBucket in actorBuckets:
        outputFile= open("Output/actorMapping_" + str(actorBucket) + ".csv", "w", newline="\n", encoding="utf-8")
        csvWriter = csv.writer(outputFile, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)
        csvWriter.writerow(["ActorID", "MovieID", "Role"])
        for item in actorBuckets[actorBucket]:
            csvWriter.writerow([item[0], item[1], item[2]])
        outputFile.close()
    for movieBucket in movieBuckets:
        outputFile= open("Output/movieMapping_" + str(movieBucket) + ".csv", "w", newline="\n", encoding="utf-8")
        csvWriter = csv.writer(outputFile, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)
        csvWriter.writerow(["MovieID", "ActorID", "Role"])
        for item in movieBuckets[movieBucket]:
            csvWriter.writerow([item[1], item[0], item[2]])
        outputFile.close()



inputFile = open("Output/actors.csv", "r", newline="\n", encoding="utf-8")
print("Reading actors")
readActorsFromFile(inputFile)
# print("Writing actors")
# writeActorsToFiles()
inputFile.close()

inputFile = open("Output/movies.csv", "r", newline="\n", encoding="utf-8")
print("Reading movies")
readMoviesFromFile(inputFile)
# print("Writing movies")
# writeMoviesToFiles()
inputFile.close()

replaceIDs()

print("Reading mapping")
createNewIDMapping()


print("Done!")
