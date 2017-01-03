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

printScores = False
printScoreClasses = True


movieList = []      # (id, title, runtime, filmingDays, budget, gross, rating, year)
flowDict = {}       # (t1, t2) , count
moviePaths = {}

RangeLimits = recordclass('RangeLimits', 'min max')
rangeLimitRuntime = RangeLimits(-1, -1)
rangeLimitFilmingDays = RangeLimits(-1, -1)
rangeLimitBudget = RangeLimits(-1, -1)
rangeLimitGross = RangeLimits(-1, -1)
rangeLimitScore = RangeLimits(0, 10)

Ranges4 = recordclass('Ranges4', 'r1 r2 r3 r4')
Ranges7 = recordclass('Ranges7', 'r1 r2 r3 r4 r5 r6 r7')
Ranges8 = recordclass('Ranges8', 'r1 r2 r3 r4 r5 r6 r7 r8')
Ranges11 = recordclass('Ranges11', 'r1 r2 r3 r4 r5 r6 r7 r8 r9 r10 r11')
Ranges14 = recordclass('Ranges14', 'r1 r2 r3 r4 r5 r6 r7 r8 r9 r10 r11 r12 r13 r14')
Ranges15 = recordclass('Ranges15', 'r1 r2 r3 r4 r5 r6 r7 r8 r9 r10 r11 r12 r13 r14 r15')

