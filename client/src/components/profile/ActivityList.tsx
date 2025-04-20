import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { getImageUrl } from '@/lib/api';
import { Star } from 'lucide-react';

interface ActivityListProps {
  userId: number;
  limit?: number;
}

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

interface Activity {
  id: number;
  userId: number;
  movieId: number;
  type: 'favorite' | 'watchlist' | 'watched' | 'review';
  rating?: number;
  review?: string;
  createdAt: string;
  movie?: Movie; // The API might already include movie data
}

const ActivityList: React.FC<ActivityListProps> = ({ userId, limit }) => {
  // Single request that returns activities with movie data included
  const {
    data: activities,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user-activities', userId],
    queryFn: async () => {
      // Try to get activities with movie data included
      try {
        const res = await fetch(`/api/user/${userId}/activities-with-movies`);
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch (e) {
        console.warn("Couldn't fetch combined data, falling back to separate requests");
      }

      // Fallback: Get activities and movies separately
      const activitiesRes = await fetch(`/api/user/${userId}/activity`);
      if (!activitiesRes.ok) throw new Error('Failed to fetch activities');
      
      const activitiesData = await activitiesRes.json();
      
      if (!activitiesData || activitiesData.length === 0) {
        return [];
      }
      
      // Get unique movie IDs
      const movieIdsSet = new Set<number>();
      activitiesData.forEach((a: Activity) => {
        if (a.movieId) movieIdsSet.add(a.movieId);
      });
      const movieIds = Array.from(movieIdsSet);
      
      if (movieIds.length === 0) {
        return activitiesData;
      }
      
      // Fetch movies one by one to avoid errors with batch requests
      const movies: Movie[] = [];
      
      for (const movieId of movieIds) {
        try {
          const movieRes = await fetch(`/api/tmdb/movie/${movieId}`);
          if (movieRes.ok) {
            const movieData = await movieRes.json();
            movies.push(movieData);
          }
        } catch (e) {
          console.error(`Failed to fetch movie ${movieId}`, e);
        }
      }
      
      // Combine the data
      return activitiesData.map((activity: Activity) => {
        const movie = movies.find(m => m.id === activity.movieId);
        return {
          ...activity,
          movie: movie || {
            id: activity.movieId,
            title: `Movie ${activity.movieId}`,
            poster_path: null,
            release_date: new Date().toISOString().split('T')[0],
          }
        };
      });
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-t-red-600 border-red-600/30 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    console.error("Activity fetch error:", error);
    return <div className="text-center py-8 text-gray-400">Failed to load activity.</div>;
  }

  if (!activities || activities.length === 0) {
    return <div className="text-center py-8 text-gray-400">No recent activity.</div>;
  }

  const entries = limit ? activities.slice(0, limit) : activities;

  const getPosterUrl = (posterPath: string | null): string => {
    if (!posterPath) return '/images/placeholder-poster.png'; // Provide a fallback image
    return getImageUrl(posterPath as string, 'w92');
  };

  const renderRating = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={`star-${i}`} 
          size={16}
          className={i < rating ? "fill-red-600 text-red-600" : "text-gray-600"} 
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  const getActivityVerb = (type: string) => {
    switch (type) {
      case 'favorite': return 'favorited';
      case 'watchlist': return 'added to watchlist';
      case 'watched': return 'watched';
      case 'review': return 'reviewed';
      default: return 'interacted with';
    }
  };

  return (
    <div className="space-y-6">
      {entries.map((activity: Activity) => {
        const movie = activity.movie || {
          id: activity.movieId,
          title: `Movie ${activity.movieId}`,
          poster_path: null,
          release_date: new Date().toISOString().split('T')[0],
        };
        
        return (
          <div key={activity.id} className="border-b border-gray-800 pb-6">
            <div className="flex">
              <div className="w-12 h-16 mr-4">
                <Link href={`/movie/${activity.movieId}`}>
                  <div className="aspect-[2/3] rounded overflow-hidden h-full">
                    <img
                      src={getPosterUrl(movie.poster_path)} // Ensure valid URL
                      alt={movie.title || "Movie poster"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-green-400">ishia</span>
                  <span className="text-gray-400">{getActivityVerb(activity.type)}</span>
                  <Link href={`/movie/${activity.movieId}`}>
                    <span className="font-semibold text-white hover:text-red-600 transition">{movie.title}</span>
                  </Link>
                </div>
                
                {activity.rating && activity.rating > 0 && (
                  <div className="mt-2">{renderRating(activity.rating)}</div>
                )}
                
                {activity.review && (
                  <p className="mt-2 text-gray-300">{activity.review}</p>
                )}
                
                <div className="mt-2 text-sm text-gray-500">
                  {format(new Date(activity.createdAt), 'MM/dd/yyyy')}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityList;
