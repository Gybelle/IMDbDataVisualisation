'''
BusinessProcessor: Reads raw datafile about business and updates movies.csv.
Author: Anaïs Ools
'''

import csv
import re
import calendar
from datetime import datetime
import shutil
from currency_converter import CurrencyConverter # pip install currencyconverter

businessDictionary = {}
countGross = 0
countBudget = 0
countFilmingDates = 0
countAllFields = 0
c = CurrencyConverter()
# Obsolete currencies
currencyDictionary = {"GRD":0.00293470, "ARS":0.0587109, "RUR":0.0147245425, "DEM":0.511292, "YUM":0.51, "FRF":0.152449, "BGL":0.511285781, "IRR":0.0000291702, "EGP":0.0521577, "ITL":0.000516457, "FIM":0.168188, "ESP":0.00601012, "PKR":0.00896574378, "NLG":0.453780, "VEB":0.0000940411, "CLP":0.00139437, "COP":0.000303499, "AED":0.254713, "TWD":0.0291244755, "ATS":0.0726728, "UAH":0.0357240093, "BEF":0.02}
unknownCurrencies = {}

def processBusiness(file):
    # Skip header
    found = False
    for line in file:
        if found:
            break
        if "BUSINESS LIST\n" == line:
            found = True

    title = ""
    gross = []
    budget = ""
    filming = ""
    matchingLines = ["MV: ", "BT: ", "GR: ", "SD: "]

    for line in file:
        line = line.strip()
        if line == "NOTES":
            break # start of footer
        if len(line) > 4 and line[:4] in matchingLines:
            if line.startswith("MV: "):
                # write previous movie to dictionary
                if len(gross) > 0 or budget != "" or filming != "":
                    title = correctTitle(title)
                    if title != "" and "(????)" not in title:
                        movieToDict(title, budget, gross, filming)
                gross = []
                budget = ""
                filming = ""
                # read new title
                title = line[4:].strip()
            elif line.startswith("BT: "):
                budget = line[4:].strip()
            elif line.startswith("GR: "):
                gross.append(line[4:].strip())
            elif line.startswith("SD: "):
                filming = line[4:].strip()
    print("  [%d business processed]" % len(businessDictionary))


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


def movieToDict(title, budget, gross, filming):
    global countGross, countBudget, countFilmingDates, countAllFields
    allPresent = 0
    if len(gross) > 0:
        result = calculateGross(gross)
        if result != 0:
            gross = result
            allPresent += 1
        else:
            gross = None
        countGross += 1
    elif len(gross) == 0:
        gross = None
    if budget != "":
        budget = priceToEuro(budget)
        if budget != 0:
            countBudget += 1
            allPresent += 1
        else:
            budget = None
    if filming != "":
        filmStart = filming.split("-")[0].strip()
        filmEnd = filming.split("-")[1].strip()
        filming = None
        if "(" in filmEnd and ")" in filmEnd:
            filmEnd = filmEnd[:filmEnd.find("(")].strip()
        if filmStart and filmEnd and filmStart != "?" and filmEnd != "?":
            filming = calculateFilmingDays(filmStart, filmEnd)
            if filming != 0:
                countFilmingDates += 1
                allPresent += 1
            else:
                filming = None
    businessDictionary[title] = (budget, gross, filming)
    if allPresent >= 3:
        countAllFields += 1


def calculateGross(list):
    entries = {}
    for item in list:
        price = priceToEuro(item[:item.find("(")].strip())
        if price:
            place = item[item.find("(")+1:item.find(")")]
            if place == "worldwide":
                place = "Worldwide"
            if place not in entries:
                entries[place] = price
            elif price > entries[place]:
                entries[place] = price
    if "Worldwide" in entries:
        return entries["Worldwide"]
    if "USA" in entries and "Non-USA" in entries:
        return entries["USA"] + entries["Non-USA"]
    total = 0
    for item in entries:
        total += entries[item]
    return total


def calculateFilmingDays(start, end):
    d1 = stringToDate(start, True)
    d2 = stringToDate(end, False)
    if d1 and d2:
        delta = d2 - d1
        return delta.days
    return 0


def stringToDate(string, toStart):
    try:
        d = datetime.strptime(string, "%d %B %Y")
        return d
    except ValueError:
        try:
            d = datetime.strptime(string, "%B %Y")
            if toStart:
                d = d.replace(day=1)
            else:
                d = d.replace(day=calendar.monthrange(d.year, d.month)[1])
            return d
        except ValueError:
            try:
                d = datetime.strptime(string, "%Y")
                if toStart:
                    d = d.replace(day=1, month=1)
                else:
                    d = d.replace(day=31, month=12)
                return d
            except ValueError:
                return None


def priceToEuro(price):
    currency = price[:3].strip()
    try:
        amount = float(price[4:].replace(",", ""))
    except:
        return None # Not correctly formatted
    if currency is "EUR":
        return round(amount)
    try:
        return round(c.convert(amount, currency, "EUR"))
    except ValueError:
        if currency in currencyDictionary:
            return round(amount * currencyDictionary[currency])
        else:
            if currency in unknownCurrencies:
                unknownCurrencies[currency] += 1
            else:
                unknownCurrencies[currency] = 1
    return None


def matchMovies(file, csvWriter):
    count = 0
    matches = 0
    for line in file:
        items = line.rstrip('\r\n').split(";")
        movie = items[1].strip() + " (" + items[2] + ")"

        if movie in businessDictionary:
            matches += 1
            business = businessDictionary[movie]
            businessDictionary.pop(movie)
            csvWriter.writerow(items + [business[0], business[1], business[2]])
            count += 1
        else:
            csvWriter.writerow(items + [None, None, None])
    print("  [Business found for %d movies]" % matches)


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

        if series in businessDictionary:
            matches += 1
            business = businessDictionary[series]
            businessDictionary.pop(series)
            csvWriter.writerow(items + [business[0], business[1], business[2]])
            count += 1
        else:
            csvWriter.writerow(items + [None, None, None])
    print("  [Business found for %d series]" % matches)


def skipHeader(file, endOfHeader):
    header = True
    for line in file:
        if header and endOfHeader in line.strip():
            header = False


def process(fileName, containsMovies):
    # Open files
    inputFileName = "Output/" + fileName + ".csv"
    outputFileName = "Output/" + fileName + "_business.csv"
    inputFile = open(inputFileName, "r", newline="\n", encoding="utf-8")
    outputFile = open(outputFileName, "w", newline="\n", encoding="utf-8")

    # Update header
    csvWriter = csv.writer(outputFile, delimiter=';', quotechar=';', quoting=csv.QUOTE_MINIMAL)
    headerList = inputFile.readline().strip('\r\n').split(";") + ["Budget (EUR)", "Gross (EUR)", "FilmingDays"]
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

print("Processing business...")
businessFile = open("Sources/business.list", "r", encoding="utf8", errors="ignore")
processBusiness(businessFile)
businessFile.close()
print("Found: %d gross, %d budget, %d filming, %d all of them" % (countGross, countBudget, countFilmingDates, countAllFields))
count1 = len(businessDictionary)

print("\nAdding business to movies...")
process("movies", True)

print("\nAdding business to series...")
process("series", False)

count2 = len(businessDictionary)
# print("\nBusiness remaining: %d\n" % count2)
# for item in businessDictionary:
#     print(item)

# for item in unknownCurrencies:
#     print("%s\t%d" % (item, unknownCurrencies[item]))

if count1 != 0:
    print("\n%d of %d business not matched with a movie. %d%% success" % (count2, count1, (count1-count2)/count1*100))

print("Ended at ", end="")
print(datetime.now().time())