rangeScore = Ranges11(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
rangeScoreClasses = Ranges4(0, 0, 0, 0)
rangeRuntime = Ranges7(0, 0, 0, 0, 0, 0, 0)
rangeFilmingDays = Ranges8(0, 0, 0, 0, 0, 0, 0, 0)
rangeBudget = Ranges11(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
rangeGross = Ranges4(0, 0, 0, 0)

RangeNames = recordclass('RangeNames', 't1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11')
rangeNamesScore = Ranges11("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10")
rangeNamesScoreClasses = Ranges4("", "", "", "")
rangeNamesRuntime = Ranges7("", "", "", "", "", "", "")
rangeNamesFilmingDays = Ranges8("", "", "", "", "", "", "", "")
rangeNamesBudget = Ranges11("", "", "", "", "", "", "", "", "", "", "")
rangeNamesGross = Ranges4("", "", "", "")


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
    year = items[2]
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

    return (id, title, duration, filmingDays, budget, gross, rating, year)

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

    if printScoreClasses:
        calculateScoreClassRanges()
        generateScoreClassNames()

    #checkRanges()

    printMessage_CalculatingRangesEnded()
    printMessage_GeneratingNamesRangesEnded()

def calculateRunTimeRanges():
    rangeRuntime.r1 = 15 + 1
    rangeRuntime.r2 = 30 + 1
    rangeRuntime.r3 = 60 + 1
    rangeRuntime.r4 = 90 + 1
    rangeRuntime.r5 = 120 + 1
    rangeRuntime.r6 = 180 + 1
    rangeRuntime.r7 = rangeLimitRuntime.max + 1

def generateRunTimeNames():
    rangeNamesRuntime.r1 = "Less than 15 minutes"
    rangeNamesRuntime.r2 = "30 minutes"
    rangeNamesRuntime.r3 = "1 hour"
    rangeNamesRuntime.r4 = "1.5 hours"
    rangeNamesRuntime.r5 = "2 hours"
    rangeNamesRuntime.r6 = "3 hours"
    rangeNamesRuntime.r7 = "More than 3 hours"

def calculateFilmingDaysRanges():
    rangeFilmingDays.r1 = 7
    rangeFilmingDays.r2 = 30
    rangeFilmingDays.r3 = 60
    rangeFilmingDays.r4 = 90
    rangeFilmingDays.r5 = 120
    rangeFilmingDays.r6 = 150
    rangeFilmingDays.r7 = 180
    rangeFilmingDays.r8 = rangeLimitFilmingDays.max + 1

def generateFilmingDaysNames():
    rangeNamesFilmingDays.r1 = "Less than a week"
    rangeNamesFilmingDays.r2 = "One month"
    rangeNamesFilmingDays.r3 = "Two months"
    rangeNamesFilmingDays.r4 = "Three months"
    rangeNamesFilmingDays.r5 = "Four months"
    rangeNamesFilmingDays.r6 = "Five months"
    rangeNamesFilmingDays.r7 = "Six months"
    rangeNamesFilmingDays.r8 = "More than six months"

def calculateBudgetRanges():
    rangeBudget.r1 = 1000
    rangeBudget.r2 = 5000
    rangeBudget.r3 = 10000
    rangeBudget.r4 = 50000
    rangeBudget.r5 = 100000
    rangeBudget.r6 = 500000
    rangeBudget.r7 = 1000000
    rangeBudget.r8 = 5000000
    rangeBudget.r9 = 10000000
    rangeBudget.r10 = 50000000
    rangeBudget.r11 = rangeLimitBudget.max + 1

def generateBudgetNames():
    rangeNamesBudget.r1 = "< 1K"
    rangeNamesBudget.r2 = "[1K-5K["
    rangeNamesBudget.r3 = "[5K-10K["
    rangeNamesBudget.r4 = "[10K-50K["
    rangeNamesBudget.r5 = "[50K-100K["
    rangeNamesBudget.r6 = "[100K-500K["
    rangeNamesBudget.r7 = "[500K-1M["
    rangeNamesBudget.r8 = "[1M-5M["
    rangeNamesBudget.r9 = "[5M-10M["
    rangeNamesBudget.r10 = "[10M-50M["
    rangeNamesBudget.r11 = ">= 50M"

def calculateGrossRanges():
    rangeGross.r1 = 1000000
    rangeGross.r2 = 10000000
    rangeGross.r3 = 100000000
    rangeGross.r4 = rangeLimitGross.max + 1

def generateGrossNames():
    rangeNamesGross.r1 = "< 1M"
    rangeNamesGross.r2 = "[1M-10M["
    rangeNamesGross.r3 = "[10M-100M["
    rangeNamesGross.r4 = "> 100M"

def calculateScoreClassRanges():
    max = 10
    rangeScoreClasses.r1 = 4
    rangeScoreClasses.r2 = 6
    rangeScoreClasses.r3 = 8
    rangeScoreClasses.r4 = max + 1

def generateScoreClassNames():
    rangeNamesScoreClasses.r1 = "Bad"
    rangeNamesScoreClasses.r2 = "Below average"
    rangeNamesScoreClasses.r3 = "Good"
    rangeNamesScoreClasses.r4 = "Excellent"

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
    writeMoviePathsToFile()

def initializeDictionary():
    #Pairs: [Runtime, FilmingDays]  [FilmingDays, Budget]   [Budget, Revenue]   [Revenue, Score]
    initializeDictPairs(rangeNamesRuntime, rangeNamesFilmingDays)
    initializeDictPairs(rangeNamesFilmingDays, rangeNamesBudget)
    initializeDictPairs(rangeNamesBudget, rangeNamesGross)
    if printScores:
        initializeDictPairs(rangeNamesGross, rangeNamesScore)
    if printScoreClasses:
        initializeDictPairs(rangeNamesGross, rangeNamesScoreClasses)

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
        title = record[1]
        year = record[7]

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

        if printScores:
            if (grossValue != None and ratingValue != None):
                rangeInfo1 = (rangeGross, rangeNamesGross, grossValue)
                rangeInfo2 = (rangeScore, rangeNamesScore, ratingValue)
                pairList.append(createDictPair(rangeInfo1, rangeInfo2))

        if printScoreClasses:
            if (grossValue != None and ratingValue != None):
                rangeInfo1 = (rangeGross, rangeNamesGross, grossValue)
                rangeInfo2 = (rangeScoreClasses, rangeNamesScoreClasses, ratingValue)
                pairList.append(createDictPair(rangeInfo1, rangeInfo2))

        updateDictCount(pairList)
        updateMoviePaths(title, year, pairList)

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
    index = 1
    for element in flowDict:
        if index == len(flowDict):
            file.write("{\"source\":\"%s\",\"target\":\"%s\",\"value\":\"%d\"}\n" % (element[0], element[1], flowDict[element]))
        else:
            file.write("{\"source\":\"%s\",\"target\":\"%s\",\"value\":\"%d\"},\n" % (element[0], element[1], flowDict[element]))
        index += 1
    file.write("] , \n")

    writeNodesToFile(file)

    file.close()

def writeNodesToFile(file):
    last = False
    file.write("\"nodes\": [\n")
    writeNodes(file, rangeNamesRuntime, last)
    writeNodes(file, rangeNamesFilmingDays, last)
    writeNodes(file, rangeNamesBudget, last)
    if not printScoreClasses and not printScores:
        last = True
    writeNodes(file, rangeNamesGross, last)
    last = True
    if printScores:
        writeNodes(file, rangeNamesScore, last)
    elif printScoreClasses:
        writeNodes(file, rangeNamesScoreClasses, last)
    file.write("] } \n")

def writeNodes(file, rangeNames, last):
    index = 1
    for range in rangeNames:
        if index == len(rangeNames) and last:
            file.write("{\"name\":\"%s\"}\n" % range)
        else:
            file.write("{\"name\":\"%s\"},\n" % range)
        index += 1

def updateMoviePaths(title, year, pairList):
    key = "%s (%s)" % (title, year)
    value = ""

    if pairList:
        for pair in pairList:
            pairString = "%s#%s*" % (pair[0], pair[1])
            value += pairString

        value = value[:-1]

        moviePaths[key] = value

def writeMoviePathsToFile():
    file = open("../../Data/flowData_moviePaths.csv", "w", encoding="utf8", errors="ignore")
    file.write("Movie,Path\n")
    for movie in moviePaths:
        file.write("%s,%s\n" % (movie, moviePaths[movie]))

    file.close()






#######################################################################################################################
#                                 PART FOUR: SET COLORS FOR CATEGORIES                                                #
#######################################################################################################################
def generateColorFile(fileName):
    fileLocation = "../../Data/" + fileName
    colorFile = open(fileLocation, "w", encoding="utf8", errors="ignore")

    col_selected = "#FF183C"
    (col_runningtimes, col_filmingdays, col_budget, col_gross, col_rating) = (
    "#64BD91", "#C25D7F", "#73539F", "#4EA6AA", "#F0CC76")

    colorFile.write("var colorsSankey = {\n")
    colorFile.write("\t\"Selected\": \"%s\"\n" % col_selected)

    colorFile.write("\t\"RunningTimes\": \"%s\"\n" % col_runningtimes)
    writeToColorFile(colorFile, rangeNamesRuntime, col_runningtimes)

    colorFile.write("\t\"FilmingDays\": \"%s\"\n" % col_filmingdays)
    writeToColorFile(colorFile, rangeNamesFilmingDays, col_filmingdays)

    colorFile.write("\t\"Budged\": \"%s\"\n" % col_budget)
    writeToColorFile(colorFile, rangeNamesBudget, col_budget)

    colorFile.write("\t\"Gross\": \"%s\"\n" % col_gross)
    writeToColorFile(colorFile, rangeNamesGross, col_gross)

    colorFile.write("\t\"Rating\": \"%s\"\n" % col_rating)
    writeToColorFile(colorFile, rangeNamesScoreClasses, col_rating)

    colorFile.write("}")
    colorFile.close()

def writeToColorFile(colorFile, rangeNames, colorValue):
    for name in rangeNames:
        colorFile.write("\t\"%s\": \"%s\"\n" % (name, colorValue))


#######################################################################################################################
#                                               MAIN SCRIPT                                                           #
#######################################################################################################################


movieFile = open("../../Data/movies.csv", "r", encoding="utf8", errors="ignore")
process(movieFile)
movieFile.close()

calculateRanges()
distributeDataInRanges()
generateColorFile("sankeyColors.js")



