import { useQuery } from "@tanstack/react-query";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";
import { getPopularMovies, getPersonDetails, getTrending } from "@/lib/api";
import MoviesList from "@/components/MoviesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ForYouPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("recommended");
  
  // Fetch favorite movies and use them as a base for recommendations
  const { data: favorites, isLoading: favoritesLoading } = useQuery({
    queryKey: ['/api/user', user?.id, 'favorites'],
    queryFn: async () => {
      if (!user) return [];
      const response = await fetch(`/api/user/${user.id}/favorites`);
      if (!response.ok) throw new Error('Failed to fetch favorites');
      return await response.json();
    },
    enabled: !!user,
  });
  
  // Fetch trending movies
  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ['/api/tmdb/trending/movie/week'],
    queryFn: () => getTrending('movie', 'week'),
  });
  
  // Fetch popular movies
  const { data: popular, isLoading: popularLoading } = useQuery({
    queryKey: ['/api/tmdb/movie/popular'],
    queryFn: () => getPopularMovies(),
  });
  
  // Use favorites to create a "for you" recommendation algorithm
  // This is a simple implementation - in a real app this would be more sophisticated
  const getRecommendedMovies = () => {
    if (!favorites || favorites.length === 0 || !trending || !trending.results) {
      return trending?.results || [];
    }
    
    // Simple recommendation: Mix trending with weight towards genres in favorites
    const genreIds = new Set();
    favorites.forEach((fav: any) => {
      if (fav.movieDetails && fav.movieDetails.genre_ids) {
        fav.movieDetails.genre_ids.forEach((id: number) => genreIds.add(id));
      }
    });
    
    // If we have genre information, sort trending by matching genres
    if (genreIds.size > 0) {
      return [...trending.results].sort((a, b) => {
        const aMatches = a.genre_ids ? a.genre_ids.filter((id: number) => genreIds.has(id)).length : 0;
        const bMatches = b.genre_ids ? b.genre_ids.filter((id: number) => genreIds.has(id)).length : 0;
        return bMatches - aMatches;
      });
    }
    
    return trending.results;
  };
  
  const isLoading = favoritesLoading || trendingLoading || popularLoading;
  
  if (isLoading) {
    return <Loader text="Loading recommendations..." fullScreen />;
  }
  
  const recommendedMovies = getRecommendedMovies();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">For You</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommended">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Recommended For You</h2>
              {user ? (
                <MoviesList 
                  movies={recommendedMovies} 
                  type="movie" 
                  grid={true} 
                />
              ) : (
                <div className="bg-gray-800 p-6 rounded-lg text-center">
                  <h3 className="text-xl font-semibold mb-2">Sign in for personalized recommendations</h3>
                  <p className="text-gray-400 mb-4">Create an account or sign in to get recommendations based on your tastes.</p>
                  <a href="/auth" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90">
                    Sign In / Register
                  </a>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="trending">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Trending This Week</h2>
              {trending && trending.results && (
                <MoviesList 
                  movies={trending.results} 
                  type="movie" 
                  grid={true} 
                />
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="popular">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Popular Right Now</h2>
              {popular && popular.results && (
                <MoviesList 
                  movies={popular.results} 
                  type="movie" 
                  grid={true} 
                />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}