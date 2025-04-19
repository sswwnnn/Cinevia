import React, { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getPopularPeople, getImageUrl } from '@/lib/api';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const PeoplePage: React.FC = () => {
  const [page, setPage] = useState(1);
  
  const { 
    data: peopleData, 
    isLoading, 
    error,
    isPreviousData
  } = useQuery({
    queryKey: ['/person/popular', page],
    queryFn: () => getPopularPeople({ page }),
    keepPreviousData: true
  });
  
  // Loading state
  if (isLoading && !isPreviousData) {
    return <Loader text="Loading popular people..." fullScreen />;
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p>Failed to load people. Please try again later.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Popular People</h1>
        
        {/* People Grid */}
        {peopleData?.results?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {peopleData.results.map((person: any) => (
              <div key={person.id} className="flex flex-col items-center">
                <Link href={`/person/${person.id}`} className="w-full">
                  <div className="relative rounded-lg overflow-hidden aspect-[2/3] mb-3 group">
                    {person.profile_path ? (
                      <img 
                        src={getImageUrl(person.profile_path, 'w300')} 
                        alt={person.name} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <Avatar className="h-24 w-24">
                          <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-center">{person.name}</h3>
                </Link>
                {person.known_for?.length > 0 && (
                  <p className="text-sm text-gray-400 text-center">
                    {person.known_for.slice(0, 2).map((credit: any) => credit.title || credit.name).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No people found.</p>
          </div>
        )}
        
        {/* Pagination */}
        {peopleData?.total_pages > 1 && (
          <div className="flex justify-between items-center mt-8">
            <Button 
              variant="outline" 
              onClick={() => setPage(old => Math.max(old - 1, 1))}
              disabled={page === 1}
            >
              Previous Page
            </Button>
            
            <span className="text-sm text-gray-400">
              Page {page} of {peopleData.total_pages > 500 ? 500 : peopleData.total_pages}
            </span>
            
            <Button 
              variant="outline" 
              onClick={() => setPage(old => (!peopleData || old < Math.min(peopleData.total_pages, 500) ? old + 1 : old))}
              disabled={page >= Math.min(peopleData.total_pages, 500)}
            >
              Next Page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PeoplePage;
