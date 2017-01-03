import csv
import math

with open('actorsInMovies.csv', 'r') as csvfile:
	seriesreader = csv.reader(csvfile, delimiter=';', quotechar='|')

	writers = {}
	files = {}

	hack = True
	headerRow = []
	for row in seriesreader:
		if hack:
			hack = False
			headerRow = row
			continue

		if (int(row[0]) % 5000 == 0):
			percentage = (int(row[0]) / 1937893) * 100
			print("series " + str(percentage) + "%")

		ActorID = int(row[0])
		MovieOrSeriesID = int(row[1])
		IsMovie = row[2]
		Role = row[3]

		if IsMovie == 'True':
			continue

		bucket = math.floor(MovieOrSeriesID / 50000)

		#check if the bucket has changed and we need to open a new file
		if (not bucket in writers):
			files[bucket] = open('actorsInSeries/mapping_' + str(bucket) + '.csv', 'w')
			writers[bucket] = csv.writer(files[bucket], delimiter=';', quotechar='|')
			writers[bucket].writerow(headerRow)
		
		seriesFile = files[bucket]
		serieswriter = writers[bucket]

		serieswriter.writerow(row)
		seriesFile.flush()

	#close all files
	for k,v in files.items():
		v.close()



print("done :)")