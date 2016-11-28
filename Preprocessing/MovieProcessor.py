
# Movieprocessor: Reads raw datafile about movies and converts this to .csv.
# Authors: Michelle Gybels en Anaïs Ools

# Remarks for co-authors: Michelle is working on this :D


import csv

inputFile = open("Sources/movies.list", "r", encoding="utf8")
#outputFileMovies = open("Output/movies.csv", "w")
#outputFileSeries = open("Output/series.csv", "w")

def processMovies():
    movieID = 0

    # Skip header
    header = True
    for line in inputFile:
        if not header:              # Skips the empty line
            break
        if header and "=" in line:
            header = False

    for line in inputFile:
        line = line.strip()
        movieID += 1
        isMovie = True

        #title
        title = line[line.find("\"") + 1:line[line.find("\"") + 1:].find("\"")+1]

        #year
        year = line[line.find("(") + 1:line.find(")")]

        if "{" in line:
            isMovie = False
            episodeInfo = line[line.find("{") + 1:line.find("}")]
            print(episodeInfo)
            episodeInfo = episodeInfo[::-1][episodeInfo[::-1].find(")")+1: episodeInfo[::-1].find("(")][::-1]
            if "#" in episodeInfo:
                (season, episode) = episodeInfo[1:].split(".")
            else:
                (season, episode) = (0, 0)

            print(season)
            print(episode)

        #print(line)
        #if(line[0] == '{' ):
         #   isMovie = False
          #  episodeTitle = line[line.find("{")+1:line.find("}")]
           # print(episodeTitle)
        #endYear (serie)
        #episodeTitle (serie)
        #season
        #episode

        if movieID > 10:
            break





processMovies()
