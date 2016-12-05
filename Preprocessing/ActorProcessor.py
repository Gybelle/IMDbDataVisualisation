'''
ActorProcessor: Reads raw datafile about actors and the biographies and converts this to .csv.
Run this file after running MovieProcessor.py
Author: Anaïs Ools
'''

import csv
import re
from datetime import datetime

actorsList = {}
moviesList = {}
seriesList = {}

def processActors(inputFile, csvWriter, endOfHeader, isMale):
    skipHeader(inputFile, endOfHeader, 3)
    entries = 0
    ignored = 0
    actorID = -1
    actorExists = False
    for line in inputFile:
        line = line.rstrip('\n')
        if line is "": # end of an actor's entry
            actorFirstName = ""
            actorLastName = ""

        else:
            # Actor name
            if not line.startswith("\t"):
                actorName = line[:line.find("\t")]
                actorSplit = actorName.split(", ")
                if len(actorSplit) > 1:
                    actorFirstName = actorSplit[1]
                    actorLastName = actorSplit[0]
                else:
                    actorFirstName = None
                    actorLastName = actorSplit[0]
                actorID += 1
                actorExists = False
            line = line[line.find("\t")+1:]

            # Title
            title = line[:line.find("(")].strip()
            isMovie = True
            if title.startswith("\"") and title.endswith("\""):
                title = title[1:len(title)-1]
                isMovie = False

            # Year
            year = line[line.find("(")+1:line.find(")")]

            # Role
            if "[" in line and "]" in line:
                role = line[line.find("[")+1:line.find("]")]
            else:
                role = None

            # Episode info
            if not isMovie and "{" in line and "}" in line:
                episodeInfo = line[line.find("{")+1:line.find("}")]
                if "(#" in episodeInfo and ")" in episodeInfo:
                    episodeName = episodeInfo[:episodeInfo.find("(#")]
                    seasonInfo = episodeInfo[episodeInfo.find("(#")+2:]
                    season = seasonInfo[:seasonInfo.find(".")]
                    episode = seasonInfo[seasonInfo.find(".")+1:seasonInfo.find(")")]
                else:
                    episodeName = episodeInfo
                    season = None
                    episode = None
            elif isMovie:
                episodeName = None
                season = None
                episode = None

            # MovieID or SeriesID
            movieOrSeriesID = None
            if isMovie:
                find = title + "--" + year
                if find in moviesList:
                    movieOrSeriesID = moviesList[find]
            else:
                find = title + "--" + year + "--" + xstr(episodeName) + "--" + xstr(season) + "--" + xstr(episode)
                if find in seriesList:
                    movieOrSeriesID = seriesList[find]
                elif episodeName and episodeName.startswith("(") and episodeName.endswith(")"):
                    find = title + "--" + year + "--" + episodeName[1:len(episodeName)-1] + "--" + xstr(season) + "--" + xstr(episode)
                    if find in seriesList:
                        movieOrSeriesID = seriesList[find]

            if movieOrSeriesID:
                csvWriter.writerow([actorID, movieOrSeriesID, isMovie, role])
                if not actorExists:
                    actorsList[actorName] = (actorID, actorFirstName, actorLastName, isMale)
                    actorExists = True
            else:
                ignored += 1
            entries += 1

        if entries % 500000 == 0:
            print("Processed lines: %d" % entries)
    print("Done, %d entries found. [Ignored: %d, Saved: %d]" % (entries, ignored, entries-ignored))
    print("Done, %d entries in actorslist." % len(actorsList))


