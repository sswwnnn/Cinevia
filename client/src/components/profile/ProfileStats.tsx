import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar } from '@/components/ui/chart';
import { Loader } from '@/components/ui/loader';

interface ProfileStatsProps {
  userId: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ userId }) => {
  // Fetch diary entries for stats calculations
  const { data: diaryEntries, isLoading: diaryLoading } = useQuery({
    queryKey: [`/api/user/${userId}/diary`],
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}/diary`);
      if (!res.ok) throw new Error('Failed to fetch diary entries');
      return res.json();
    }
  });
  
  if (diaryLoading) {
    return <Loader text="Loading stats..." />;
  }
  
  // Calculate current year
  const currentYear = new Date().getFullYear();
  
  // Calculate stats
  const totalFilms = diaryEntries?.length || 0;
  
  // Filter entries for current year
  const currentYearEntries = diaryEntries?.filter((entry: any) => {
    const watchedYear = new Date(entry.watchedAt).getFullYear();
    return watchedYear === currentYear;
  }) || [];
  
  // Calculate total hours (assuming average of 2 hours per movie)
  const totalHours = Math.round(totalFilms * 2);
  
  // Calculate average rating
  const ratedEntries = diaryEntries?.filter((entry: any) => entry.rating) || [];
  const averageRating = ratedEntries.length 
    ? (ratedEntries.reduce((sum: number, entry: any) => sum + entry.rating, 0) / ratedEntries.length).toFixed(1)
    : 'N/A';
  
  // Count genres (simplified, in real app would use movie API data)
  const genreCounts: Record<string, number> = {};
  
  // Placeholder for genre data - in a real app, you'd get this from the movie cache
  const mockGenres = ['Drama', 'Action', 'Comedy', 'Sci-Fi', 'Horror', 'Thriller'];
  mockGenres.forEach(genre => {
    genreCounts[genre] = Math.floor(Math.random() * 30) + 1;
  });
  
  // Sort genres by count
  const sortedGenres = Object.entries(genreCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 3);
  
  // Calculate percentages
  const total = sortedGenres.reduce((sum, [, count]) => sum + count, 0);
  const genrePercentages = sortedGenres.map(([genre, count]) => ({
    genre,
    percentage: Math.round((count / total) * 100)
  }));
  
  return (
    <div className="lg:col-span-1">
      <h2 className="text-2xl font-bold mb-6">STATS FOR {currentYear}</h2>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col items-center p-4 bg-gray-900 rounded-lg">
            <span className="text-3xl font-bold text-primary">{currentYearEntries.length}</span>
            <span className="text-sm text-gray-400">Films</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-900 rounded-lg">
            <span className="text-3xl font-bold text-primary">{totalHours}</span>
            <span className="text-sm text-gray-400">Hours</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-900 rounded-lg">
            <span className="text-3xl font-bold text-primary">{averageRating}</span>
            <span className="text-sm text-gray-400">Average Rating</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-900 rounded-lg">
            <span className="text-3xl font-bold text-primary">{Math.ceil(totalFilms / 12)}</span>
            <span className="text-sm text-gray-400">Lists</span>
          </div>
        </div>
        
        <h3 className="font-bold mb-4">Most Watched Genres</h3>
        <div className="space-y-3">
          {genrePercentages.map(({ genre, percentage }) => (
            <div key={genre}>
              <div className="flex justify-between mb-1">
                <span>{genre}</span>
                <span>{percentage}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
