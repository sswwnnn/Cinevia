import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-mobile';
import { multiSearch, getImageUrl } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [focused, setFocused] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [, navigate] = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside of search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Quick search results
  const { data: quickSearchResults, isLoading } = useQuery({
    queryKey: ['/search/quick', debouncedSearch],
    queryFn: () => multiSearch(debouncedSearch, { page: 1 }),
    enabled: debouncedSearch.length > 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
      setFocused(false);
    }
  };
  
  // Get top 5 results to show in quick search
  const topResults = quickSearchResults?.results?.slice(0, 5) || [];
  
  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for a movie, tv show, person..."
            className="w-full bg-gray-800 rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setFocused(true)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </form>
      
      {/* Quick search results */}
      {focused && searchTerm.length > 2 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-gray-800 rounded-md shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">Searching...</div>
          ) : topResults.length > 0 ? (
            <div>
              <ul>
                {topResults.map((result: any) => (
                  <li key={`${result.media_type}-${result.id}`} className="border-b border-gray-700 last:border-b-0">
                    <button
                      className="w-full text-left px-4 py-3 hover:bg-gray-700 flex items-center"
                      onClick={() => {
                        const path = result.media_type === 'movie' 
                          ? `/movie/${result.id}` 
                          : result.media_type === 'tv' 
                            ? `/tv/${result.id}` 
                            : `/person/${result.id}`;
                        navigate(path);
                        setFocused(false);
                        setSearchTerm('');
                      }}
                    >
                      <div className="w-10 h-10 flex-shrink-0 mr-3">
                        {result.poster_path || result.profile_path ? (
                          <img
                            src={getImageUrl(result.poster_path || result.profile_path, 'w92')}
                            alt={result.title || result.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                            <span className="text-xs">{(result.title || result.name || 'N/A').charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{result.title || result.name}</p>
                        <p className="text-xs text-gray-400 capitalize">
                          {result.media_type === 'movie' 
                            ? `Movie • ${result.release_date?.split('-')[0] || 'N/A'}` 
                            : result.media_type === 'tv' 
                              ? `TV Show • ${result.first_air_date?.split('-')[0] || 'N/A'}` 
                              : 'Person'}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="p-3 bg-gray-700">
                <button
                  className="w-full text-center text-sm text-gray-300 hover:text-white"
                  onClick={() => {
                    navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
                    setFocused(false);
                  }}
                >
                  See all results for "{searchTerm}"
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400">
              No results found for "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
