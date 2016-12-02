# RatingProcessor: Reads raw datafile about ratings and updates movies.csv.
# Author: Anaïs Ools

import csv
import re
from datetime import datetime
import shutil

ratingsList = {}

def processRatings(file):
    count = 0
    for line in file:
        if line.startswith("      ") and not line[6:].startswith(" "):
            line = line[25:].strip()
            movie = line[5:].strip()
            rating = line[:5].strip()

            # remove errors from movie titles
            if movie.endswith(" (TV)") or movie.endswith(" (VG)"):
                movie = movie[:-5]
            if movie.endswith(" (V)"):
                movie = movie[:-4]
            if "/" in movie:
                firstPar = movie.find("(")
                secondPar = movie.find(")")
                slash = movie.rfind("/")
                if firstPar < slash and slash < secondPar:
                    movie = movie[:slash] + ")"
            movie = movie.strip()

            # add to ratings list
            ratingsList[movie] = rating
            count += 1
    print("  [%d ratings processed]" % len(ratingsList))


def matchMovies(file, csvWriter):
    count = 0
    matches = 0
    for line in file:
        items = line.rstrip('\r\n').split(";")
        movie = items[1].strip() + " (" + items[2] + ")"

        rating = ""
        if movie in ratingsList:
            matches += 1
            rating = ratingsList[movie]
            ratingsList.pop(movie)

        csvWriter.writerow(items + [rating,])
        count += 1
    print("  [Ratings found for %d movies]" % matches)


def matchSeries(file, csvWriter):
    count = 0
    matches = 0
    for line in file:
        items = line.rstrip('\n').rstrip('\r').split(";")
        title = items[1]
        year = items[5]
        episodeTitle = items[2]
        season = items[3]
        episode = items[4]

        series = "\"" + title.strip() + "\"" + " (" + year + ")"
        if episodeTitle is not "":
            series += " {" + episodeTitle
            if season is not "0":
                series += " (#" + season + "." + episode + ")"
            series += "}"
        elif season is not "0":
            series += " {(#" + season + "." + episode + ")}"

        rating = ""
        if series in ratingsList:
            matches += 1
            rating = ratingsList[series]
            ratingsList.pop(series)

        csvWriter.writerow(items + [rating,])
        count += 1
    print("  [Ratings found for %d series]" % matches)


def skipHeader(file, endOfHeader):
    header = True
    for line in file:
        if header and endOfHeader in line.strip():
            header = False


def process(fileName, containsMovies):
    # Open files
    inputFileName = "Output/" + fileName + ".csv"
    outputFileName = "Output/" + fileName + "_ratings.csv"
    inputFile = open(inputFileName, "r", newline="\n", encoding="utf-8")
    outputFile = open(outputFileName, "w", newline="\n", encoding="utf-8")

    # Update header
    csvWriter = csv.writer(outputFile, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)
    headerList = inputFile.readline().strip('\r\n').split(";") + ["Rating", ]
    csvWriter.writerow(headerList)

    # Update data
    if containsMovies:
        matchMovies(inputFile, csvWriter)
    else:
        matchSeries(inputFile, csvWriter)

    # Close and save
    inputFile.close()
    outputFile.close()
    shutil.move(outputFileName, inputFileName)  # replace old movie csv with new one


# EXECUTION --------------------------------------------------------------------

print("Started at ", end="")
print(datetime.now().time())

print("Processing ratings...")
ratingsFile = open("Sources/ratings.list", "r", encoding="utf8", errors="ignore")
processRatings(ratingsFile)
ratingsFile.close()
count1 = len(ratingsList)

print("\nAdding ratings to movies...")
process("movies", True)

print("\nAdding ratings to series...")
process("series", False)

count2 = len(ratingsList)
# print("\nRatings remaining: %d\n" % count2)
# for item in ratingsList:
#     print(item)

print("\n%d of %d ratings not matched with a movie. %d%% success" % (count2, count1, (count1-count2)/count1*100))

print("Ended at ", end="")
print(datetime.now().time())

