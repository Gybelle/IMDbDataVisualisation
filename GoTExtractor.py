import csv

gotEpisodes = list(range(828419, 828494))
gotActors = []

print(gotEpisodes)

#exit()


outfile = open('actorsInMoviesGOT.csv', 'w')
with open('actorsInMovies.csv', 'r') as csvfile:
	spamreader = csv.reader(csvfile, delimiter=';', quotechar='|')
	spamwriter = csv.writer(outfile, delimiter=';', quotechar='|')

	hack = True
	for row in spamreader:
		if hack:
			hack = False
			continue
		if (int(row[0]) % 5000 == 0):
			percentage = (int(row[0]) / 1937893) * 100
			print("actorsInMovies " + str(percentage) + "%")

		if int(row[1]) in gotEpisodes and row[2] == "False":
			gotActors.append(int(row[0]))
			spamwriter.writerow(row)
			outfile.flush()
outfile.close()

outfile = open('actorsGOT.csv', 'w', newline='')
with open('actors.csv', 'r') as csvfile:
	spamreader = csv.reader(csvfile, delimiter=';', quotechar='|')
	spamwriter = csv.writer(outfile, delimiter=';', quotechar='|')

	hack = True
	for row in spamreader:
		if hack:
			hack = False
			continue
		if (int(row[0]) % 5000 == 0):
			percentage = (int(row[0]) / 3606672) * 100
			print("actors " + str(percentage) + "%")

		if int(row[0]) in gotActors:
			spamwriter.writerow(list(row))
			outfile.flush()
outfile.close()

print("done :)")