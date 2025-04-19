import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { getImageUrl } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { Star, StarHalf, Heart, BookmarkCheck } from 'lucide-react';

interface ActivityListProps {
  userId: number;
  limit?: number;
}

const ActivityList: React.FC<ActivityListProps> = ({ userId, limit }) => {
  const { data: userData } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
    enabled: !!userId,
  });

  const {
    data: activities,
    isLoading: isActivityLoading,
    error: activityError,
  } = useQuery({
    queryKey: ['user-activity', userId],
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}/activity`);
      if (!res.ok) throw new Error('Failed to fetch activities');
      return res.json();
    },
    enabled: !!userId,
  });

  // Build list of movie IDs
  const movieIds = activities?.map((a: any) => a.movieId).join(',') ?? '';

  const {
    data: movies,
    isLoading: isMovieLoading,
    error: movieError,
  } = useQuery({
    queryKey: ['movie-cache', movieIds],
    queryFn: async () => {
      const res = await fetch(`/api/tmdb/movie/${movieIds}`);
      if (!res.ok) throw new Error('Failed to fetch movies');
      const json = await res.json();
      // Sometimes it's a single movie, sometimes an array — normalize it
      return Array.isArray(json) ? json : json.movies ?? [];
    },
    enabled: !!movieIds,
  });

  const isLoading = isActivityLoading || isMovieLoading;

  if (isLoading) {
    return <Loader text="Loading activity..." />;
  }

  if (activityError || movieError) {
    console.error('Fetch error:', activityError || movieError);
    return <div className="text-center py-4 text-gray-400">Failed to load activity.</div>;
  }

  if (!activities || activities.length === 0) {
    return <div className="text-center py-4 text-gray-400">No recent activity.</div>;
  }

  const entries = limit ? activities.slice(0, limit) : activities;

  const getMovieDetails = (movieId: number) => {
    return (
      movies?.find((m: any) => m.id === movieId) ?? {
        title: `Movie ${movieId}`,
        poster_path: null,
        release_date: new Date().toISOString().split('T')[0],
      }
    );
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {entries.map((activity: any) => {
        const movie = getMovieDetails(activity.movieId);
        return (
          <Card key={activity.id} className="bg-gray-800">
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
                    <div className="text-sm text-gray-400">
                      {activity.type === 'favorite' && 'favorited'}
                      {activity.type === 'watchlist' && 'added to watchlist'}
                      {activity.type === 'watched' && 'watched'}
                      {activity.type === 'review' && 'reviewed'}
                      {' • '}
                      {format(new Date(activity.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex p-4">
                <Link href={`/movie/${activity.movieId}`}>
                  <div className="w-16 flex-shrink-0">
                    <div className="aspect-[2/3] rounded overflow-hidden">
                      <img
                        src={
                          movie.poster_path
                            ? getImageUrl(movie.poster_path, 'w92')
                            : 'https://via.placeholder.com/92x138?text=No+Image'
                        }
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </Link>
                <div className="ml-3">
                  <h3 className="font-bold">
                    <Link href={`/movie/${activity.movieId}`}>{movie.title}</Link>
                  </h3>
                  {activity.type === 'favorite' && (
                    <div className="flex items-center gap-1 text-primary mt-1">
                      <Heart size={16} className="fill-primary" />
                      <span className="text-sm">Added to favorites</span>
                    </div>
                  )}
                  {activity.type === 'watchlist' && (
                    <div className="flex items-center gap-1 text-primary mt-1">
                      <BookmarkCheck size={16} className="fill-primary" />
                      <span className="text-sm">Added to watchlist</span>
                    </div>
                  )}
                  {activity.rating && (
                    <div className="flex text-yellow-400 text-sm my-1">
                      {renderRating(activity.rating)}
                    </div>
                  )}
                  {activity.review && (
                    <p className="text-sm text-gray-300">
                      {activity.review.length > 120
                        ? `${activity.review.substring(0, 120)}...`
                        : activity.review}
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
};

export default ActivityList;

























