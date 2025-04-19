import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/hooks/use-auth';

const FollowersList = ({ userId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch followers with their user info
  const { data: followers, isLoading, error } = useQuery({
    queryKey: [`followers-info-${userId}`],
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}/followers/with-info`);
      if (!res.ok) throw new Error('Failed to fetch followers');
      return res.json();
    }
  });

  // Handle follow action
  const followMutation = useMutation({
    mutationFn: async (followingId) => {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followingId })
      });
      if (!res.ok) throw new Error('Failed to follow user');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries([`followers-info-${userId}`]);
    }
  });

  if (isLoading) return <Loader text="Loading followers..." />;
  if (error) return <div className="text-center py-4 text-gray-400">Failed to load followers.</div>;
  if (!followers || followers.length === 0) return <div className="text-center py-4 text-gray-400">No followers yet.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {followers.map((follow) => {
        const follower = follow.followerUser || {};
        
        return (
          <div key={follow.id} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={follower.avatarUrl} alt={follower.username} />
              <AvatarFallback>
                {follower.username ? follower.username.substring(0, 2).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <Link href={`/user/${follower.username || follower.id}`}>
                <h3 className="font-semibold hover:text-primary cursor-pointer">
                  {follower.username || `User #${follower.id}`}
                </h3>
              </Link>
              <p className="text-sm text-gray-400">
                Following since {new Date(follow.createdAt).toLocaleDateString()}
              </p>
            </div>
            {user && follower.id && user.id !== follower.id && (
              <Button
                variant="outline"
                size="sm"
                disabled={followMutation.isPending || follow.isFollowedByMe}
                onClick={() => followMutation.mutate(follower.id)}
              >
                {followMutation.isPending && followMutation.variables === follower.id
                  ? 'Following...'
                  : follow.isFollowedByMe
                    ? 'Following'
                    : 'Follow Back'}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FollowersList;
