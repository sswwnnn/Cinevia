// TMDB API Documentation: https://developer.themoviedb.org/docs

// Using our proxy server to securely handle API requests
const BASE_API_URL = "/api/tmdb";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

type TmdbFetchOptions = {
  language?: string;
  page?: number;
  region?: string;
  includeAdult?: boolean;
  append_to_response?: string;
  query?: string;
  [key: string]: any; // Allow for additional properties
};

type SortOption = "popularity.desc" | "popularity.asc" | "release_date.desc" | "release_date.asc" | "vote_average.desc" | "vote_average.asc" | "original_title.asc" | "original_title.desc";

// Common fetch function for TMDB API through our proxy
const fetchFromTMDB = async (endpoint: string, options: TmdbFetchOptions = {}) => {
  const params = new URLSearchParams(
    Object.entries(options).map(([key, value]) => [key, String(value)])
  );

  const response = await fetch(`${BASE_API_URL}${endpoint}?${params}`);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`TMDB API Error: ${error}`);
  }
  
  return response.json();
};

// Get image URL with specified size
export const getImageUrl = (path: string | null, size: string = "original") => {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

// Get trending movies or TV shows
export const getTrending = (mediaType: "movie" | "tv" | "all", timeWindow: "day" | "week" = "day", options: TmdbFetchOptions = {}) => {
  return fetchFromTMDB(`/trending/${mediaType}/${timeWindow}`, options);
};

// Get popular movies
export const getPopularMovies = (options: TmdbFetchOptions = {}) => {
  return fetchFromTMDB("/movie/popular", options);
};

// Get now playing movies
export const getNowPlayingMovies = (options: TmdbFetchOptions = {}) => {
  return fetchFromTMDB("/movie/now_playing", options);
};

// Get upcoming movies
export const getUpcomingMovies = (options: TmdbFetchOptions = {}) => {
  return fetchFromTMDB("/movie/upcoming", options);
};

// Get top rated movies
export const getTopRatedMovies = (options: TmdbFetchOptions = {}) => {
  return fetchFromTMDB("/movie/top_rated", options);
};

// Get movie details
export const getMovieDetails = (movieId: number, options: TmdbFetchOptions = {}) => {
  return fetchFromTMDB(`/movie/${movieId}`, { 
    ...options, 
    append_to_response: "credits,videos,images,recommendations,similar,external_ids" 
  });
};

// Get popular TV shows
export const getPopularTvShows = (options: TmdbFetchOptions = {}) => {
  return fetchFromTMDB("/tv/popular", options);
};

// Get TV shows airing today
export const getTvAiringToday = (options: TmdbFetchOptions = {}) => {
  return fetchFromTMDB("/tv/airing_today", options);
};

// Get TV shows on the air
export const getTvOnTheAir = (options: TmdbFetchOptions = {}) => {
  return fetchFromTMDB("/tv/on_the_air", options);
};

// Get top rated TV shows
export const getTopRatedTvShows = (options: TmdbFetchOptions = {}) => {
  return fetchFromTMDB("/tv/top_rated", options);
};

// Get TV show details
export const getTvDetails = (tvId: number, options: TmdbFetchOptions = {}) => {
  return fetchFromTMDB(`/tv/${tvId}`, { 
    ...options, 
    append_to_response: "credits,videos,images,recommendations,similar,external_ids" 
  });
};

// Get popular people
export const getPopularPeople = (options: TmdbFetchOptions = {}) => {
  return fetchFromTMDB("/person/popular", options);
};

// Get person details
export const getPersonDetails = (personId: number, options: TmdbFetchOptions = {}) => {
  return fetchFromTMDB(`/person/${personId}`, { 
    ...options, 
    append_to_response: "movie_credits,tv_credits,images,external_ids" 
  });
};

// Search for movies, TV shows, or people
export const multiSearch = (query: string, options: TmdbFetchOptions = {}) => {
  return fetchFromTMDB("/search/multi", { ...options, query });
};

// Search for movies
export const searchMovies = (query: string, options: TmdbFetchOptions = {}) => {
  return fetchFromTMDB("/search/movie", { ...options, query });
};

// Search for TV shows
export const searchTvShows = (query: string, options: TmdbFetchOptions = {}) => {
  return fetchFromTMDB("/search/tv", { ...options, query });
};

// Search for people
export const searchPeople = (query: string, options: TmdbFetchOptions = {}) => {
  return fetchFromTMDB("/search/person", { ...options, query });
};

// Discover movies with filters
export const discoverMovies = (options: {
  sort_by?: SortOption;
  page?: number;
  with_genres?: string;
  with_original_language?: string;
  "vote_average.gte"?: number;
  "vote_average.lte"?: number;
  "primary_release_date.gte"?: string;
  "primary_release_date.lte"?: string;
  with_people?: string;
  with_crew?: string;
  with_companies?: string;
  include_adult?: boolean;
} = {}) => {
  return fetchFromTMDB("/discover/movie", options as any);
};

// Discover TV shows with filters
export const discoverTvShows = (options: {
  sort_by?: SortOption;
  page?: number;
  with_genres?: string;
  with_networks?: string;
  with_original_language?: string;
  "vote_average.gte"?: number;
  "vote_average.lte"?: number;
  "first_air_date.gte"?: string;
  "first_air_date.lte"?: string;
  with_companies?: string;
  include_adult?: boolean;
} = {}) => {
  return fetchFromTMDB("/discover/tv", options as any);
};

// Get movie genres
export const getMovieGenres = (options: TmdbFetchOptions = {}) => {
  return fetchFromTMDB("/genre/movie/list", options);
};

// Get TV show genres
export const getTvGenres = (options: TmdbFetchOptions = {}) => {
  return fetchFromTMDB("/genre/tv/list", options);
};

// Get movie certifications
export const getMovieCertifications = () => {
  return fetchFromTMDB("/certification/movie/list");
};

// Get TV show certifications
export const getTvCertifications = () => {
  return fetchFromTMDB("/certification/tv/list");
};
