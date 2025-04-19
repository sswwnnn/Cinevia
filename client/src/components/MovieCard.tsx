import React from 'react';
import { Link } from 'wouter';
import CircleRating from './CircleRating';
import { getImageUrl } from '@/lib/api';
import { format } from 'date-fns';

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate?: string;
  voteAverage?: number;
  size?: 'sm' | 'md' | 'lg';
  showRating?: boolean;
  type?: 'movie' | 'tv';
}

const MovieCard: React.FC<MovieCardProps> = ({ 
  id, 
  title, 
  posterPath, 
  releaseDate,
  voteAverage = 0,
  size = 'md',
  showRating = true,
  type = 'movie'
}) => {
  const percentage = Math.round(voteAverage * 10);
  const posterSize = size === 'sm' ? 'w-32' : size === 'md' ? 'w-40' : 'w-56';
  const releaseYear = releaseDate ? format(new Date(releaseDate), 'yyyy') : '';
  const ratingSize = size === 'sm' ? 30 : size === 'md' ? 40 : 50;
  
  const placeholderImage = 'https://via.placeholder.com/300x450?text=No+Image';
  const posterUrl = posterPath ? getImageUrl(posterPath, 'w300') : placeholderImage;
  
  const linkPath = `/${type}/${id}`;

  return (
    <div className={`${posterSize} flex-shrink-0`}>
      <div className="relative rounded-lg overflow-hidden group">
        <Link href={linkPath}>
          <img 
            src={posterUrl} 
            alt={`${title} poster`}
            className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="text-xs">{releaseDate && format(new Date(releaseDate), 'MMM dd, yyyy')}</div>
          </div>
        </Link>
        
        {showRating && (
          <div 
            className="absolute bottom-2 -left-3"
            style={{ transform: 'translate(50%, 50%)' }}
          >
            <CircleRating percentage={percentage} size={ratingSize} />
          </div>
        )}
      </div>
      
      <h3 className="mt-2 font-semibold text-sm truncate">
        <Link href={linkPath}>
          {title}
          {releaseYear && <span className="text-gray-400 ml-1">({releaseYear})</span>}
        </Link>
      </h3>
    </div>
  );
};

export default MovieCard;
