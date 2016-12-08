'''
KeywordProcessor: Reads raw datafile about the keywords of films and series and updates series.csv.
Run this file after running MovieProcessor.py
Author: Michelle Gybels
'''


import csv
import re
import shutil

sourceFileLocation = "Sources/keywords.list"
serieFileLocation = "Output/series.csv"
serieFileUpdatedLocation = "Output/series_keywords.csv"
headerIndicator = "8: THE KEYWORDS LIST"

serieData = {}                  # {key: ((title, year)(season, episodeNr)) value = [keyword]}
updatedSerieCount = 0

def addSerieToDictionary(serieRecord):
    title = serieRecord[0]
    year = serieRecord[3]
    episode = serieRecord[2]  # (season, episodeNr)
    serie = (title, year)
    key = (serie, episode)
    serieData[key] = []       # initialize empty keyword list for every episode

def extractSerieInfo(line):
    serieRecord = line.rstrip('\n').rstrip('\r').split(";")
    title = serieRecord[1]
    episodeTitle = serieRecord[2]
    season = serieRecord[3]
    episode = serieRecord[4]
    year = serieRecord[5]

    return (title, episodeTitle, (season, episode), year)

def readSeriesInMemory():
    serieFile = open(serieFileLocation, "r", newline="\n", encoding="utf-8")
    header = serieFile.readline()

    for line in serieFile:
        serieRecord = extractSerieInfo(line.strip())
        addSerieToDictionary(serieRecord)

    serieFile.close()

def processKeywords():
    print("STATE:\t Reading data from source.")
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
        if headerIndicator in line:
            inDataSection = True

    for line in sourceFile:
        lineCount += 1
        extractedInfo = extractLineData(line.strip())

        updateDictionary(extractedInfo)

    print("STATE:\t Finished reading data from source. %d lines processed." % lineCount)

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

def extractEpisodeInfo(line):
    episodePart = line[line.find("(#"):]
    if line.find("(#") != -1 and episodePart.find(".") != -1:
        episodeSplit = episodePart.split(".")
        season = episodeSplit[0][episodeSplit[0].find("(#")+2:]
        episode = episodeSplit[1][:episodeSplit[1].find(")")]
        return(season, episode)
    return(0,0)

def extractLineData(line):
    year = extractYear(line)
    title = extractTitle(line, year).strip()
    episodeInfo = extractEpisodeInfo(line)
    keyword = line[line.find("\t"):].strip()

    return((title, year, episodeInfo), keyword)

def updateDictionary(info):                     # info: (   (title, year, (season, episode)), keyword)
    #Extract info
    serieInfo = info[0]
    keyword = info[1]
    title = serieInfo[0]
    year = serieInfo[1]
    episode = serieInfo[2] #(season, episode)

    #create dictionary key:  {key: ((title, year)(season, episodeNr)) value = [keyword]}
    key = ((title, year), episode)
    if key in serieData:
        keywordList = serieData.get(key)
        if keyword not in keywordList:
            updatedKeywordList = keywordList.append(keyword)



def updateSeriesFile():
    serieFile = open(serieFileLocation, "r", newline="\n", encoding="utf-8")
    tempSerieFile = open(serieFileUpdatedLocation, "w", newline="\n", encoding="utf-8")

    # update header
    csvWriter = csv.writer(tempSerieFile, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)
    header = serieFile.readline().strip('\r\n').split(";") + ["Keywords", ]

    csvWriter.writerow(header)

    for line in serieFile:
        serieInfo = extractSerieInfo(line)              # (title, episodeTitle, (season, episode), year)
        serieKeywords = findKeywordsForMovie(serieInfo)

        keywordString = ";" + serieKeywords
        updatedLine = line.strip() + keywordString + "\n"
        tempSerieFile.write(updatedLine)

    serieFile.close()
    tempSerieFile.close()
    shutil.move(serieFileUpdatedLocation, serieFileLocation)

def findKeywordsForMovie(serieRecord):                  # (title, episodeTitle, (season, episode), year)
    global updatedSerieCount

    title = serieRecord[0].strip()
    episode = serieRecord[2]
    year = serieRecord[3]  # (season, episode)

    serieKey = ((title, year), episode)   #((title, year)(season, episodeNr)
    keywordList = serieData.get(serieKey)
    if keywordList:
        updatedSerieCount += 1
        return keywordsToString(keywordList)
    else:
        return ""

def keywordsToString(keywordList):
    keywordString = ""

    if keywordList:
        for keyword in keywordList:
            keywordString += keyword + "*"

    return keywordString[:-1]



def printEndMessage():
    global updatedSerieCount
    print("------------------------------------------------")
    print("Updating Series Finished")
    print("Series updated: %d" % updatedSerieCount)
    print("------------------------------------------------")

def printSeriesProcessedMessage():
    print("------------------------------------------------")
    print("Reading Series Finished")
    print("Series stored: %d" % len(serieData))
    print("------------------------------------------------")


readSeriesInMemory()
printSeriesProcessedMessage()
processKeywords()
updateSeriesFile()
printEndMessage()