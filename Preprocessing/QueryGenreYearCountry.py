'''
QueryGenreYearCountry: Calculates most produced genre per country per year.
Run this file after running MovieProcessor.py
Author: Anaïs Ools & Michelle Gybels
'''

import csv
from datetime import datetime

dict = {} # Key = (genre, year, country), value = (count, ratingList)

def process(file):
    header = file.readline()
    for line in file:
        movieRecord = processLine(line)
        addToDict(movieRecord)
    print("Writing to file...")
    writeDictToFile()


def processLine(line):
    # Get data
    items = line.strip("\r\n").split(";")
    genre = items[4]
    year = items[2]
    country = items[10]
    rating = items[11]

    # Process
    genres = genre.split("*")
    countries = country.split("*")
    year = int(year)
    if rating:
        try:
            rating = float(rating)
        except:
            print(line)
    else:
        rating = None

    return (genres, year, countries, rating)


def addToDict(movieRecord):
    for genre in movieRecord[0]:
        for country in movieRecord[2]:
            key = (genre, movieRecord[1], country)
            if key not in dict:
                dict[key] = (0, [])
            currentTuple = dict[key]
            if movieRecord[3]:
                currentTuple[1].append(movieRecord[3])
            newTuple = (currentTuple[0]+1, currentTuple[1])
            dict[key] = newTuple


def writeDictToFile():
    outputFile = open("../Data/GenreYearCounty.csv", "w", newline="\n", encoding="utf-8")
    csvWriter = csv.writer(outputFile, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)
    csvWriter.writerow(["Genre", "Year", "Country", "Count", "AvgRating"])
    for key in dict:
        genre, year, country = key
        count = dict[key][0]
        avg = calculateAverage(dict[key][1])
        csvWriter.writerow([genre, year, country, count, avg])


def calculateAverage(list):
    sum = 0
    for item in list:
        sum += item
    if len(list) != 0:
        return sum/len(list)
    return 0


movieFile = open("../Data/movies.csv", "r", encoding="utf8", errors="ignore")
process(movieFile)
movieFile.close()