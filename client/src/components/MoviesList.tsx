import React from 'react';
import MovieCard from './MovieCard';

interface MoviesListProps {
  movies: any[];
  type?: 'movie' | 'tv';
  grid?: boolean;
  className?: string;
}

const MoviesList: React.FC<MoviesListProps> = ({ 
  movies, 
  type = 'movie', 
  grid = false,
  className = ''
}) => {
  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No movies or TV shows found.</p>
      </div>
    );
  }

  if (grid) {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${className}`}>
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title || movie.name}
            posterPath={movie.poster_path}
            releaseDate={movie.release_date || movie.first_air_date}
            voteAverage={movie.vote_average}
            type={type}
            size="md"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex space-x-4 overflow-x-auto pb-4 ${className}`}>
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          id={movie.id}
          title={movie.title || movie.name}
          posterPath={movie.poster_path}
          releaseDate={movie.release_date || movie.first_air_date}
          voteAverage={movie.vote_average}
          type={type}
        />
      ))}
    </div>
  );
};

export default MoviesList;
