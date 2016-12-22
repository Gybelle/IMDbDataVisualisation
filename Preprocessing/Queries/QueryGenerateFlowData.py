'''
QueryGenerateFlowData: Calculates the ranges and other data required for the Sankey Diagram.
Run this file after running MovieProcessor.py
Author: Michelle Gybels
'''

import csv
from recordclass import recordclass
import chunk
import math
import re

movieList = []      # (id, title, runtime, filmingDays, budget, gross, rating)

RangeLimits = recordclass('RangeLimits', 'min max')
rangeLimitRuntime = RangeLimits(-1, -1)
rangeLimitFilmingDays = RangeLimits(-1, -1)
rangeLimitBudget = RangeLimits(-1, -1)
rangeLimitGross = RangeLimits(-1, -1)
rangeLimitScore = RangeLimits(0, 10)

Ranges = recordclass('Ranges', 'r1 r2 r3 r4 r5 r6 r7 r8 r9 r10 r11')
rangeScore = Ranges(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
rangeRuntime = Ranges(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
rangeFilmingDays = Ranges(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
rangeBudget = Ranges(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
rangeGross = Ranges(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)

RangeNames = recordclass('RangeNames', 't1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11')
rangeNamesScore = RangeNames("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10")
rangeNamesRuntime = RangeNames("", "", "", "", "", "", "", "", "", "", "")
rangeNamesFilmingDays = RangeNames("", "", "", "", "", "", "", "", "", "", "")
rangeNamesBudget = RangeNames("", "", "", "", "", "", "", "", "", "", "")
rangeNamesGross = RangeNames("", "", "", "", "", "", "", "", "", "", "")


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
    if rangeLimitRuntime.min < 0:
        rangeLimitRuntime.min = 1
    if rangeLimitFilmingDays.min < 0:
        rangeLimitFilmingDays.min = 1
    if rangeLimitBudget.min < 0:
        rangeLimitBudget.min = 1
    if rangeLimitGross.min < 0:
        rangeLimitGross.min = 1

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

    checkMinMax(rangeLimitRuntime, runtime)
    checkMinMax(rangeLimitFilmingDays, filmingDays)
    checkMinMax(rangeLimitBudget, budget)
    checkMinMax(rangeLimitGross, gross)

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
    print("Runtime: %s" % rangeLimitRuntime)
    print("Filming days: %s" % rangeLimitFilmingDays)
    print("Budget: %s" % rangeLimitBudget)
    print("Gross: %s" % rangeLimitGross)
    print("===========================================")

#######################################################################################################################
#                    PART TWO: CREATING BUCKETS FOR EACH RANGE TO DISTRIBUTE THE DATA IN                              #
#######################################################################################################################
def calculateRanges(rangeCount):
    calculateRangesFor(rangeRuntime, rangeCount, rangeLimitRuntime.max)
    calculateRangesFor(rangeFilmingDays, rangeCount, rangeLimitFilmingDays.max)
    calculateRangesFor(rangeBudget, rangeCount, rangeLimitBudget.max)
    calculateRangesFor(rangeGross, rangeCount, rangeLimitGross.max)
    printMessage_CalculatingRangesEnded()

    generateRangeNames()
    printMessage_GeneratingNamesRangesEnded()

def calculateRangesFor(ranges, count, max):
    step = max/11
    if step < 1.0:
        stepSize = 1
    else:
        stepSize = math.floor(step)

    ranges.r1 = 0 + stepSize
    ranges.r2 = ranges.r1 + stepSize
    ranges.r3 = ranges.r2 + stepSize
    ranges.r4 = ranges.r3 + stepSize
    ranges.r5 = ranges.r4 + stepSize
    ranges.r6 = ranges.r5 + stepSize
    ranges.r7 = ranges.r6 + stepSize
    ranges.r8 = ranges.r7 + stepSize
    ranges.r9 = ranges.r8 + stepSize
    ranges.r10 = ranges.r9 + stepSize
    ranges.r11 = ranges.r10 + stepSize

def generateRangeNames():
    generateNamesForRange(rangeRuntime, rangeNamesRuntime)
    generateNamesForRange(rangeFilmingDays, rangeNamesFilmingDays)
    generateNamesForRange(rangeBudget, rangeNamesBudget)
    generateNamesForRange(rangeGross, rangeNamesGross)

def generateNamesForRange(ranges, rangeNames):
    rangeNames.t1 = "[1 - " + numberToString(ranges.r1) + "]"
    rangeNames.t2 = "[" + numberToString(ranges.r1+1) + " - " + numberToString(ranges.r2) + "]"
    rangeNames.t3 = "[" + numberToString(ranges.r2+1) + " - " + numberToString(ranges.r3) + "]"
    rangeNames.t4 = "[" + numberToString(ranges.r3+1) + " - " + numberToString(ranges.r4) + "]"
    rangeNames.t5 = "[" + numberToString(ranges.r4+1) + " - " + numberToString(ranges.r5) + "]"
    rangeNames.t6 = "[" + numberToString(ranges.r5+1) + " - " + numberToString(ranges.r6) + "]"
    rangeNames.t7 = "[" + numberToString(ranges.r6+1) + " - " + numberToString(ranges.r7) + "]"
    rangeNames.t8 = "[" + numberToString(ranges.r7+1) + " - " + numberToString(ranges.r8) + "]"
    rangeNames.t9 = "[" + numberToString(ranges.r8+1) + " - " + numberToString(ranges.r9) + "]"
    rangeNames.t10 = "[" + numberToString(ranges.r9+1) + " - " + numberToString(ranges.r10) + "]"
    rangeNames.t11 = "[" + numberToString(ranges.r10+1) + " - " + numberToString(ranges.r11) + "]"

def numberToString(number):
    return '{0:,}'.format(number)

def printMessage_CalculatingRangesEnded():
    print("===========================================")
    print("CALCULATING RANGES FINISHED")
    print("Runtime: %s" % rangeRuntime)
    print("Filming days: %s" % rangeFilmingDays)
    print("Budget: %s" % rangeBudget)
    print("Gross: %s" % rangeGross)
    print("===========================================")

def printMessage_GeneratingNamesRangesEnded():
    print("===========================================")
    print("GENERATING NAMES FOR RANGES FINISHED")
    print("Runtime: %s" % rangeNamesRuntime)
    print("Filming days: %s" % rangeNamesFilmingDays)
    print("Budget: %s" % rangeNamesBudget)
    print("Gross: %s" % rangeNamesGross)
    print("===========================================")


#######################################################################################################################
#                            PART THREE: DISTRIBUTING DATA ACROSS THE RANGES                                         #
#######################################################################################################################


#######################################################################################################################
#                                               MAIN SCRIPT                                                           #
#######################################################################################################################


movieFile = open("../../Data/movies.csv", "r", encoding="utf8", errors="ignore")
process(movieFile)
movieFile.close()

calculateRanges(len(rangeRuntime))



