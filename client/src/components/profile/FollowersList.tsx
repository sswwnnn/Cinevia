
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/hooks/use-auth';

interface FollowersListProps {
  userId: number;
}

const FollowersList: React.FC<FollowersListProps> = ({ userId }) => {
  const { user } = useAuth();
  
  const { data: followers, isLoading, error } = useQuery({
    queryKey: [`/api/user/${userId}/followers`],
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}/followers`);
      if (!res.ok) throw new Error('Failed to fetch followers');
      return res.json();
    }
  });

  if (isLoading) {
    return <Loader text="Loading followers..." />;
  }

  if (error) {
    return <div className="text-center py-4 text-gray-400">Failed to load followers.</div>;
  }

  if (!followers || followers.length === 0) {
    return <div className="text-center py-4 text-gray-400">No followers yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {followers.map((follower: any) => (
        <div key={follower.id} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
          <Avatar className="h-12 w-12">
            <AvatarImage src={follower.avatarUrl} />
            <AvatarFallback>{follower.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <Link href={`/user/${follower.username}`}>
              <h3 className="font-semibold hover:text-primary">{follower.username}</h3>
            </Link>
            <p className="text-sm text-gray-400">Following since {new Date(follower.followedAt).toLocaleDateString()}</p>
          </div>
          {user && user.id !== follower.id && (
            <Button variant="outline" size="sm">Follow Back</Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default FollowersList;
