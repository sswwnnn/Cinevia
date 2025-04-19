import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { getImageUrl, getPersonDetails } from "@/lib/api";
import { Loader } from "@/components/ui/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import MovieCard from "@/components/MovieCard";
import { Calendar, Facebook, Globe, Instagram, Twitter } from "lucide-react";

export default function PersonDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("about");
  
  const { data: person, isLoading, error } = useQuery({
    queryKey: ['/api/tmdb/person', id, { append_to_response: 'movie_credits,tv_credits,external_ids,images' }],
    queryFn: () => getPersonDetails(Number(id), { append_to_response: 'movie_credits,tv_credits,external_ids,images' }),
    enabled: !!id,
  });

  if (isLoading) {
    return <Loader text="Loading person details..." fullScreen />;
  }

  if (error || !person) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p>Failed to load person details. Please try again later.</p>
      </div>
    );
  }

  // Format birthday
  const formatDate = (date: string) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate age
  const calculateAge = (birthday: string, deathday: string | null) => {
    if (!birthday) return null;
    
    const birthDate = new Date(birthday);
    const endDate = deathday ? new Date(deathday) : new Date();
    
    let age = endDate.getFullYear() - birthDate.getFullYear();
    const m = endDate.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const age = calculateAge(person.birthday, person.deathday);
  const knownFor = person.movie_credits?.cast
    ?.sort((a: any, b: any) => b.popularity - a.popularity)
    ?.slice(0, 4) || [];

  return (
    <div className="bg-gray-900">
      {/* Person Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Image */}
          <div className="w-72 flex-shrink-0">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src={person.profile_path ? getImageUrl(person.profile_path, 'h632') : 'https://via.placeholder.com/300x450?text=No+Image'} 
                alt={person.name} 
                className="w-full h-auto"
              />
            </div>
            
            {/* Social Media Links */}
            {(person.external_ids?.facebook_id || 
              person.external_ids?.instagram_id || 
              person.external_ids?.twitter_id) && (
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-2">Social Media</h3>
                <div className="flex items-center gap-3">
                  {person.external_ids?.facebook_id && (
                    <a 
                      href={`https://facebook.com/${person.external_ids.facebook_id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  
                  {person.external_ids?.instagram_id && (
                    <a 
                      href={`https://instagram.com/${person.external_ids.instagram_id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  
                  {person.external_ids?.twitter_id && (
                    <a 
                      href={`https://twitter.com/${person.external_ids.twitter_id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  
                  {person.homepage && (
                    <a 
                      href={person.homepage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                    >
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
            
            {/* Personal Info */}
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">Personal Info</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-400">Known For</h4>
                  <p>{person.known_for_department}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-400">Gender</h4>
                  <p>{person.gender === 1 ? 'Female' : person.gender === 2 ? 'Male' : 'Not specified'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-400">Birthday</h4>
                  <p>{formatDate(person.birthday)} {age !== null && `(${age} years old)`}</p>
                </div>
                
                {person.deathday && (
                  <div>
                    <h4 className="font-medium text-gray-400">Day of Death</h4>
                    <p>{formatDate(person.deathday)}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-400">Place of Birth</h4>
                  <p>{person.place_of_birth || 'Unknown'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-400">Also Known As</h4>
                  {person.also_known_as?.length > 0 ? (
                    <ul className="list-none">
                      {person.also_known_as.map((name: string, index: number) => (
                        <li key={index}>{name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No alternative names</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Person Details */}
          <div className="flex-grow">
            <h1 className="text-4xl font-bold mb-6">{person.name}</h1>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 bg-transparent">
                <TabsTrigger value="about" className="data-[state=active]:border-primary data-[state=active]:border-b-2">About</TabsTrigger>
                <TabsTrigger value="credits" className="data-[state=active]:border-primary data-[state=active]:border-b-2">Credits</TabsTrigger>
                <TabsTrigger value="photos" className="data-[state=active]:border-primary data-[state=active]:border-b-2">Photos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about">
                <div className="space-y-6">
                  {/* Biography */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Biography</h2>
                    {person.biography ? (
                      <div className="space-y-4">
                        {person.biography.split('\n\n').map((paragraph: string, index: number) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    ) : (
                      <p>We don't have a biography for {person.name}.</p>
                    )}
                  </div>
                  
                  {/* Known For Section */}
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Known For</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {knownFor.map((movie: any) => (
                        <MovieCard
                          key={movie.id}
                          id={movie.id}
                          title={movie.title}
                          posterPath={movie.poster_path}
                          releaseDate={movie.release_date}
                          voteAverage={movie.vote_average}
                          size="sm"
                          showRating={false}
                          type="movie"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="credits">
                <div className="space-y-8">
                  {/* Acting Credits */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Acting</h2>
                    {person.movie_credits?.cast && person.movie_credits.cast.length > 0 ? (
                      <div className="space-y-2">
                        {person.movie_credits.cast
                          .sort((a: any, b: any) => {
                            // Sort by release date, newest first
                            if (!a.release_date) return 1;
                            if (!b.release_date) return -1;
                            return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
                          })
                          .map((movie: any) => (
                            <Card key={movie.id} className="bg-gray-800 hover:bg-gray-700">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                  <div className="flex-shrink-0">
                                    {movie.release_date && (
                                      <div className="w-16 h-16 flex items-center justify-center">
                                        <Calendar className="mr-2 h-5 w-5 text-gray-400" />
                                        <span>{new Date(movie.release_date).getFullYear()}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">
                                      <a href={`/movie/${movie.id}`} className="hover:underline">
                                        {movie.title}
                                      </a>
                                    </h3>
                                    {movie.character && (
                                      <p className="text-sm text-gray-400">as {movie.character}</p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    ) : (
                      <p>No acting credits found.</p>
                    )}
                  </div>
                  
                  {/* TV Credits */}
                  {person.tv_credits?.cast && person.tv_credits.cast.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4">TV Shows</h2>
                      <div className="space-y-2">
                        {person.tv_credits.cast
                          .sort((a: any, b: any) => {
                            // Sort by first air date, newest first
                            if (!a.first_air_date) return 1;
                            if (!b.first_air_date) return -1;
                            return new Date(b.first_air_date).getTime() - new Date(a.first_air_date).getTime();
                          })
                          .map((show: any) => (
                            <Card key={show.id} className="bg-gray-800 hover:bg-gray-700">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                  <div className="flex-shrink-0">
                                    {show.first_air_date && (
                                      <div className="w-16 h-16 flex items-center justify-center">
                                        <Calendar className="mr-2 h-5 w-5 text-gray-400" />
                                        <span>{new Date(show.first_air_date).getFullYear()}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">
                                      <a href={`/tv/${show.id}`} className="hover:underline">
                                        {show.name}
                                      </a>
                                    </h3>
                                    {show.character && (
                                      <p className="text-sm text-gray-400">as {show.character}</p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Crew Credits */}
                  {person.movie_credits?.crew && person.movie_credits.crew.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Production</h2>
                      <div className="space-y-2">
                        {person.movie_credits.crew
                          .sort((a: any, b: any) => {
                            // Sort by release date, newest first
                            if (!a.release_date) return 1;
                            if (!b.release_date) return -1;
                            return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
                          })
                          .map((movie: any) => (
                            <Card key={`${movie.id}-${movie.job}`} className="bg-gray-800 hover:bg-gray-700">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                  <div className="flex-shrink-0">
                                    {movie.release_date && (
                                      <div className="w-16 h-16 flex items-center justify-center">
                                        <Calendar className="mr-2 h-5 w-5 text-gray-400" />
                                        <span>{new Date(movie.release_date).getFullYear()}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">
                                      <a href={`/movie/${movie.id}`} className="hover:underline">
                                        {movie.title}
                                      </a>
                                    </h3>
                                    {movie.job && (
                                      <p className="text-sm text-gray-400">{movie.job}</p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="photos">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Photos</h2>
                  {person.images?.profiles && person.images.profiles.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {person.images.profiles.map((image: any, index: number) => (
                        <div key={index} className="rounded-lg overflow-hidden">
                          <img 
                            src={image.file_path ? getImageUrl(image.file_path, 'w300') : 'https://via.placeholder.com/300x450?text=No+Image'} 
                            alt={`${person.name} - Photo ${index + 1}`}
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No photos available.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}