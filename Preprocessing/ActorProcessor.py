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

def processActors(inputFile, csvWriter, endOfHeader, isMale):
    skipHeader(inputFile, endOfHeader, 3)
    entries = 0
    ignored = 0
    actorID = -1
    for line in inputFile:
        line = line.rstrip('\n')
        if line is "": # end of an actor's entry
            actorFirstName = ""
            actorLastName = ""
        else:
            # Actor name
            if not line.startswith("\t"):
                actorName = line[:line.find("\t")]
                actorInfo = actorName.split(", ")
                actorLastName = actorInfo[0]
                if len(actorInfo) > 1:
                    actorFirstName = actorInfo[1]
                else:
                    actorFirstName = None
                actorID += 1
                line = line[line.find("\t")+1:]

            line = line.strip()
            if line.endswith(">") and "<" in line:
                line = line[:line.rfind("<")].strip()

            # Role
            role = None
            if "[" in line and "]" in line:
                role = line[line.rfind("[")+1:line.rfind("]")]
                line = line[:line.rfind("[")].strip()

            # Movie
            movie = correctTitle(line)
            if movie in moviesList:
                if actorName not in actorsList:
                    actorsList[actorName] = (actorID, actorFirstName, actorLastName, isMale)
                elif actorName in actorsList:
                    actorID = actorsList[actorName][0]
                movieID, isMovie = moviesList[movie]
                csvWriter.writerow([actorID, movieID, isMovie, role])
            else:
                ignored += 1
            entries += 1
        if entries % 500000 == 0:
            print("Processed lines: %d" % entries)
    print("Done, %d entries processed. [Ignored: %d, Saved: %d, %d%%]" % (entries, ignored, entries-ignored, ((entries-ignored)/entries)*100))
    print("Done, %d actors in actorslist." % len(actorsList))


def correctTitle(title):
    title = title.strip()
    while title.endswith(")") and "(" in title:
        pars = title[title.rfind("(")+1:title.rfind(")")]
        if "as " in pars or "credit" in pars or "voice" in pars or "archive" in pars:
            title = title[:title.rfind("(")].strip()
        else:
            break

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


def processBiographies(file, endOfHeader):
    skipHeader(file, endOfHeader, 1)
    entries = 0
    matched = 0
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
                    entries += 1
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
                        matched += 1
                name = None
                bornInfo = None
                deathInfo = None
    print("Biographies matched: %d of %d, %d%%" % (matched, entries, (1-matched/entries)*100))


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


def readMovies(movieFile, seriesFile):
    for line in movieFile:
        items = line.rstrip('\r\n').split(";")
        movie = items[1].strip() + " (" + items[2] + ")"
        moviesList[movie] = (items[0], True)
    for line in seriesFile:
        items = line.rstrip('\n').rstrip('\r').split(";")
        series = "\"" + items[1].strip() + "\"" + " (" + items[5] + ")"
        if items[2] is not "":
            series += " {" + items[2]
            if items[3] is not "0":
                series += " (#" + items[3] + "." + items[4] + ")"
            series += "}"
        elif items[3] is not "0":
            series += " {(#" + items[3] + "." + items[4] + ")}"
        moviesList[series] = (items[0], False)


# EXECUTION --------------------------------------------------------------------

print("Started at ", end="")
print(datetime.now().time())

# READ MOVIES AND SERIES
print("Reading movie and series data...")
movieFile = open("Output/movies.csv", "r", newline="\n", encoding="utf-8")
seriesFile = open("Output/series.csv", "r", newline="\n", encoding="utf-8")
readMovies(movieFile, seriesFile)
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

# WRITE ACTORS TO FILE
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