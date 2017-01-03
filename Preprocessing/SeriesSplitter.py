import csv

otherFile = open('series/series_-.csv', 'w')
with open('series.csv', 'r') as csvfile:
	seriesreader = csv.reader(csvfile, delimiter=';', quotechar='|')
	otherwriter = csv.writer(otherFile, delimiter=';', quotechar='|')

#	seriesFile = open('series/dummy', 'w')
#	serieswriter = csv.writer(seriesFile, delimiter=';', quotechar='|')

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
			percentage = (int(row[0]) / 2706880) * 100
			print("series " + str(percentage) + "%")

		name = row[1]

		if not name:
			continue

		firstChar = name[0].upper()

		if (not firstChar.isalpha()):
			otherwriter.writerow(row)
			otherFile.flush()
			continue

		#check if the firstChar has changed and we need to open a new file
		if (not firstChar in writers):
			files[firstChar] = open('series/series_' + firstChar + '.csv', 'w')
			writers[firstChar] = csv.writer(files[firstChar], delimiter=';', quotechar='|')
			writers[firstChar].writerow(headerRow)
		
		seriesFile = files[firstChar]
		serieswriter = writers[firstChar]

		serieswriter.writerow(row)
		seriesFile.flush()

	#close all files
	for k,v in files.items():
		v.close()

otherFile.close()



print("done :)")