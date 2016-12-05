'''
LocationProcessor: Reads raw datafile about the keywords of films and series and updates series.csv.
Author: Michelle Gybels
'''


import csv
import re
import shutil

sourceFileLocation = "Sources/keywords.list"
serieFileLocation = "Output/series.csv"
serieFileUpdatedLocation = "Output/series_keywords.csv"
headerIndicator = "8: THE KEYWORDS LIST"

serieData = {}
updatedSerieCount = 0

def addSerieToDictionary(serieRecord):
    title = serieRecord[0]
    episode = serieRecord[2]  # (season, episodeNr)
    key = (title, episode)
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
    sourceFile = open(sourceFileLocation, "r", newline="\n", encoding="utf-8")

    print("Write this!")    #TODO write this :)


readSeriesInMemory()
processKeywords()