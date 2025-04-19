import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  getPopularTvShows, 
  getTvAiringToday, 
  getTvOnTheAir, 
  getTopRatedTvShows,
  getTvGenres,
  discoverTvShows
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

const TvShowsPage: React.FC = () => {
  const { category } = useParams();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState(category || 'popular');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [firstAirDateFrom, setFirstAirDateFrom] = useState<string>('');
  const [firstAirDateTo, setFirstAirDateTo] = useState<string>('');
  const [includeAdult, setIncludeAdult] = useState(false);
  
  // Update URL when tab changes
  useEffect(() => {
    if (activeTab !== category) {
      setLocation(`/tv/${activeTab}`);
    }
  }, [activeTab, category, setLocation]);
  
  // Update active tab when category param changes
  useEffect(() => {
    if (category && ['popular', 'airing-today', 'on-tv', 'top-rated', 'discover'].includes(category)) {
      setActiveTab(category);
    }
  }, [category]);
  
  // Fetch TV show genres for filters
  const { data: genresData } = useQuery({
    queryKey: ['/genre/tv/list'],
    queryFn: () => getTvGenres()
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
    setFirstAirDateFrom('');
    setFirstAirDateTo('');
    setIncludeAdult(false);
  };
  
  // Apply filters
  const applyFilters = () => {
    setActiveTab('discover');
    setPage(1);
    setLocation('/tv/discover');
  };
  
  // Fetch TV shows based on active tab
  const getTvShowsFn = () => {
    switch (activeTab) {
      case 'popular':
        return getPopularTvShows({ page });
      case 'airing-today':
        return getTvAiringToday({ page });
      case 'on-tv':
        return getTvOnTheAir({ page });
      case 'top-rated':
        return getTopRatedTvShows({ page });
      case 'discover':
        return discoverTvShows({
          sort_by: sortBy as any,
          page,
          with_genres: selectedGenres.join(','),
          "vote_average.gte": minRating || undefined,
          "first_air_date.gte": firstAirDateFrom ? `${firstAirDateFrom}-01-01` : undefined,
          "first_air_date.lte": firstAirDateTo ? `${firstAirDateTo}-12-31` : undefined,
          include_adult: includeAdult
        });
      default:
        return getPopularTvShows({ page });
    }
  };
  
  const { 
    data: tvShowsData, 
    isLoading, 
    error,
    isPreviousData
  } = useQuery({
    queryKey: [`/tv/${activeTab}`, page, sortBy, selectedGenres, minRating, firstAirDateFrom, firstAirDateTo, includeAdult],
    queryFn: getTvShowsFn,
    keepPreviousData: true
  });
  
  // Loading state
  if (isLoading && !isPreviousData) {
    return <Loader text="Loading TV shows..." fullScreen />;
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p>Failed to load TV shows. Please try again later.</p>
      </div>
    );
  }
  
  // Title mapping for display
  const getTitleByCategory = () => {
    switch (activeTab) {
      case 'popular': return 'Popular TV Shows';
      case 'airing-today': return 'TV Shows Airing Today';
      case 'on-tv': return 'Currently Airing TV Shows';
      case 'top-rated': return 'Top Rated TV Shows';
      case 'discover': return 'Discover TV Shows';
      default: return 'TV Shows';
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
                <TabsTrigger value="airing-today">Airing Today</TabsTrigger>
                <TabsTrigger value="on-tv">On TV</TabsTrigger>
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
                            <SelectItem value="first_air_date.desc">First Air Date Descending</SelectItem>
                            <SelectItem value="first_air_date.asc">First Air Date Ascending</SelectItem>
                            <SelectItem value="name.asc">Title (A-Z)</SelectItem>
                            <SelectItem value="name.desc">Title (Z-A)</SelectItem>
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
                    <AccordionItem value="air-dates">
                      <AccordionTrigger>First Air Dates</AccordionTrigger>
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
                              value={firstAirDateFrom}
                              onChange={(e) => setFirstAirDateFrom(e.target.value)}
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
                              value={firstAirDateTo}
                              onChange={(e) => setFirstAirDateTo(e.target.value)}
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
        
        {/* TV Shows Grid */}
        {tvShowsData?.results?.length > 0 ? (
          <MoviesList movies={tvShowsData.results} type="tv" />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No TV shows found matching your criteria.</p>
          </div>
        )}
        
        {/* Pagination */}
        {tvShowsData?.total_pages > 1 && (
          <div className="flex justify-between items-center mt-8">
            <Button 
              variant="outline" 
              onClick={() => setPage(old => Math.max(old - 1, 1))}
              disabled={page === 1}
            >
              Previous Page
            </Button>
            
            <span className="text-sm text-gray-400">
              Page {page} of {tvShowsData.total_pages > 500 ? 500 : tvShowsData.total_pages}
            </span>
            
            <Button 
              variant="outline" 
              onClick={() => setPage(old => (!tvShowsData || old < Math.min(tvShowsData.total_pages, 500) ? old + 1 : old))}
              disabled={page >= Math.min(tvShowsData.total_pages, 500)}
            >
              Next Page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TvShowsPage;
