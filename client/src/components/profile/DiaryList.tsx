import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { getImageUrl } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { Star, StarHalf } from 'lucide-react';

interface WatchedListProps {
  userId: number;
  limit?: number;
  showDiary?: boolean;
  showActivity?: boolean;
  grid?: boolean;
}

const WatchedList: React.FC<WatchedListProps> = ({ 
  userId, 
  limit,
  showDiary = false,
  showActivity = false,
  grid = false
}) => {
  const [page, setPage] = useState(1);
  
  // Fetch user data for avatar/name
  const { data: userData } = useQuery({
    queryKey: [`/api/user/${userId}`],
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    }
  });
  
  // Fetch user's diary entries
  const { data: diaryEntries, isLoading, error } = useQuery({
    queryKey: [`/api/user/${userId}/diary`],
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}/diary`);
      if (!res.ok) throw new Error('Failed to fetch diary entries');
      return res.json();
    }
  });
  
  // Fetch movie details
  const { data: movieCache } = useQuery({
  queryKey: [`watched-movies-${userId}`],
  queryFn: async () => {
    const moviePromises = diaryEntries?.map((e: any) => 
      fetch(`/api/tmdb/movie/${e.movieId}`).then(res => res.json())
    );
    const movies = await Promise.all(moviePromises || []);
    return { movies };
  },
  enabled: !!diaryEntries?.length
});

  
  const movieCacheLoading = movieCache === undefined;
  
  if (isLoading || movieCacheLoading) {
    return <Loader text="Loading watched movies..." />;
  }
  
  if (error) {
    return <div className="text-center py-4 text-gray-400">Failed to load diary entries.</div>;
  }
  
  if (!diaryEntries || diaryEntries.length === 0) {
    return <div className="text-center py-4 text-gray-400">No movies have been logged yet.</div>;
  }
  
  // Limit results if specified
  const entries = limit ? diaryEntries.slice(0, limit) : diaryEntries;
  
  // Find movie details from cache
  const getMovieDetails = (movieId: number) => {
    return movieCache?.movies?.find((m: any) => m.id === movieId) || {
      title: `Movie ${movieId}`,
      poster_path: null,
      release_date: new Date().toISOString().split('T')[0]
    };
  };
  
  // Render stars for rating
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
    
    return (
      <div className="flex">{stars}</div>
    );
  };
  
  // Grid layout
  if (grid) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                  {entry.watchedAt && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs">Watched: {format(new Date(entry.watchedAt), 'MMM d, yyyy')}</p>
                    </div>
                  )}
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
  }
  
  // Diary view
  if (showDiary) {
    return (
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Film</th>
              <th className="text-center p-4">Rating</th>
              <th className="text-center p-4 hidden md:table-cell">Liked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {entries.map((entry: any) => {
              const movie = getMovieDetails(entry.movieId);
              return (
                <tr key={entry.id} className="hover:bg-gray-700/50">
                  <td className="p-4 text-gray-400">
                    {format(new Date(entry.watchedAt), 'MMM d, yyyy')}
                  </td>
                  <td className="p-4">
                    <Link href={`/movie/${entry.movieId}`}>
                      <div className="flex items-center">
                        <div className="w-10 h-15 flex-shrink-0 mr-3">
                          <img 
                            src={movie.poster_path ? getImageUrl(movie.poster_path, 'w92') : 'https://via.placeholder.com/92x138?text=No+Image'} 
                            alt={movie.title} 
                            className="w-full h-auto rounded"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{movie.title}</div>
                          <div className="text-xs text-gray-400">
                            {movie.release_date ? format(new Date(movie.release_date), 'yyyy') : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="p-4 text-center">
                    {entry.rating ? (
                      <div className="flex justify-center text-yellow-400">
                        {renderRating(entry.rating)}
                      </div>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                  <td className="p-4 text-center hidden md:table-cell">
                    {entry.liked ? (
                      <span className="text-primary">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="currentColor" 
                          className="w-5 h-5 mx-auto"
                        >
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                      </span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
  
  // Activity view
  if (showActivity) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map((entry: any) => {
          const movie = getMovieDetails(entry.movieId);
          return (
            <Card key={entry.id} className="bg-gray-800">
              <CardContent className="p-0">
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={userData?.avatarUrl} alt={userData?.username} />
                      <AvatarFallback>
                        {userData?.username?.substring(0, 2).toUpperCase() || 'UN'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{userData?.username}</div>
                      <div className="text-xs text-gray-400">
                        {entry.watchedAt ? format(new Date(entry.watchedAt), 'MMM d, yyyy') : 'Recently'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex p-4">
                  <Link href={`/movie/${entry.movieId}`}>
                    <div className="w-16 flex-shrink-0">
                      <div className="aspect-[2/3] rounded overflow-hidden">
                        <img 
                          src={movie.poster_path ? getImageUrl(movie.poster_path, 'w92') : 'https://via.placeholder.com/92x138?text=No+Image'} 
                          alt={movie.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </Link>
                  <div className="ml-3">
                    <h3 className="font-bold">
                      <Link href={`/movie/${entry.movieId}`}>{movie.title}</Link>
                    </h3>
                    {entry.rating && (
                      <div className="flex text-yellow-400 text-sm my-1">
                        {renderRating(entry.rating)}
                      </div>
                    )}
                    {entry.review && (
                      <p className="text-sm text-gray-300">
                        {entry.review.length > 120 ? `${entry.review.substring(0, 120)}...` : entry.review}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }
  
  // Default view (simple list)
  return (
    <div className="space-y-4">
      {entries.map((entry: any) => {
        const movie = getMovieDetails(entry.movieId);
        return (
          <div key={entry.id} className="flex items-center p-3 bg-gray-800 rounded-lg">
            <Link href={`/movie/${entry.movieId}`}>
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
                <Link href={`/movie/${entry.movieId}`}>{movie.title}</Link>
              </h3>
              <p className="text-xs text-gray-400">
                Watched: {format(new Date(entry.watchedAt), 'MMM d, yyyy')}
              </p>
            </div>
            {entry.rating && (
              <div className="flex text-yellow-400 ml-4">
                {renderRating(entry.rating)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WatchedList;