def processBiographies(file, endOfHeader):
    skipHeader(file, endOfHeader, 1)
    entries = 0
    name = None
    bornInfo = None
    deathInfo = None
    for line in file:
        line = line.rstrip('\n')
        if line is not "" and line[:2] in ["NM", "DB", "DD"] or "-----" in line:
            # print(line)
            if line[:2] == "NM":
                name = line[4:]
            elif line[:2] == "DB":
                bornInfo = line[4:]
            elif line[:2] == "DD":
                deathInfo = line[4:]
            elif "-----" in line:
                if name and (bornInfo or deathInfo):
                    if name in actorsList:
                        bornDate = None
                        bornLocation = None
                        if bornInfo:
                            bornDate = stringToDate(bornInfo[:bornInfo.find(", ")])
                            if bornDate:
                                bornLocation = bornInfo[bornInfo.find(", ")+2:]
                        deathDate = None
                        deathLocation = None
                        if deathInfo:
                            deathDate = stringToDate(deathInfo[:deathInfo.find(", ")])
                            if deathDate:
                                deathLocation = deathInfo[deathInfo.find(", ") + 2:]
                                if "(" in deathLocation:
                                    deathLocation = deathLocation[:deathLocation.find("(")].strip()
                        bio = (bornDate, bornLocation, deathDate, deathLocation)
                        actorsList[name] = actorsList[name] + bio
                        entries += 1
                name = None
                bornInfo = None
                deathInfo = None
        if entries == breakpoint:
            break
    print("Biographies matched: %d" % entries)


def stringToDate(s):
    r = re.compile('[0-9][0-9][0-9][0-9]')
    s = re.findall(r, s)
    if len(s) > 0:
        return s[0]
    return None


def skipHeader(file, endOfHeader, additionalSkipLines):
    header = True
    skipLines = 0
    for line in file:
        if not header:
            if skipLines == 0:
                break
            else:
                skipLines -= 1
        if header and endOfHeader in line.strip():
            header = False
            skipLines = additionalSkipLines


def xstr(s):
    if s is None:
        return ""
    return str(s)


# EXECUTION --------------------------------------------------------------------

print("Started at ", end="")
print(datetime.now().time())

# READ MOVIES AND SERIES
print("Reading movie and series data...")
movieFile = open("Output/movies.csv", "r", newline="\n", encoding="utf-8")
for line in movieFile:
    item = line.rstrip('\n').rstrip('\r').split(";")
    result = item[1] + "--" + item[2]
    moviesList[result] = item[0]
seriesFile = open("Output/series.csv", "r", newline="\n", encoding="utf-8")
for line in seriesFile:
    item = line.rstrip('\n').rstrip('\r').split(";")
    result = item[1] + "--" + item[5] + "--" + item[2] + "--" + item[3] + "--" + item[4]
    seriesList[result] = item[0]
# print(moviesList)
# print(seriesList)
movieFile.close()
seriesFile.close()

# OUTPUT FILE
outputFile = open("Output/actorsInMovies.csv", "w", newline="\n", encoding="utf-8")
csvWriter = csv.writer(outputFile, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)
csvWriter.writerow(["ActorID", "MovieOrSeriesID", "IsMovie", "Role"])

# ACTORS
print("Reading actors ----------------------------------------------------------------------------------------------------------------------------------------------")
inputFile = open("Sources/actors.list", "r", encoding="utf8", errors="ignore")
processActors(inputFile, csvWriter, "THE ACTORS LIST", True)
inputFile.close()

# ACTRESSES
print("Reading actresses -------------------------------------------------------------------------------------------------------------------------------------------")
inputFile2 = open("Sources/actresses.list", "r", encoding="utf8", errors="ignore")
processActors(inputFile2, csvWriter, "THE ACTRESSES LIST", False)
inputFile2.close()

outputFile.close()

# BIOGRAPHIES
print("Reading biographies -----------------------------------------------------------------------------------------------------------------------------------------")
inputFile3 = open("Sources/biographies.list", "r", encoding="utf8", errors="ignore")
processBiographies(inputFile3, "BIOGRAPHY LIST")
inputFile3.close()

outputFile = open("Output/actors.csv", "w", newline="\n", encoding="utf-8")
csvWriter = csv.writer(outputFile, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)
csvWriter.writerow(["ActorID", "FirstName", "LastName", "IsMale", "BirthYear", "BirthLocation", "DeathYear", "DeathLocation"])
for item in actorsList:
    t = actorsList[item]
    if len(t) == 4:
        csvWriter.writerow([t[0], t[1], t[2], t[3], None, None, None, None])
    elif len(t) == 8:
        csvWriter.writerow([t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7]])
outputFile.close()

print("Ended at ", end="")
print(datetime.now().time())