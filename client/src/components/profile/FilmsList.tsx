import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Star, StarHalf } from 'lucide-react';
import { getImageUrl } from '@/lib/api';
import { Loader } from '@/components/ui/loader';

interface FilmsListProps {
  userId: number;
  limit?: number;
  grid?: boolean;
}

const FilmsList: React.FC<FilmsListProps> = ({ userId, limit, grid = true }) => {
  // Fetch user's diary entries
  const { data: diaryEntries, isLoading: diaryLoading, error: diaryError } = useQuery({
    queryKey: [`/api/user/${userId}/diary`],
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}/diary`);
      if (!res.ok) throw new Error('Failed to fetch diary entries');
      return res.json();
    }
  });

  // Fetch movie details based on diary entries
  const { data: movieCache, isLoading: movieCacheLoading, error: movieCacheError } = useQuery({
    queryKey: [`/api/tmdb/movie/${diaryEntries?.map((e: any) => e.movieId).join(',')}`],
    queryFn: async () => {
      const res = await fetch(`/api/tmdb/movie/${diaryEntries?.map((e: any) => e.movieId).join(',')}`);
      if (!res.ok) throw new Error('Failed to fetch movies');
      return res.json();
    },
    enabled: !!diaryEntries?.length,
  });

  const isLoading = diaryLoading || movieCacheLoading;
  const error = diaryError || movieCacheError;

  if (isLoading) {
    return <Loader text="Loading films..." />;
  }

  if (error) {
    return <div className="text-center py-4 text-gray-400">Failed to load films.</div>;
  }

  if (!diaryEntries || diaryEntries.length === 0) {
    return <div className="text-center py-4 text-gray-400">No films have been logged yet.</div>;
  }

  const entries = limit ? diaryEntries.slice(0, limit) : diaryEntries;

  const getMovieDetails = (movieId: number) => {
    return movieCache?.movies?.find((m: any) => m.id === movieId) || {
      title: `Movie ${movieId}`,
      poster_path: null,
      release_date: new Date().toISOString().split('T')[0]
    };
  };

  const renderRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="fill-yellow-400 text-yellow-400" size={16} />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="fill-yellow-400 text-yellow-400" size={16} />);
    }

    return <div className="flex">{stars}</div>;
  };

  return (
    <div className={grid ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" : "space-y-4"}>
      {entries.map((entry: any) => {
        const movie = getMovieDetails(entry.movieId);
        return (
          <div key={entry.id} className="flex flex-col">
            <Link href={`/movie/${entry.movieId}`}>
              <div className="relative rounded-lg overflow-hidden mb-2 aspect-[2/3] group">
                <img 
                  src={movie.poster_path ? getImageUrl(movie.poster_path, 'w300') : 'https://via.placeholder.com/300x450?text=No+Image'} 
                  alt={movie.title} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </Link>
            <h3 className="font-semibold text-sm">{movie.title}</h3>
            {entry.rating && (
              <div className="mt-1">
                {renderRating(entry.rating)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FilmsList;








