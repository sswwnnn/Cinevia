import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { getImageUrl } from '@/lib/api';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Eye, X, Bookmark, BookmarkCheck } from 'lucide-react';

interface WatchListProps {
  userId: number;
  limit?: number;
}

const WatchList: React.FC<WatchListProps> = ({ userId, limit }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isOwnWatchlist = user && user.id === userId;

  // Fetch user's watchlist
  const { data: watchlist, isLoading, error } = useQuery({
    queryKey: [`/api/user/${userId}/watchlist`],
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}/watchlist`);
      if (!res.ok) throw new Error('Failed to fetch watchlist');
      return res.json();
    }
  });

  // Fetch movie details
  
const { data: movieCache } = useQuery({
  queryKey: [`watchlist-movies-${userId}`],
  queryFn: async () => {
    const moviePromises = watchlist?.map((w: any) =>
      fetch(`/api/tmdb/movie/${w.movieId}`).then(res => res.json())
    ) || [];

    const movies = await Promise.all(moviePromises);
    return { movies };
  },
  enabled: !!watchlist?.length
});

  const movieCacheLoading = movieCache === undefined;

  // Remove from watchlist mutation
  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (movieId: number) => {
      return await apiRequest('DELETE', `/api/watchlist/${movieId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}/watchlist`] });
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

  // Mark as watched mutation
  const markAsWatchedMutation = useMutation({
    mutationFn: async (movieId: number) => {
      // Remove from watchlist
      await apiRequest('DELETE', `/api/watchlist/${movieId}`, {});

      // Add to diary
      return await apiRequest('POST', '/api/diary', { 
        movieId, 
        watchedAt: new Date().toISOString() 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}/watchlist`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}/diary`] });
      toast({
        title: 'Success',
        description: 'Marked as watched and added to your diary',
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

  if (isLoading || movieCacheLoading) {
    return <Loader text="Loading watchlist..." />;
  }

  if (error) {
    return <div className="text-center py-4 text-gray-400">Failed to load watchlist.</div>;
  }

  if (!watchlist || watchlist.length === 0) {
    return <div className="text-center py-4 text-gray-400">No movies in watchlist yet.</div>;
  }

  // Limit results if specified
  const items = limit ? watchlist.slice(0, limit) : watchlist;

  // Find movie details from cache
  const getMovieDetails = (movieId: number) => {
    return movieCache?.movies?.find((m: any) => m.id === movieId) || {
      title: `Movie ${movieId}`,
      poster_path: null,
      release_date: new Date().toISOString().split('T')[0]
    };
  };

  // Handle remove from watchlist
  const handleRemove = (movieId: number) => {
    if (!isOwnWatchlist) {
      toast({
        title: 'Error',
        description: 'You can only modify your own watchlist',
        variant: 'destructive',
      });
      return;
    }

    removeFromWatchlistMutation.mutate(movieId);
  };

  // Handle mark as watched
  const handleMarkAsWatched = (movieId: number) => {
    if (!isOwnWatchlist) {
      toast({
        title: 'Error',
        description: 'You can only modify your own watchlist',
        variant: 'destructive',
      });
      return;
    }

    markAsWatchedMutation.mutate(movieId);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {items.map((item: any) => {
        const movie = getMovieDetails(item.movieId);
        return (
          <div key={item.id} className="flex flex-col">
            <div className="relative rounded-lg overflow-hidden mb-2 aspect-[2/3] group">
              <Link href={`/movie/${item.movieId}`}>
                <img 
                  src={movie.poster_path ? getImageUrl(movie.poster_path, 'w300') : 'https://via.placeholder.com/300x450?text=No+Image'} 
                  alt={movie.title} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
              {isOwnWatchlist && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-2">
                    <Button 
                      variant="default" 
                      size="icon"
                      className="bg-primary text-white rounded-full"
                      onClick={() => handleMarkAsWatched(item.movieId)}
                      disabled={markAsWatchedMutation.isPending}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="bg-gray-800 text-white rounded-full"
                      onClick={() => handleRemove(item.movieId)}
                      disabled={removeFromWatchlistMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <div className="bg-black/70 text-white p-1.5 rounded-full">
                  <BookmarkCheck className="h-4 w-4 fill-primary text-primary" />
                </div>
              </div>
            </div>
            <h3 className="font-semibold text-sm">
              <Link href={`/movie/${item.movieId}`}>{movie.title}</Link>
            </h3>
            <p className="text-gray-400 text-xs">
              {movie.release_date ? format(new Date(movie.release_date), 'yyyy') : 'N/A'}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default WatchList;