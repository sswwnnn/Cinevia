
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { getImageUrl } from '@/lib/api';
import { Loader } from '@/components/ui/loader';
import { Heart } from 'lucide-react';

interface FavoritesListProps {
  userId: number;
  grid?: boolean;
}

const FavoritesList: React.FC<FavoritesListProps> = ({ 
  userId,
  grid = false
}) => {
  // Fetch user's favorites
  const { data: favorites, isLoading, error } = useQuery({
    queryKey: [`/api/user/${userId}/favorites`],
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}/favorites`);
      if (!res.ok) throw new Error('Failed to fetch favorites');
      return res.json();
    }
  });

  // Fetch movie details
  const { data: movieCache, isLoading: moviesLoading } = useQuery({
    queryKey: [`/api/tmdb/movie/${favorites?.map((f: any) => f.movieId).join(',')}`],
    queryFn: async () => {
      const moviePromises = favorites?.map((f: any) => 
        fetch(`/api/tmdb/movie/${f.movieId}`).then(res => res.json())
      );
      const movies = await Promise.all(moviePromises || []);
      return { movies };
    },
    enabled: !!favorites?.length
  });

  if (isLoading || moviesLoading) {
    return <Loader text="Loading favorites..." />;
  }

  if (error) {
    return <div className="text-center py-4 text-gray-400">Failed to load favorites.</div>;
  }

  if (!favorites || favorites.length === 0) {
    return <div className="text-center py-4 text-gray-400">No favorite movies have been added yet.</div>;
  }

  const getMovieDetails = (movieId: number) => {
    return movieCache?.movies?.find((m: any) => m.id === movieId) || {
      title: `Loading...`,
      poster_path: null,
      release_date: new Date().toISOString().split('T')[0]
    };
  };

  // Grid layout (posters)
  if (grid) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {favorites.map((item: any) => {
          const movie = getMovieDetails(item.movieId);
          return (
            <div key={item.id} className="relative group">
              <Link href={`/movie/${item.movieId}`}>
                <div className="aspect-[2/3] rounded-md overflow-hidden">
                  <img 
                    src={movie.poster_path ? getImageUrl(movie.poster_path, 'w300') : 'https://via.placeholder.com/300x450?text=No+Image'} 
                    alt={movie.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-gray-900/80 hover:bg-gray-800/80 text-white p-1.5 rounded-full">
                  <Heart className="h-4 w-4 fill-primary text-primary" />
                </div>
              </div>
              <h3 className="mt-2 text-sm font-medium truncate">{movie.title}</h3>
            </div>
          );
        })}
      </div>
    );
  }

  // Default view (list with details)
  return (
    <div className="space-y-4">
      {favorites.map((item: any) => {
        const movie = getMovieDetails(item.movieId);
        const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';

        return (
          <div key={item.id} className="flex items-center p-3 bg-gray-800 rounded-lg">
            <Link href={`/movie/${item.movieId}`}>
              <div className="w-12 h-18 flex-shrink-0 mr-4">
                <img 
                  src={movie.poster_path ? getImageUrl(movie.poster_path, 'w92') : 'https://via.placeholder.com/92x138?text=No+Image'} 
                  alt={movie.title} 
                  className="w-full h-auto rounded"
                />
              </div>
            </Link>
            <div className="flex-grow">
              <h3 className="font-medium">
                <Link href={`/movie/${item.movieId}`}>{movie.title}</Link>
              </h3>
              <p className="text-xs text-gray-400">{releaseYear}</p>
            </div>
            <div className="text-primary">
              <Heart className="h-5 w-5 fill-primary" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FavoritesList;
