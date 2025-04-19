import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getPopularMovies, getImageUrl } from '@/lib/api';
import { X } from 'lucide-react';

const OnboardingScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Check if user has seen onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);
  
  // Fetch movie posters for background
  const { data: movieData } = useQuery({
    queryKey: ['/movie/popular-onboarding'],
    queryFn: () => getPopularMovies({ page: 1 }),
  });
  
  // Handle dismiss
  const handleDismiss = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsVisible(false);
  };
  
  if (!isVisible) {
    return null;
  }
  
  const posters = movieData?.results?.slice(0, 12).map(movie => movie.poster_path) || [];
  
  return (
    <div className="fixed inset-0 bg-black z-50 flex justify-center items-center overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="poster-animation flex animate-slide">
          {/* First set of posters */}
          {posters.map((poster, index) => (
            <div key={`poster-1-${index}`} className="w-1/5 md:w-1/6 lg:w-1/8 p-1 flex-shrink-0 opacity-40">
              <img 
                src={getImageUrl(poster, 'w300')} 
                alt="Movie poster" 
                className="w-full h-auto object-cover rounded"
              />
            </div>
          ))}
          
          {/* Duplicate set for continuous animation */}
          {posters.map((poster, index) => (
            <div key={`poster-2-${index}`} className="w-1/5 md:w-1/6 lg:w-1/8 p-1 flex-shrink-0 opacity-40">
              <img 
                src={getImageUrl(poster, 'w300')} 
                alt="Movie poster" 
                className="w-full h-auto object-cover rounded"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center p-6 bg-black bg-opacity-70 rounded-lg max-w-2xl relative">
          <button 
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
            onClick={handleDismiss}
          >
            <X size={24} />
          </button>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to Cinevia</h1>
          <p className="text-xl mb-8">Your personal movie database. Track what you've watched, discover new films, and connect with other movie lovers.</p>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-md text-xl transition-colors"
            onClick={handleDismiss}
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
