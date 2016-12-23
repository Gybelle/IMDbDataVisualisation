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
flowDict = {}       # (t1, t2) , count

RangeLimits = recordclass('RangeLimits', 'min max')
rangeLimitRuntime = RangeLimits(-1, -1)
rangeLimitFilmingDays = RangeLimits(-1, -1)
rangeLimitBudget = RangeLimits(-1, -1)
rangeLimitGross = RangeLimits(-1, -1)
rangeLimitScore = RangeLimits(0, 10)

Ranges11 = recordclass('Ranges11', 'r1 r2 r3 r4 r5 r6 r7 r8 r9 r10 r11')
Ranges14 = recordclass('Ranges14', 'r1 r2 r3 r4 r5 r6 r7 r8 r9 r10 r11 r12 r13 r14')
Ranges15 = recordclass('Ranges15', 'r1 r2 r3 r4 r5 r6 r7 r8 r9 r10 r11 r12 r13 r14 r15')
Ranges16 = recordclass('Ranges16', 'r1 r2 r3 r4 r5 r6 r7 r8 r9 r10 r11 r12 r13 r14 r15 r16')
rangeScore = Ranges11(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
rangeRuntime = Ranges14(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
rangeFilmingDays = Ranges15(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
rangeBudget = Ranges14(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
rangeGross = Ranges16(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)

RangeNames = recordclass('RangeNames', 't1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11')
rangeNamesScore = Ranges11("S: 0", "S: 1", "S: 2", "S: 3", "S: 4", "S: 5", "S: 6", "S: 7", "S: 8", "S: 9", "S: 10")
rangeNamesRuntime = Ranges14("", "", "", "", "", "", "", "", "", "", "", "", "", "")
rangeNamesFilmingDays = Ranges15("", "", "", "", "", "", "", "", "", "", "", "", "", "", "")
rangeNamesBudget = Ranges14("", "", "", "", "", "", "", "", "", "", "", "", "", "")
rangeNamesGross = Ranges16("", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "")


#######################################################################################################################
#                    PART ONE: PROCESSING MOVIES.CSV AND CALCULATING RANGES MIN AND MAX                               #
#######################################################################################################################
def process(file, outputFile):
    header = file.readline()
    outputFile.write("id;title;gross\n")

    for line in file:
        movieRecord = processLine(line, outputFile)
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

def processLine(line, outputFile):
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
            outputFile.write("%s;%s;%d\n" % (id, title, gross))
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
def calculateRanges():
    calculateRunTimeRanges()
    generateRunTimeNames()

    calculateFilmingDaysRanges()
    generateFilmingDaysNames()

    calculateBudgetRanges()
    generateBudgetNames()

    calculateGrossRanges()
    generateGrossNames()

    #checkRanges()

    printMessage_CalculatingRangesEnded()
    printMessage_GeneratingNamesRangesEnded()

def calculateRunTimeRanges():
    rangeRuntime.r1 = 5
    rangeRuntime.r2 = 15
    rangeRuntime.r3 = 30
    rangeRuntime.r4 = 45
    rangeRuntime.r5 = 60
    rangeRuntime.r6 = 75
    rangeRuntime.r7 = 90
    rangeRuntime.r8 = 105
    rangeRuntime.r9 = 120
    rangeRuntime.r10 = 135
    rangeRuntime.r11 = 150
    rangeRuntime.r12 = 180
    rangeRuntime.r13 = 240
    rangeRuntime.r14 = rangeLimitRuntime.max + 1

def generateRunTimeNames():
    rangeNamesRuntime.r1 = "R: < 5min"
    rangeNamesRuntime.r2 = "R: [5min - 15min["
    rangeNamesRuntime.r3 = "R: [15min - 30min["
    rangeNamesRuntime.r4 = "R: [30min - 45min["
    rangeNamesRuntime.r5 = "R: [45min - 1h["
    rangeNamesRuntime.r6 = "R: [1h - 1h15["
    rangeNamesRuntime.r7 = "R: [1h15 - 1h30["
    rangeNamesRuntime.r8 = "R: [1h30 - 1h45["
    rangeNamesRuntime.r9 = "R: [1h45 - 2h["
    rangeNamesRuntime.r10 = "R: [2h - 2h15["
    rangeNamesRuntime.r11 = "R: [2h15 - 2h30["
    rangeNamesRuntime.r12 = "R: [2h30 - 3h["
    rangeNamesRuntime.r13 = "R: [3h - 4h["
    rangeNamesRuntime.r14 = "R: >= 4h"

def calculateFilmingDaysRanges():
    rangeFilmingDays.r1 = 5
    rangeFilmingDays.r2 = 15
    rangeFilmingDays.r3 = 30
    rangeFilmingDays.r4 = 45
    rangeFilmingDays.r5 = 60
    rangeFilmingDays.r6 = 75
    rangeFilmingDays.r7 = 90
    rangeFilmingDays.r8 = 105
    rangeFilmingDays.r9 = 120
    rangeFilmingDays.r10 = 135
    rangeFilmingDays.r11 = 150
    rangeFilmingDays.r12 = 165
    rangeFilmingDays.r13 = 180
    rangeFilmingDays.r14 = 195
    rangeFilmingDays.r15 = rangeLimitFilmingDays.max + 1

def generateFilmingDaysNames():
    rangeNamesFilmingDays.r1 = "F: < 5"
    rangeNamesFilmingDays.r2 = "F: [5-15["
    rangeNamesFilmingDays.r3 = "F: [15-30["
    rangeNamesFilmingDays.r4 = "F: [30-45["
    rangeNamesFilmingDays.r5 = "F: [45-60["
    rangeNamesFilmingDays.r6 = "F: [60-75["
    rangeNamesFilmingDays.r7 = "F: [75-90["
    rangeNamesFilmingDays.r8 = "F: [90-105["
    rangeNamesFilmingDays.r9 = "F: [105-120["
    rangeNamesFilmingDays.r10 = "F: [120-135["
    rangeNamesFilmingDays.r11 = "F: [135-150["
    rangeNamesFilmingDays.r12 = "F: [150-165["
    rangeNamesFilmingDays.r13 = "F: [165-180["
    rangeNamesFilmingDays.r14 = "F: [180-190["
    rangeNamesFilmingDays.r15 = "F: >= 190"

def calculateBudgetRanges():
    rangeBudget.r1 = 50
    rangeBudget.r2 = 100
    rangeBudget.r3 = 500
    rangeBudget.r4 = 1000
    rangeBudget.r5 = 5000
    rangeBudget.r6 = 10000
    rangeBudget.r7 = 50000
    rangeBudget.r8 = 100000
    rangeBudget.r9 = 500000
    rangeBudget.r10 = 1000000
    rangeBudget.r11 = 5000000
    rangeBudget.r12 = 10000000
    rangeBudget.r13 = 50000000
    rangeBudget.r14 = rangeLimitBudget.max + 1

def generateBudgetNames():
    rangeNamesBudget.r1 = "B: < 50"
    rangeNamesBudget.r2 = "B: [50-100["
    rangeNamesBudget.r3 = "B: [100-500["
    rangeNamesBudget.r4 = "B: [500-1000["
    rangeNamesBudget.r5 = "B: [1,000-5,000["
    rangeNamesBudget.r6 = "B: [5,000-10,000["
    rangeNamesBudget.r7 = "B: [10,000-50,000["
    rangeNamesBudget.r8 = "B: [50,000-100,000["
    rangeNamesBudget.r9 = "B: [100,000-500,000["
    rangeNamesBudget.r10 = "B: [500,000-1,000,000["
    rangeNamesBudget.r11 = "B: [1,000,000-5,000,000["
    rangeNamesBudget.r12 = "B: [5,000,000-10,000,000["
    rangeNamesBudget.r13 = "B: [10,000,000-50,000,000["
    rangeNamesBudget.r14 = "B: >= 50,000,000"

def calculateGrossRanges():
    rangeGross.r1 = 50
    rangeGross.r2 = 100
    rangeGross.r3 = 500
    rangeGross.r4 = 1000
    rangeGross.r5 = 5000
    rangeGross.r6 = 10000
    rangeGross.r7 = 50000
    rangeGross.r8 = 100000
    rangeGross.r9 = 500000
    rangeGross.r10 = 1000000
    rangeGross.r11 = 5000000
    rangeGross.r12 = 10000000
    rangeGross.r13 = 50000000
    rangeGross.r14 = 100000000
    rangeGross.r15 = 500000000
    rangeGross.r16 = rangeLimitGross.max + 1

def generateGrossNames():
    rangeNamesGross.r1 = "G: < 50"
    rangeNamesGross.r2 = "G: [50-100["
    rangeNamesGross.r3 = "G: [100-500["
    rangeNamesGross.r4 = "G: [500-1,000["
    rangeNamesGross.r5 = "G: [1,000-5,000["
    rangeNamesGross.r6 = "G: [5,000-10,000["
    rangeNamesGross.r7 = "G: [10,000-50,000["
    rangeNamesGross.r8 = "G: [50,000-100,000["
    rangeNamesGross.r9 = "G: [100,000-500,000["
    rangeNamesGross.r10 = "G: [500,000-1,000,000["
    rangeNamesGross.r11 = "G: [1,000,000-5,000,000["
    rangeNamesGross.r12 = "G: [5,000,000-10,000,000["
    rangeNamesGross.r13 = "G: [10,000,000-50,000,000["
    rangeNamesGross.r14 = "G: [50,000,000-100,000,000["
    rangeNamesGross.r15 = "G: [100,000,000-500,000,000["
    rangeNamesGross.r16 = "G: >= 500,000,000"

def calculateRangesFor(ranges, max):
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

def checkRanges():
    checkRange(rangeRuntime, rangeNamesRuntime, 2)
    checkRange(rangeFilmingDays, rangeNamesFilmingDays, 3)
    checkRange(rangeBudget, rangeNamesBudget, 4)
    checkRange(rangeGross, rangeNamesGross, 5)

def printMessage_CalculatingRangesEnded():
    print("===========================================")
    print("CALCULATING RANGES FINISHED")
    print("Runtime: %s" % rangeRuntime)
    print("Filming days: %s" % rangeFilmingDays)
    print("Budget: %s" % rangeBudget)
    print("Gross: %s" % rangeGross)
    print("===========================================")

def checkRange(ranges, rangeNames, indexRecord):
    runtimeDistribution = {}

    for record in movieList:
        value = record[indexRecord]
        if value:
            #print(value)
            rangeFound = False
            index = -1
            while not rangeFound:
                index += 1
                if value < ranges[index]:
                    #print("%d, %d" % (value, ranges[index]))
                    rangeFound = True
                    if rangeNames[index] in runtimeDistribution:
                        count = runtimeDistribution[rangeNames[index]] + 1
                        runtimeDistribution[rangeNames[index]] = count
                    else:
                        runtimeDistribution[rangeNames[index]] = 1

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
def distributeDataInRanges():
    initializeDictionary()
    updateDictionary()
    writeDictToFile()
    #TODO write this further

def initializeDictionary():
    #Pairs: [Runtime, FilmingDays]  [FilmingDays, Budget]   [Budget, Revenue]   [Revenue, Score]
    initializeDictPairs(rangeNamesRuntime, rangeNamesFilmingDays)
    initializeDictPairs(rangeNamesFilmingDays, rangeNamesBudget)
    initializeDictPairs(rangeNamesBudget, rangeNamesGross)
    initializeDictPairs(rangeNamesGross, rangeNamesScore)

def initializeDictPairs(range1, range2):
    for x in range1:
        for y in range2:
            pair = (x, y)
            flowDict[pair] = 0

def updateDictionary():
    for record in movieList:
        runtimeValue = record[2]
        filmingDaysValue = record[3]
        budgetValue = record[4]
        grossValue = record[5]
        ratingValue = record[6]

        pairList = []

        if(runtimeValue != None and filmingDaysValue != None):
            rangeInfo1 = (rangeRuntime, rangeNamesRuntime, runtimeValue)
            rangeInfo2 = (rangeFilmingDays, rangeNamesFilmingDays, filmingDaysValue)
            pairList.append(createDictPair(rangeInfo1, rangeInfo2))

        if(filmingDaysValue != None and budgetValue != None):
            rangeInfo1 = (rangeFilmingDays, rangeNamesFilmingDays, filmingDaysValue)
            rangeInfo2 = (rangeBudget, rangeNamesBudget, budgetValue)
            pairList.append(createDictPair(rangeInfo1, rangeInfo2))

        if (budgetValue != None and grossValue != None):
            rangeInfo1 = (rangeBudget, rangeNamesBudget, budgetValue)
            rangeInfo2 = (rangeGross, rangeNamesGross, grossValue)
            pairList.append(createDictPair(rangeInfo1, rangeInfo2))

        if (grossValue != None and ratingValue != None):
            rangeInfo1 = (rangeGross, rangeNamesGross, grossValue)
            rangeInfo2 = (rangeScore, rangeNamesScore, ratingValue)
            pairList.append(createDictPair(rangeInfo1, rangeInfo2))

        updateDictCount(pairList)

def createDictPair(rangeInfo1, rangeInfo2):
    rangeValue1 = getRange(rangeInfo1)
    rangeValue2 = getRange(rangeInfo2)

    if rangeValue1 == None or rangeValue1 == None:
        print("Not Found!")
        print(rangeInfo1)
        print(rangeInfo2)

    return (rangeValue1, rangeValue2)

def getRange(rangeInfo):
    (ranges, rangeNames, value) = rangeInfo

    rangeFound = False
    index = -1
    while not rangeFound:
        index += 1
        if value < ranges[index]:
            rangeFound = True
            return rangeNames[index]

    return None

def updateDictCount(pairList):
    for pair in pairList:
        count = flowDict[pair] + 1
        flowDict[pair] = count

def writeDictToFile():
    file = open("../../Data/flowData.json", "w", encoding="utf8", errors="ignore")
    file.write("{\n\"links\": [\n")
    for element in flowDict:
        file.write("{\"source\":\"%s\",\"target\":\"%s\",\"value\":\"%d\"},\n" % (element[0], element[1], flowDict[element]))
    file.write("] , \n")

    file.write("\"nodes\": [\n")
    for element in flowDict:
        file.write("{\"name\":\"%s\"},\n{\"name\":\"%s\"},\n" % (element[0], element[1]))
    file.write("] } \n")
#######################################################################################################################
#                                               MAIN SCRIPT                                                           #
#######################################################################################################################


movieFile = open("../../Data/movies.csv", "r", encoding="utf8", errors="ignore")
runtimeDataFile = open("../../Data/moviesGross.csv", "w", encoding="utf8", errors="ignore")
process(movieFile, runtimeDataFile)
movieFile.close()
runtimeDataFile.close()

calculateRanges()
distributeDataInRanges()



