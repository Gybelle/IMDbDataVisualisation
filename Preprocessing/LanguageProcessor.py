'''
LanguageProcessor: Reads raw datafile about languages and updates movies.csv.
Run this file after running MovieProcessor.py
Author: Anaïs Ools
'''

import csv
from datetime import datetime
import shutil

languagesList = {}

def processLanguages(file):
    count = 0
    # Skip header
    for line in file:
        if "=" in line:
            break

    for line in file:
        line = line.strip()
        if "\t" in line and "(????)" not in line:
            movie = correctTitle(line.split("\t")[0])
            language = line.split("\t")[1].strip()

            # add to languages list
            if movie in languagesList:
                languagesList[movie].append(language)
            else:
                languagesList[movie] = [language]
            count += 1
    print("  [%d languages processed]" % len(languagesList))


def correctTitle(title):
    title = title.replace("{{SUSPENDED}}", "").strip()
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
    return title.strip()


def listToString(list):
    languageString = ""
    if list:
        for language in list:
            languageString += language + "*"
    return languageString[:-1]


def matchMovies(file, csvWriter):
    count = 0
    matches = 0
    for line in file:
        items = line.rstrip('\r\n').split(";")
        movie = items[1].strip() + " (" + items[2] + ")"

        language = ""
        if movie in languagesList:
            matches += 1
            language = languagesList[movie]
            languagesList.pop(movie)

        csvWriter.writerow(items + [listToString(language),])
        count += 1
    print("  [Languages found for %d movies]" % matches)


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

        language = ""
        if series in languagesList:
            matches += 1
            language = languagesList[series]
            languagesList.pop(series)

        csvWriter.writerow(items + [listToString(language), ])
        count += 1
    print("  [Languages found for %d series]" % matches)


def skipHeader(file, endOfHeader):
    header = True
    for line in file:
        if header and endOfHeader in line.strip():
            header = False


def process(fileName, containsMovies):
    # Open files
    inputFileName = "Output/" + fileName + ".csv"
    outputFileName = "Output/" + fileName + "_languages.csv"
    inputFile = open(inputFileName, "r", newline="\n", encoding="utf-8")
    outputFile = open(outputFileName, "w", newline="\n", encoding="utf-8")

    # Update header
    csvWriter = csv.writer(outputFile, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)
    headerList = inputFile.readline().strip('\r\n').split(";") + ["Language", ]
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

print("Processing languages...")
languagesFile = open("Sources/language.list", "r", encoding="utf8", errors="ignore")
processLanguages(languagesFile)
languagesFile.close()
count1 = len(languagesList)

print("\nAdding languages to movies...")
process("movies", True)

print("\nAdding languages to series...")
process("series", False)

count2 = len(languagesList)
print("\nLanguages remaining: %d\n" % count2)
for item in languagesList:
    print(item)

print("\n%d of %d languages not matched with a movie. %d%% success" % (count2, count1, (count1-count2)/count1*100))

print("Ended at ", end="")
print(datetime.now().time())

