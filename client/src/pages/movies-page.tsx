import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  getPopularMovies, 
  getNowPlayingMovies, 
  getUpcomingMovies, 
  getTopRatedMovies, 
  getMovieGenres,
  discoverMovies
} from '@/lib/api';
import { Loader } from '@/components/ui/loader';
import MoviesList from '@/components/MoviesList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';

const MoviesPage: React.FC = () => {
  const { category } = useParams();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState(category || 'popular');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [releaseYearFrom, setReleaseYearFrom] = useState<string>('');
  const [releaseYearTo, setReleaseYearTo] = useState<string>('');
  const [includeAdult, setIncludeAdult] = useState(false);
  const [timeWindow, setTimeWindow] = useState<'day' | 'week'>('week'); // Added timeWindow state


  // Update URL when tab changes
  useEffect(() => {
    if (activeTab !== category) {
      setLocation(`/movies/${activeTab}`);
    }
  }, [activeTab, category, setLocation]);

  // Update active tab when category param changes
  useEffect(() => {
    if (category && ['popular', 'now-playing', 'upcoming', 'top-rated', 'discover'].includes(category)) {
      setActiveTab(category);
    }
  }, [category]);

  // Fetch movie genres for filters
  const { data: genresData } = useQuery({
    queryKey: ['/genre/movie/list'],
    queryFn: () => getMovieGenres()
  });

  // Handle genre selection
  const toggleGenre = (genreId: string) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId) 
        : [...prev, genreId]
    );
  };

  // Reset filters
  const resetFilters = () => {
    setSortBy('popularity.desc');
    setSelectedGenres([]);
    setMinRating(null);
    setReleaseYearFrom('');
    setReleaseYearTo('');
    setIncludeAdult(false);
    setTimeWindow('week'); //Reset timeWindow
  };

  // Apply filters
  const applyFilters = () => {
    setActiveTab('discover');
    setPage(1);
    setLocation('/movies/discover');
  };

  // Fetch movies based on active tab
  const getMoviesFn = () => {
    switch (activeTab) {
      case 'popular':
        return getPopularMovies({ page, time_window: timeWindow }); //Added time_window
      case 'now-playing':
        return getNowPlayingMovies({ page });
      case 'upcoming':
        return getUpcomingMovies({ page });
      case 'top-rated':
        return getTopRatedMovies({ page });
      case 'discover':
        return discoverMovies({
          sort_by: sortBy as any,
          page,
          with_genres: selectedGenres.join(','),
          "vote_average.gte": minRating || undefined,
          "primary_release_date.gte": releaseYearFrom ? `${releaseYearFrom}-01-01` : undefined,
          "primary_release_date.lte": releaseYearTo ? `${releaseYearTo}-12-31` : undefined,
          include_adult: includeAdult,
          time_window: timeWindow //Added time_window
        });
      default:
        return getPopularMovies({ page, time_window: timeWindow }); //Added time_window
    }
  };

  const { 
    data: moviesData, 
    isLoading, 
    error,
    isPreviousData
  } = useQuery({
    queryKey: [`/movie/${activeTab}`, page, sortBy, selectedGenres, minRating, releaseYearFrom, releaseYearTo, includeAdult, timeWindow], //Added timeWindow to queryKey
    queryFn: getMoviesFn,
    keepPreviousData: true
  });

  // Loading state
  if (isLoading && !isPreviousData) {
    return <Loader text="Loading movies..." fullScreen />;
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p>Failed to load movies. Please try again later.</p>
      </div>
    );
  }

  // Title mapping for display
  const getTitleByCategory = () => {
    switch (activeTab) {
      case 'popular': return 'Popular Movies';
      case 'now-playing': return 'Now Playing Movies';
      case 'upcoming': return 'Upcoming Movies';
      case 'top-rated': return 'Top Rated Movies';
      case 'discover': return 'Discover Movies';
      default: return 'Movies';
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">{getTitleByCategory()}</h1>

          <div className="w-full md:w-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="h-10 grid w-full grid-cols-4 md:w-[400px]">
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="now-playing">Now Playing</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Button 
            onClick={() => setShowFilters(!showFilters)} 
            variant="outline" 
            className="mb-4"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>

          {showFilters && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Filters</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="sort-by">
                      <AccordionTrigger>Sort By</AccordionTrigger>
                      <AccordionContent>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sort results by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="popularity.desc">Popularity Descending</SelectItem>
                            <SelectItem value="popularity.asc">Popularity Ascending</SelectItem>
                            <SelectItem value="vote_average.desc">Rating Descending</SelectItem>
                            <SelectItem value="vote_average.asc">Rating Ascending</SelectItem>
                            <SelectItem value="release_date.desc">Release Date Descending</SelectItem>
                            <SelectItem value="release_date.asc">Release Date Ascending</SelectItem>
                            <SelectItem value="original_title.asc">Title (A-Z)</SelectItem>
                            <SelectItem value="original_title.desc">Title (Z-A)</SelectItem>
                          </SelectContent>
                        </Select>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="genres">
                      <AccordionTrigger>Genres</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-2">
                          {genresData?.genres?.map((genre: { id: number; name: string }) => (
                            <div key={genre.id} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`genre-${genre.id}`}
                                className="mr-2"
                                checked={selectedGenres.includes(genre.id.toString())}
                                onChange={() => toggleGenre(genre.id.toString())}
                              />
                              <Label htmlFor={`genre-${genre.id}`}>{genre.name}</Label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="user-score">
                      <AccordionTrigger>User Score</AccordionTrigger>
                      <AccordionContent>
                        <div>
                          <Select 
                            value={minRating ? minRating.toString() : ''} 
                            onValueChange={(val) => setMinRating(val ? Number(val) : null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Minimum rating" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">No minimum</SelectItem>
                              <SelectItem value="7">7+ (Good)</SelectItem>
                              <SelectItem value="8">8+ (Very Good)</SelectItem>
                              <SelectItem value="9">9+ (Excellent)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                <div>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="release-dates">
                      <AccordionTrigger>Release Dates</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col space-y-4">
                          <div>
                            <Label htmlFor="from-year">From</Label>
                            <Input
                              id="from-year"
                              type="number"
                              min="1900"
                              max={new Date().getFullYear() + 10}
                              placeholder="From year"
                              value={releaseYearFrom}
                              onChange={(e) => setReleaseYearFrom(e.target.value)}
                              className="bg-gray-700"
                            />
                          </div>
                          <div>
                            <Label htmlFor="to-year">To</Label>
                            <Input
                              id="to-year"
                              type="number"
                              min="1900"
                              max={new Date().getFullYear() + 10}
                              placeholder="To year"
                              value={releaseYearTo}
                              onChange={(e) => setReleaseYearTo(e.target.value)}
                              className="bg-gray-700"
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="adult">
                      <AccordionTrigger>Adult Content</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="include-adult"
                            checked={includeAdult}
                            onCheckedChange={setIncludeAdult}
                          />
                          <Label htmlFor="include-adult">Include adult content</Label>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="time-window"> {/*Added Time Window filter*/}
                      <AccordionTrigger>Time Window</AccordionTrigger>
                      <AccordionContent>
                        <Select value={timeWindow} onValueChange={setTimeWindow}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Time Window" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="day">Day</SelectItem>
                            <SelectItem value="week">Week</SelectItem>
                          </SelectContent>
                        </Select>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>

              <div className="flex justify-end mt-6 gap-4">
                <Button variant="outline" onClick={resetFilters}>Reset</Button>
                <Button className="bg-primary hover:bg-primary/90" onClick={applyFilters}>Apply Filters</Button>
              </div>
            </div>
          )}
        </div>

        {/* Movies Grid */}
        {moviesData?.results?.length > 0 ? (
          <MoviesList movies={moviesData.results} type="movie" />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No movies found matching your criteria.</p>
          </div>
        )}

        {/* Pagination */}
        {moviesData?.total_pages > 1 && (
          <div className="flex justify-between items-center mt-8">
            <Button 
              variant="outline" 
              onClick={() => setPage(old => Math.max(old - 1, 1))}
              disabled={page === 1}
            >
              Previous Page
            </Button>

            <span className="text-sm text-gray-400">
              Page {page} of {moviesData.total_pages > 500 ? 500 : moviesData.total_pages}
            </span>

            <Button 
              variant="outline" 
              onClick={() => setPage(old => (!moviesData || old < Math.min(moviesData.total_pages, 500) ? old + 1 : old))}
              disabled={page >= Math.min(moviesData.total_pages, 500)}
            >
              Next Page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;