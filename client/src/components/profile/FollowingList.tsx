
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/hooks/use-auth';

interface FollowingListProps {
  userId: number;
}

const FollowingList: React.FC<FollowingListProps> = ({ userId }) => {
  const { user } = useAuth();
  
  const { data: following, isLoading, error } = useQuery({
    queryKey: [`/api/user/${userId}/following`],
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}/following`);
      if (!res.ok) throw new Error('Failed to fetch following');
      return res.json();
    }
  });

  if (isLoading) {
    return <Loader text="Loading following..." />;
  }

  if (error) {
    return <div className="text-center py-4 text-gray-400">Failed to load following.</div>;
  }

  if (!following || following.length === 0) {
    return <div className="text-center py-4 text-gray-400">Not following anyone yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {following.map((followedUser: any) => (
        <div key={followedUser.id} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
          <Avatar className="h-12 w-12">
            <AvatarImage src={followedUser.avatarUrl} />
            <AvatarFallback>{followedUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <Link href={`/user/${followedUser.username}`}>
              <h3 className="font-semibold hover:text-primary">{followedUser.username}</h3>
            </Link>
            <p className="text-sm text-gray-400">Following since {new Date(followedUser.followedAt).toLocaleDateString()}</p>
          </div>
          {user && user.id === userId && (
            <Button variant="outline" size="sm">Unfollow</Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default FollowingList;
