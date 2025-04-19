import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getTrending, getPopularMovies, getImageUrl } from '@/lib/api';
import MovieCard from '@/components/MovieCard';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

const HomePage: React.FC = () => {
  const [trendingTimeWindow, setTrendingTimeWindow] = useState<'day' | 'week'>('day');
  const [popularTab, setPopularTab] = useState('popular');
  
  const { 
    data: trendingData, 
    isLoading: trendingLoading, 
    error: trendingError 
  } = useQuery({
    queryKey: [`/trending/movie/${trendingTimeWindow}`],
    queryFn: () => getTrending('movie', trendingTimeWindow)
  });
  
  const { 
    data: popularData, 
    isLoading: popularLoading, 
    error: popularError 
  } = useQuery({
    queryKey: ['/movie/popular'],
    queryFn: () => getPopularMovies()
  });
  
  // Get a random backdrop for the hero section
  const [heroBackdrop, setHeroBackdrop] = useState('');
  
  useEffect(() => {
    if (popularData?.results && popularData.results.length > 0) {
      const randomMovie = popularData.results[Math.floor(Math.random() * popularData.results.length)];
      if (randomMovie.backdrop_path) {
        setHeroBackdrop(getImageUrl(randomMovie.backdrop_path, 'original') || '');
      }
    }
  }, [popularData]);
  
  if (trendingLoading || popularLoading) {
    return <Loader text="Loading movies..." fullScreen />;
  }
  
  if (trendingError || popularError) {
    return <div className="container mx-auto px-4 py-10 text-center">Error loading data</div>;
  }

  return (
    <div id="home-page">
      {/* Hero Banner */}
      <section className="relative" style={{ height: '450px' }}>
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: `url('${heroBackdrop}')`, 
            backgroundPosition: 'center 20%' 
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 relative h-full flex items-center">
          <div className="max-w-lg">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Welcome to Cinevia</h1>
            <p className="text-xl mb-6">Your Path to Unforgettable Discoveries.</p>
            <div className="flex space-x-4">
              <Button className="bg-primary hover:bg-primary/90">
                <Link href="/auth?tab=register">Join Now</Link>
              </Button>
              <Button variant="outline" className="bg-gray-800 hover:bg-gray-700 text-white">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Trending Section */}
      <section className="py-8 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Trending</h2>
            <div className="inline-flex rounded-full border border-gray-600 overflow-hidden">
              <button 
                className={`px-4 py-1 ${trendingTimeWindow === 'day' ? 'bg-primary text-white' : 'text-white hover:bg-gray-700'}`}
                onClick={() => setTrendingTimeWindow('day')}
              >
                Today
              </button>
              <button 
                className={`px-4 py-1 ${trendingTimeWindow === 'week' ? 'bg-primary text-white' : 'text-white hover:bg-gray-700'}`}
                onClick={() => setTrendingTimeWindow('week')}
              >
                This Week
              </button>
            </div>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {trendingData?.results?.slice(0, 10).map((movie: any) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                releaseDate={movie.release_date}
                voteAverage={movie.vote_average}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Popular Section */}
      <section className="py-8 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">What's Popular</h2>
            <Tabs defaultValue="popular" className="w-auto">
              <TabsList className="inline-flex rounded-full border border-gray-600 overflow-hidden bg-transparent text-sm">
                <TabsTrigger value="popular" className={popularTab === 'popular' ? 'bg-primary text-white' : 'text-white hover:bg-gray-700'} onClick={() => setPopularTab('popular')}>
                  Popular
                </TabsTrigger>
                <TabsTrigger value="streaming" className={popularTab === 'streaming' ? 'bg-primary text-white' : 'text-white hover:bg-gray-700'} onClick={() => setPopularTab('streaming')}>
                  Streaming
                </TabsTrigger>
                <TabsTrigger value="on-tv" className={popularTab === 'on-tv' ? 'bg-primary text-white' : 'text-white hover:bg-gray-700'} onClick={() => setPopularTab('on-tv')}>
                  On TV
                </TabsTrigger>
                <TabsTrigger value="in-theaters" className={popularTab === 'in-theaters' ? 'bg-primary text-white' : 'text-white hover:bg-gray-700'} onClick={() => setPopularTab('in-theaters')}>
                  In Theaters
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {popularData?.results?.slice(0, 10).map((movie: any) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                releaseDate={movie.release_date}
                voteAverage={movie.vote_average}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* For You / ML Recommendations */}
      <section className="py-8 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">For You</h2>
            <p className="text-gray-400">Personalized recommendations based on your watch history</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularData?.results?.slice(10, 16).map((movie: any) => (
              <div key={movie.id} className="flex flex-col">
                <div className="relative rounded-lg overflow-hidden mb-2 aspect-[2/3] group">
                  <img 
                    src={getImageUrl(movie.poster_path, 'w300') || ''} 
                    alt={movie.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-0 right-0 p-2">
                    <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {Math.round(movie.vote_average * 10)}%
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="default" 
                      size="icon" 
                      className="bg-primary text-white rounded-full"
                    >
                      <Link href={`/movie/${movie.id}`}>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14"></path>
                          <path d="M12 5v14"></path>
                        </svg>
                      </Link>
                    </Button>
                  </div>
                </div>
                <h3 className="font-semibold">
                  <Link href={`/movie/${movie.id}`}>
                    {movie.title}
                  </Link>
                </h3>
                <p className="text-gray-400 text-sm">
                  {movie.genre_ids?.slice(0, 2).map((id: number) => {
                    // This is a simplification - in a real app you'd map genre IDs to names
                    return id === 28 ? "Action" : id === 12 ? "Adventure" : "Drama";
                  }).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
