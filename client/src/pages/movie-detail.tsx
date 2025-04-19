import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getMovieDetails, getImageUrl } from '@/lib/api';
import MovieReviewModal from '@/components/MovieReviewModal';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader } from '@/components/ui/loader';
import { useToast } from '@/hooks/use-toast';
import MovieCard from '@/components/MovieCard';
import { 
  Play, 
  ListPlus, 
  Heart, 
  Bookmark, 
  Star, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';

const MovieDetail = () => {
  const { id } = useParams();
  const movieId = parseInt(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('social');

  // Fetch movie details
  const { data: movie, isLoading, error } = useQuery({
    queryKey: [`/movie/${movieId}`],
    queryFn: () => getMovieDetails(movieId),
    enabled: !isNaN(movieId)
  });

  // Check if movie is in watchlist
  const { data: watchlistStatus, isLoading: watchlistLoading } = useQuery({
    queryKey: [`/api/watchlist/status/${movieId}`],
    queryFn: async () => {
      if (!user) return false;
      try {
        const res = await fetch(`/api/watchlist/${movieId}/status`);
        if (!res.ok) return false;
        const data = await res.json();
        return data.inWatchlist;
      } catch (error) {
        return false;
      }
    },
    enabled: !!user
  });

  // Check if movie is in favorites
  const { data: favoriteStatus, isLoading: favoriteLoading } = useQuery({
    queryKey: [`/api/favorites/status/${movieId}`],
    queryFn: async () => {
      if (!user) return false;
      try {
        const res = await fetch(`/api/favorites/${movieId}/status`);
        if (!res.ok) return false;
        const data = await res.json();
        return data.inFavorites;
      } catch (error) {
        return false;
      }
    },
    enabled: !!user
  });
  
  // Check if movie is watched
  const { data: watchedStatus, isLoading: watchedLoading } = useQuery({
    queryKey: [`/api/diary/status/${movieId}`],
    queryFn: async () => {
      if (!user) return false;
      try {
        const res = await fetch(`/api/diary/${movieId}/status`);
        if (!res.ok) return false;
        const data = await res.json();
        return data.watched;
      } catch (error) {
        return false;
      }
    },
    enabled: !!user
  });

  // Add to watchlist mutation
  const addToWatchlistMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/watchlist', { movieId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/watchlist/status/${movieId}`] });
      toast({
        title: 'Success',
        description: 'Added to your watchlist',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add to watchlist',
        variant: 'destructive',
      });
    }
  });

  // Remove from watchlist mutation
  const removeFromWatchlistMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', `/api/watchlist/${movieId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/watchlist/status/${movieId}`] });
      toast({
        title: 'Success',
        description: 'Removed from your watchlist',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove from watchlist',
        variant: 'destructive',
      });
    }
  });

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/favorites', { movieId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/status/${movieId}`] });
      toast({
        title: 'Success',
        description: 'Added to your favorites',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add to favorites',
        variant: 'destructive',
      });
    }
  });

  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', `/api/favorites/${movieId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/status/${movieId}`] });
      toast({
        title: 'Success',
        description: 'Removed from your favorites',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove from favorites',
        variant: 'destructive',
      });
    }
  });
  
  // Add to diary (mark as watched) mutation
  const addToDiaryMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      return await apiRequest('POST', '/api/diary', { 
        movieId,
        watchedDate: today,
        rating: null,
        review: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/diary/status/${movieId}`] });
      toast({
        title: 'Success',
        description: 'Marked as watched',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark as watched',
        variant: 'destructive',
      });
    }
  });
  
  // Remove from diary (mark as unwatched) mutation
  const removeFromDiaryMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', `/api/diary/${movieId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/diary/status/${movieId}`] });
      toast({
        title: 'Success',
        description: 'Marked as unwatched',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark as unwatched',
        variant: 'destructive',
      });
    }
  });

  // Toggle watchlist
  const toggleWatchlist = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please login to add movies to your watchlist',
        variant: 'destructive',
      });
      return;
    }

    if (watchlistStatus) {
      removeFromWatchlistMutation.mutate();
    } else {
      addToWatchlistMutation.mutate();
    }
  };

  // Toggle favorites
  const toggleFavorites = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please login to add movies to your favorites',
        variant: 'destructive',
      });
      return;
    }

    if (favoriteStatus) {
      removeFromFavoritesMutation.mutate();
    } else {
      addToFavoritesMutation.mutate();
    }
  };
  
  // Toggle watched status
  const toggleWatched = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please login to mark movies as watched',
        variant: 'destructive',
      });
      return;
    }

    if (watchedStatus) {
      removeFromDiaryMutation.mutate();
    } else {
      addToDiaryMutation.mutate();
    }
  };

  if (isLoading) {
    return <Loader text="Loading movie details..." fullScreen />;
  }

  if (error || !movie) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p>Failed to load movie details. Please try again later.</p>
      </div>
    );
  }

  const trailer = movie.videos?.results?.find(
    (video: any) => video.site === 'YouTube' && 
    (video.type === 'Trailer' || video.type === 'Teaser')
  );

  const releaseDate = new Date(movie.release_date);
  const releaseYear = releaseDate.getFullYear();
  const formattedReleaseDate = releaseDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
  
  const runtime = movie.runtime;
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  const formattedRuntime = `${hours}h ${minutes}m`;

  const userScore = Math.round(movie.vote_average * 10);
  
  let scoreColorClass = 'conic-gradient-medium';
  if (userScore >= 70) {
    scoreColorClass = 'conic-gradient-high';
  } else if (userScore < 50) {
    scoreColorClass = 'conic-gradient-low';
  }

  return (
    <div id="movie-detail-page">
      {/* Movie Backdrop */}
      <div className="relative">
        <div className="w-full h-[500px] relative">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ 
              backgroundImage: `url('${getImageUrl(movie.backdrop_path, 'original')}')`,
              filter: 'brightness(0.6)'
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/70 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 absolute inset-0 flex items-center">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="w-64 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl">
              <img 
                src={getImageUrl(movie.poster_path, 'w500') || 'https://via.placeholder.com/300x450?text=No+Image'} 
                alt={`${movie.title} poster`} 
                className="w-full h-auto"
              />
            </div>
            
            {/* Movie Info */}
            <div className="flex-grow">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <h1 className="text-4xl font-bold">{movie.title}</h1>
                <span className="text-2xl text-gray-400">({releaseYear})</span>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                {movie.release_dates?.results?.find((c: any) => c.iso_3166_1 === 'US')?.release_dates[0]?.certification && (
                  <span className="px-1 py-0.5 border border-gray-400 text-xs font-semibold rounded">
                    {movie.release_dates.results.find((c: any) => c.iso_3166_1 === 'US')?.release_dates[0]?.certification}
                  </span>
                )}
                <span>{formattedReleaseDate} (US)</span>
                <span>•</span>
                <span>
                  {movie.genres?.map((genre: any) => genre.name).join(', ')}
                </span>
                <span>•</span>
                <span>{formattedRuntime}</span>
              </div>
              
              <div className="flex items-center gap-6 mb-6">
                {/* User Score */}
                <div className="flex items-center gap-2">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ 
                      '--percentage': `${userScore}%`
                    } as React.CSSProperties}
                  >
                    <div className={`w-full h-full rounded-full flex items-center justify-center ${scoreColorClass}`}>
                      <div className="w-[calc(100%-6px)] h-[calc(100%-6px)] rounded-full bg-gray-900 flex items-center justify-center text-lg font-bold">
                        {userScore}<span className="text-sm">%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">User</span>
                    <span>Score</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center"
                  >
                    <ListPlus className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className={`w-12 h-12 rounded-full ${favoriteStatus ? 'bg-primary' : 'bg-gray-800'} flex items-center justify-center`}
                    onClick={toggleFavorites}
                  >
                    <Heart className="h-5 w-5" fill={favoriteStatus ? "white" : "none"} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className={`w-12 h-12 rounded-full ${watchlistStatus ? 'bg-primary' : 'bg-gray-800'} flex items-center justify-center`}
                    onClick={toggleWatchlist}
                  >
                    <Bookmark className="h-5 w-5" fill={watchlistStatus ? "white" : "none"} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className={`w-12 h-12 rounded-full ${watchedStatus ? 'bg-primary' : 'bg-gray-800'} flex items-center justify-center`}
                    onClick={toggleWatched}
                  >
                    <CheckCircle2 className="h-5 w-5" fill={watchedStatus ? "white" : "none"} />
                  </Button>
                  {trailer && (
                    <a 
                      href={`https://www.youtube.com/watch?v=${trailer.key}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md"
                    >
                      <Play className="h-4 w-4" />
                      <span>Play Trailer</span>
                    </a>
                  )}
                </div>

                {/* New Actions (ADDED as requested) */}
                <div className="flex items-center gap-3 mt-3">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className={`w-12 h-12 rounded-full ${watchlistStatus ? 'bg-primary' : 'bg-gray-800'} flex items-center justify-center`}
                    onClick={toggleWatchlist}
                  >
                    <Bookmark className="h-5 w-5" fill={watchlistStatus ? "white" : "none"} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className={`w-12 h-12 rounded-full ${favoriteStatus ? 'bg-primary' : 'bg-gray-800'} flex items-center justify-center`}
                    onClick={toggleFavorites}
                  >
                    <Heart className="h-5 w-5" fill={favoriteStatus ? "white" : "none"} />
                  </Button>

                  {/* This is the new Review Modal */}
                  <MovieReviewModal
                    movieId={movieId}
                    movieTitle={movie.title}
                    posterPath={getImageUrl(movie.poster_path, 'w92')}
                    releaseYear={releaseYear}
                    isWatched={watchedStatus || false}
                    onAddedToDiary={() => {
                      queryClient.invalidateQueries({ queryKey: [`/api/diary/status/${movieId}`] });
                    }}
                  />

                  {trailer && (
                    <a 
                      href={`https://www.youtube.com/watch?v=${trailer.key}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md"
                    >
                      <Play className="h-4 w-4" />
                      <span>Play Trailer</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs Section */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 max-w-[400px]">
              <TabsTrigger value="social" className="data-[state=active]:border-primary data-[state=active]:border-b-2">Social</TabsTrigger>
              <TabsTrigger value="media" className="data-[state=active]:border-primary data-[state=active]:border-b-2">Media</TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:border-primary data-[state=active]:border-b-2">Details</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <Tabs value={activeTab} className="bg-gray-900">
        {/* Social Content */}
        <TabsContent value="social" className="py-6">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="reviews">
              <TabsList className="flex space-x-6 border-b border-gray-800 pb-4 mb-6 bg-transparent">
                <TabsTrigger value="reviews" className="font-medium pb-2 data-[state=active]:border-primary data-[state=active]:border-b-2">
                  Reviews <span className="text-gray-500">{movie.reviews?.results?.length || 0}</span>
                </TabsTrigger>
                <TabsTrigger value="discussions" className="font-medium pb-2 data-[state=active]:border-primary data-[state=active]:border-b-2">
                  Discussions <span className="text-gray-500">0</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="reviews">
                {movie.reviews?.results?.length > 0 ? (
                  <div className="space-y-6">
                    {movie.reviews.results.map((review: any) => (
                      <div key={review.id} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                            {review.author_details.avatar_path ? (
                              <img 
                                src={review.author_details.avatar_path.startsWith('/https') 
                                  ? review.author_details.avatar_path.substring(1) 
                                  : getImageUrl(review.author_details.avatar_path, 'w45')} 
                                alt={review.author} 
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <span>{review.author.substring(0, 1).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold">{review.author}</h4>
                            <p className="text-xs text-gray-400">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm">{review.content.length > 300 ? `${review.content.substring(0, 300)}...` : review.content}</p>
                        {review.content.length > 300 && (
                          <a href={review.url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline">Read full review</a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">We don't have any reviews for {movie.title}.</p>
                )}
              </TabsContent>
              
              <TabsContent value="discussions">
                <p className="text-gray-400">We don't have any discussions for {movie.title}.</p>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
        
        {/* Media Section */}
        <TabsContent value="media" className="py-6">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="popular">
              <TabsList className="flex space-x-6 border-b border-gray-800 pb-4 mb-6 bg-transparent">
                <TabsTrigger value="popular" className="font-medium pb-2 data-[state=active]:border-primary data-[state=active]:border-b-2">
                  Most Popular
                </TabsTrigger>
                <TabsTrigger value="videos" className="font-medium pb-2 data-[state=active]:border-primary data-[state=active]:border-b-2">
                  Videos <span className="text-gray-500">{movie.videos?.results?.length || 0}</span>
                </TabsTrigger>
                <TabsTrigger value="backdrops" className="font-medium pb-2 data-[state=active]:border-primary data-[state=active]:border-b-2">
                  Backdrops <span className="text-gray-500">{movie.images?.backdrops?.length || 0}</span>
                </TabsTrigger>
                <TabsTrigger value="posters" className="font-medium pb-2 data-[state=active]:border-primary data-[state=active]:border-b-2">
                  Posters <span className="text-gray-500">{movie.images?.posters?.length || 0}</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="popular">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {trailer && (
                    <div className="relative rounded-lg overflow-hidden aspect-video">
                      <a 
                        href={`https://www.youtube.com/watch?v=${trailer.key}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <img 
                          src={`https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`} 
                          alt={trailer.name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center">
                            <Play className="h-8 w-8" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold">{movie.title.toUpperCase()}</h3>
                          </div>
                          <p className="uppercase text-sm">{trailer.type}</p>
                        </div>
                      </a>
                    </div>
                  )}
                  
                  {movie.images?.backdrops?.[0] && (
                    <div className="relative rounded-lg overflow-hidden aspect-video">
                      <img 
                        src={getImageUrl(movie.images.backdrops[0].file_path, 'w780')} 
                        alt="Backdrop" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="videos">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {movie.videos?.results?.map((video: any) => (
                    <div key={video.id} className="relative rounded-lg overflow-hidden aspect-video">
                      <a 
                        href={`https://www.youtube.com/watch?v=${video.key}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <img 
                          src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`} 
                          alt={video.name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                            <Play className="h-6 w-6" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                          <p className="font-medium text-sm">{video.name}</p>
                          <p className="text-xs text-gray-300">{video.type}</p>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="backdrops">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {movie.images?.backdrops?.map((backdrop: any, index: number) => (
                    <div key={index} className="rounded-lg overflow-hidden aspect-video">
                      <img 
                        src={getImageUrl(backdrop.file_path, 'w780')} 
                        alt={`Backdrop ${index}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="posters">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {movie.images?.posters?.map((poster: any, index: number) => (
                    <div key={index} className="rounded-lg overflow-hidden aspect-[2/3]">
                      <img 
                        src={getImageUrl(poster.file_path, 'w300')} 
                        alt={`Poster ${index}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
        
        {/* Details Section */}
        <TabsContent value="details" className="py-6">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-4">Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                  {movie.credits?.cast?.slice(0, 10).map((person: any) => (
                    <div key={person.id} className="text-center">
                      <div className="rounded-lg overflow-hidden mb-2 aspect-[2/3]">
                        <img 
                          src={person.profile_path ? getImageUrl(person.profile_path, 'w185') : 'https://via.placeholder.com/185x278?text=No+Image'} 
                          alt={person.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-semibold text-sm">{person.name}</h3>
                      <p className="text-xs text-gray-400">{person.character}</p>
                    </div>
                  ))}
                </div>
                
                <h2 className="text-2xl font-bold mb-4">Crew</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
                  {movie.credits?.crew?.filter((person: any) => 
                    ['Director', 'Producer', 'Screenplay', 'Writer'].includes(person.job)
                  ).slice(0, 6).map((person: any, index: number) => (
                    <div key={`${person.id}-${index}`}>
                      <h3 className="font-semibold">{person.name}</h3>
                      <p className="text-sm text-gray-400">{person.job}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-4">Facts</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-400">Original Title</h3>
                    <p>{movie.original_title}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-sm text-gray-400">Status</h3>
                    <p>{movie.status}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-sm text-gray-400">Original Language</h3>
                    <p>{movie.original_language?.toUpperCase()}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-sm text-gray-400">Budget</h3>
                    <p>${movie.budget?.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-sm text-gray-400">Revenue</h3>
                    <p>${movie.revenue?.toLocaleString()}</p>
                  </div>
                  
                  {movie.production_companies?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-gray-400">Production Companies</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {movie.production_companies.map((company: any) => (
                          <span key={company.id} className="bg-gray-800 px-2 py-1 rounded text-xs">
                            {company.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Recommendations */}
      <div className="py-6 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Recommendations</h2>
          
          {movie.recommendations?.results?.length > 0 ? (
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {movie.recommendations.results.slice(0, 8).map((recommendation: any) => (
                <div key={recommendation.id} className="flex-shrink-0 w-[250px]">
                  <div className="relative rounded-lg overflow-hidden group aspect-video">
                    <Link href={`/movie/${recommendation.id}`}>
                      <a>
                        <img 
                          src={recommendation.backdrop_path 
                            ? getImageUrl(recommendation.backdrop_path, 'w500') 
                            : 'https://via.placeholder.com/500x281?text=No+Image'} 
                          alt={recommendation.title} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">{recommendation.title}</h3>
                            <div className="bg-black/70 text-white px-2 py-0.5 rounded text-xs">
                              {Math.round(recommendation.vote_average * 10)}%
                            </div>
                          </div>
                        </div>
                      </a>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">We don't have enough data to suggest any movies based on {movie.title}.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
