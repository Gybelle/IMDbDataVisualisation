'''
QueryGenerateFlowData: Calculates the ranges and other data required for the Sankey Diagram.
Run this file after running MovieProcessor.py
Author: Michelle Gybels
'''

import csv
from recordclass import recordclass
import math
import re

movieList = []      # (id, title, runtime, filmingDays, budget, gross, rating)
Range = recordclass('Range', 'min max')
rangeRuntime = Range(-1, -1)
rangeFilmingDays = Range(-1, -1)
rangeBudget = Range(-1, -1)
rangeGross = Range(-1, -1)
rangeScore = Range(0, 10)

#######################################################################################################################
#                    PART ONE: PROCESSING MOVIES.CSV AND CALCULATING RANGES MIN AND MAX                               #
#######################################################################################################################
def process(file):
    header = file.readline()

    for line in file:
        movieRecord = processLine(line)
        updateMinMax(movieRecord)
        addToMovieList(movieRecord)

    fixRanges()
    printMessage_ProcessingEnded()

def fixRanges():
    if rangeRuntime.min < 0:
        rangeRuntime.min = 1
    if rangeFilmingDays.min < 0:
        rangeFilmingDays.min = 1
    if rangeBudget.min < 0:
        rangeBudget.min = 1
    if rangeGross.min < 0:
        rangeGross.min = 1

def processLine(line):
    # Get data
    items = line.strip("\r\n").split(";")
    id = items[0]
    title = items[1]
    duration = processDuration(items[12])
    filmingDays = items[7]
    budget = items[5]
    gross = items[6]
    rating = items[11]

    # Process
    if rating:
        try:
            rating = float(rating)
        except:
            print("----rating")
            print(line)
    else:
        rating = None

    if filmingDays:
        try:
            filmingDays = int(filmingDays)
        except:
            print(line)
    else:
        filmingDays = None

    if budget:
        try:
            budget = int(budget)
        except:
            print(line)
    else:
        budget = None

    if gross:
        try:
            gross = int(gross)
        except:
            print(line)
    else:
        gross = None

    return (id, title, duration, filmingDays, budget, gross, rating)

def processDuration(durationString):
    duration = None

    if durationString:
        if durationString.find(":") != -1:
            duration = extractDigitalTime(durationString)
        elif durationString.find("min") != -1:
            duration = extractTextTime(durationString)
        elif durationString.find("\'") != -1 or durationString.find("\"") != -1:
            duration = extractDMSTime(durationString)
        elif durationString.find(".") != -1:
            duration = extractDecimalTime(durationString)
        else:
            try:
                duration = int(durationString)
            except:
                duration = None

    return duration

def extractDigitalTime(durationString):
    splittedDur = durationString.split(":")

    if len(splittedDur) == 3:
        try:
            hour = int(re.sub("[^0-9]", "", splittedDur[0]))
            min = int(re.sub("[^0-9]", "", splittedDur[1]))
            sec = splittedDur[2]
            totalMinutes = hour * 60 + min
            min = str(totalMinutes) +  "." + sec
        except:
            print(splittedDur)
    elif len(splittedDur) == 2:
        minutes = splittedDur[0]
        sec = splittedDur[1]
        min = minutes + "." + sec
    else:
        min = None
        print(splittedDur)

    return extractDecimalTime(min)
    #print("here")

def extractTextTime(durationString):
    splittedDur = durationString.split("min")
    min = splittedDur[0].strip()

    if min.find("hour") != -1:
        splittedMin = min.split("hour")
        hour = splittedMin[0].strip()
        min = re.sub("[^0-9]", "", splittedMin[1])
        totalMinutes = 60 * int(hour) + int(min)
        min = str(totalMinutes)

    return extractDecimalTime(min)

def extractDMSTime(durationString):
    splittedDur = durationString.split("\'")
    min = splittedDur[0]

    if len(splittedDur) > 1:
        sec = re.sub("[^0-9]", "", splittedDur[1])
    else:
        sec = "0"

    durationToText = "" + min + "." + sec

    return extractDecimalTime(durationToText)

def extractDecimalTime(durationString):
    try:
        duration = math.ceil(float(durationString))
        return duration
    except:
        return None

def addToMovieList(record):
    movieList.append(record)

def updateMinMax(record):           # (id, title, runtime, filmingDays, budget, gross, rating)
    runtime = record[2]
    filmingDays = record[3]
    budget = record[4]
    gross = record[5]

    checkMinMax(rangeRuntime, runtime)
    checkMinMax(rangeFilmingDays, filmingDays)
    checkMinMax(rangeBudget, budget)
    checkMinMax(rangeGross, gross)

def checkMinMax(range, value):
    min = range.min
    max = range.max
    if value:
        if min == -1:
            min = value
        elif min > value:
            min = value
        if max < value:
            max = value

    range.min = min
    range.max = max

def printMessage_ProcessingEnded():
    print("===========================================")
    print("PROCESSING FILE FINISHED")
    print("Runtime: %s" % rangeRuntime)
    print("Filming days: %s" % rangeFilmingDays)
    print("Budget: %s" % rangeBudget)
    print("Gross: %s" % rangeGross)
    print("===========================================")

#######################################################################################################################
#                    PART TWO: CREATING BUCKETS FOR EACH RANGE TO DISTRIBUTE THE DATA IN                              #
#######################################################################################################################

#######################################################################################################################
#                            PART THREE: DISTRIBUTING DATA ACCROSS THE RANGES                                         #
#######################################################################################################################


movieFile = open("../../Data/movies.csv", "r", encoding="utf8", errors="ignore")
process(movieFile)
movieFile.close()