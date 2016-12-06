'''
RunningTimesProcessor: Reads raw datafile about running times and updates movies.csv.
Run this file after running MovieProcessor.py
Author: Anaïs Ools
'''

import csv
import re
from datetime import datetime
import shutil

runningTimesDictionary = {}


def processRunningTimes(file):
    count = 0
    # Skip header
    for line in file:
        if "=" in line:
            break

    r = re.compile("[0-9]+")
    for line in file:
        title = line[:line.find("\t")].strip()
        title = title.replace("{{SUSPENDED}}", "").strip()
        runningTime = line[line.find("\t"):].strip()
        if not r.match(runningTime):
            while "(" in runningTime and ")" in runningTime:
                runningTime = runningTime[:runningTime.find("(")] + runningTime[runningTime.find(")")+1:]
            if ":" in runningTime:
                runningTime = runningTime[runningTime.find(":")+1:]
            runningTime = runningTime.strip()

            # remove errors from movie titles
            if title.endswith(" (TV)") or title.endswith(" (VG)"):
                title = title[:-5]
            if title.endswith(" (V)"):
                title = title[:-4]
            if "/" in title:
                firstPar = title.find("(")
                secondPar = title.find(")")
                slash = title.rfind("/")
                if firstPar < slash and slash < secondPar:
                    title = title[:slash] + ")"
            title = title.strip()

            # add to running times list
            if title not in runningTimesDictionary:
                runningTimesDictionary[title] = runningTime
        count += 1
    print("  [%d running times processed]" % len(runningTimesDictionary))


def matchMovies(file, csvWriter):
    count = 0
    matches = 0
    for line in file:
        items = line.rstrip('\r\n').split(";")
        movie = items[1].strip() + " (" + items[2] + ")"

        rating = ""
        if movie in runningTimesDictionary:
            matches += 1
            rating = runningTimesDictionary[movie]
            runningTimesDictionary.pop(movie)

        csvWriter.writerow(items + [rating,])
        count += 1
    print("  [Running times found for %d movies]" % matches)


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
        if series in runningTimesDictionary:
            matches += 1
            rating = runningTimesDictionary[series]
            runningTimesDictionary.pop(series)

        csvWriter.writerow(items + [rating,])
        count += 1
    print("  [Running times found for %d series]" % matches)


def skipHeader(file, endOfHeader):
    header = True
    for line in file:
        if header and endOfHeader in line.strip():
            header = False


def process(fileName, containsMovies):
    # Open files
    inputFileName = "Output/" + fileName + ".csv"
    outputFileName = "Output/" + fileName + "_runningtimes.csv"
    inputFile = open(inputFileName, "r", newline="\n", encoding="utf-8")
    outputFile = open(outputFileName, "w", newline="\n", encoding="utf-8")

    # Update header
    csvWriter = csv.writer(outputFile, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)
    headerList = inputFile.readline().strip('\r\n').split(";") + ["Duration", ]
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

print("Processing running times...")
runningTimesFile = open("Sources/running-times.list", "r", encoding="utf8", errors="ignore")
processRunningTimes(runningTimesFile)
runningTimesFile.close()
count1 = len(runningTimesDictionary)

print("\nAdding running times to movies...")
process("movies", True)

print("\nAdding running times to series...")
process("series", False)

count2 = len(runningTimesDictionary)
# print("\nRunning times remaining: %d\n" % count2)
# for item in runningTimesDictionary:
#     print(item)

print("\n%d of %d running times not matched with a movie. %d%% success" % (count2, count1, (count1-count2)/count1*100))

print("Ended at ", end="")
print(datetime.now().time())

