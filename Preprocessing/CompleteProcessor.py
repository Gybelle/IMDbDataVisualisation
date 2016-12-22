'''
Does all the processing steps.
Author: Anaïs Ools
'''

runDataProcessors = False
runQueries = True

if runDataProcessors:
    import MovieProcessor
    import GenreProcessor
    import ActorProcessor
    import BusinessProcessor
    import KeywordProcessor
    import LanguageProcessor
    import LocationCountryProcessor
    import RatingProcessor
    import RunningTimesProcessor

    import ActorPostProcessor

if runQueries:
    import QueryGenreYearCountry

print("PROCESSING DONE!")