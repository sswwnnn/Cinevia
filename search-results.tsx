import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { multiSearch, searchMovies, searchTvShows, searchPeople, getImageUrl } from '@/lib/api';
import { Loader } from '@/components/ui/loader';
import MoviesList from '@/components/MoviesList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'wouter';

const SearchResults: React.FC = () => {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const query = searchParams.get('query') || '';
  const [activeTab, setActiveTab] = useState('multi');
  const [page, setPage] = useState(1);
  
  // Reset page when query changes
  useEffect(() => {
    setPage(1);
  }, [query]);
  
  // Function to get search function based on active tab
  const getSearchFn = () => {
    switch (activeTab) {
      case 'movie':
        return searchMovies(query, { page });
      case 'tv':
        return searchTvShows(query, { page });
      case 'person':
        return searchPeople(query, { page });
      default:
        return multiSearch(query, { page });
    }
  };
  
  const { 
    data: searchResults, 
    isLoading, 
    error,
    isPreviousData
  } = useQuery({
    queryKey: [`/search/${activeTab}`, query, page],
    queryFn: getSearchFn,
    enabled: !!query,
    keepPreviousData: true
  });
  
  if (!query) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Search Films & People</h1>
        <p>Please enter a search term to find movies, TV shows and people.</p>
      </div>
    );
  }
  
  // Loading state
  if (isLoading && !isPreviousData) {
    return <Loader text="Searching..." fullScreen />;
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p>An error occurred while searching. Please try again later.</p>
      </div>
    );
  }
  
  // Filter results for multi-search
  const filterResults = (type: string) => {
    if (!searchResults?.results) return [];
    return searchResults.results.filter((item: any) => item.media_type === type);
  };
  
  const movies = activeTab === 'multi' ? filterResults('movie') : searchResults?.results || [];
  const tvShows = activeTab === 'multi' ? filterResults('tv') : searchResults?.results || [];
  const people = activeTab === 'multi' ? filterResults('person') : searchResults?.results || [];
  const totalResults = searchResults?.total_results || 0;
  
  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-gray-400 mb-6">
          Found {totalResults} results for "{query}"
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="h-10 grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="multi">All</TabsTrigger>
            <TabsTrigger value="movie">Movies</TabsTrigger>
            <TabsTrigger value="tv">TV Shows</TabsTrigger>
            <TabsTrigger value="person">People</TabsTrigger>
          </TabsList>
          
          <TabsContent value="multi">
            {/* Movies Section */}
            {movies.length > 0 && (
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Movies</h2>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setActiveTab('movie');
                      setPage(1);
                    }}
                  >
                    View All Movies
                  </Button>
                </div>
                <MoviesList movies={movies.slice(0, 6)} type="movie" grid={true} />
              </div>
            )}
            
            {/* TV Shows Section */}
            {tvShows.length > 0 && (
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">TV Shows</h2>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setActiveTab('tv');
                      setPage(1);
                    }}
                  >
                    View All TV Shows
                  </Button>
                </div>
                <MoviesList movies={tvShows.slice(0, 6)} type="tv" grid={true} />
              </div>
            )}
            
            {/* People Section */}
            {people.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">People</h2>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setActiveTab('person');
                      setPage(1);
                    }}
                  >
                    View All People
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {people.slice(0, 6).map((person: any) => (
                    <div key={person.id} className="flex flex-col items-center">
                      <Link href={`/person/${person.id}`} className="w-full">
                        <div className="relative rounded-lg overflow-hidden aspect-[2/3] mb-2 group">
                          {person.profile_path ? (
                            <img 
                              src={getImageUrl(person.profile_path, 'w300')} 
                              alt={person.name} 
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                              <Avatar className="h-20 w-20">
                                <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-center">{person.name}</h3>
                      </Link>
                      {person.known_for_department && (
                        <p className="text-sm text-gray-400 text-center">{person.known_for_department}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {movies.length === 0 && tvShows.length === 0 && people.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No results found for "{query}".</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="movie">
            {movies.length > 0 ? (
              <MoviesList movies={movies} type="movie" grid={true} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No movie results found for "{query}".</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tv">
            {tvShows.length > 0 ? (
              <MoviesList movies={tvShows} type="tv" grid={true} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No TV show results found for "{query}".</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="person">
            {people.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {people.map((person: any) => (
                  <div key={person.id} className="flex flex-col items-center">
                    <Link href={`/person/${person.id}`} className="w-full">
                      <div className="relative rounded-lg overflow-hidden aspect-[2/3] mb-3 group">
                        {person.profile_path ? (
                          <img 
                            src={getImageUrl(person.profile_path, 'w300')} 
                            alt={person.name} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <Avatar className="h-24 w-24">
                              <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-center">{person.name}</h3>
                    </Link>
                    {person.known_for?.length > 0 && (
                      <p className="text-sm text-gray-400 text-center">
                        {person.known_for.slice(0, 2).map((credit: any) => credit.title || credit.name).join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No people results found for "{query}".</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Pagination */}
        {searchResults?.total_pages > 1 && activeTab !== 'multi' && (
          <div className="flex justify-between items-center mt-8">
            <Button 
              variant="outline" 
              onClick={() => setPage(old => Math.max(old - 1, 1))}
              disabled={page === 1}
            >
              Previous Page
            </Button>
            
            <span className="text-sm text-gray-400">
              Page {page} of {searchResults.total_pages > 500 ? 500 : searchResults.total_pages}
            </span>
            
            <Button 
              variant="outline" 
              onClick={() => setPage(old => (!searchResults || old < Math.min(searchResults.total_pages, 500) ? old + 1 : old))}
              disabled={page >= Math.min(searchResults.total_pages, 500)}
            >
              Next Page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
