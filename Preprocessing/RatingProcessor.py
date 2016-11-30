# RatingProcessor: Reads raw datafile about ratings and updates movies.csv.
# Author: Anaïs Ools

import csv
import re
from datetime import datetime

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


def matchMovies(file):
    count = 0
    matches = 0
    for line in file:
        item = line.rstrip('\n').rstrip('\r').split(";")
        movie = item[1].strip() + " (" + item[2] + ")"

        if movie in ratingsList:
            matches += 1
            ratingsList.pop(movie)

        count += 1
    print("  [Ratings found for %d movies]" % matches)


def matchSeries(file):
    count = 0
    matches = 0
    for line in file:
        item = line.rstrip('\n').rstrip('\r').split(";")
        title = item[1]
        year = item[5]
        episodeTitle = item[2]
        season = item[3]
        episode = item[4]

        series = "\"" + title.strip() + "\"" + " (" + year + ")"
        if episodeTitle is not "":
            if len(episodeTitle) == 10 and episodeTitle[4] == "-" and episodeTitle[7] == "-":
                episodeTitle = "(" + episodeTitle + ")"
            series += " {" + episodeTitle
            if season is not "0" and episode is not "0":
                series += " (#" + season + "." + episode + ")"
            series += "}"
        elif season is not "0" and episode is not "0":
            series += " {(#" + season + "." + episode + ")}"

        if series in ratingsList:
            matches += 1
            ratingsList.pop(series)

        count += 1
    print("  [Ratings found for %d series]" % matches)


def skipHeader(file, endOfHeader):
    header = True
    for line in file:
        if header and endOfHeader in line.strip():
            header = False


# EXECUTION --------------------------------------------------------------------

print("Started at ", end="")
print(datetime.now().time())

print("Processing ratings...")
ratingsFile = open("Sources/ratings.list", "r", encoding="utf8", errors="ignore")
processRatings(ratingsFile)
ratingsFile.close()
count1 = len(ratingsList)

print("\nAdding ratings to movies...")
movieFile = open("Output/movies.csv", "r", newline="\n", encoding="utf-8")
matchMovies(movieFile)
movieFile.close()

print("\nAdding ratings to series...")
seriesFile = open("Output/series.csv", "r", newline="\n", encoding="utf-8")
matchSeries(seriesFile)
seriesFile.close()

count2 = len(ratingsList)
print("\nRatings remaining: %d\n" % count2)
for item in ratingsList:
    print(item)

print("\n\n\n%d of %d ratings not matched with a movie. %d%% success" % (count2, count1, (count1-count2)/count1*100))

print("Ended at ", end="")
print(datetime.now().time())

