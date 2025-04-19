import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import ProfileStats from '@/components/profile/ProfileStats';
import DiaryList from '@/components/profile/DiaryList';
import FollowingList from '@/components/profile/FollowingList';
import FollowersList from '@/components/profile/FollowersList';
import ActivityList from '@/components/profile/ActivityList';
import FavoritesList from '@/components/profile/FavoritesList';
import WatchList from '@/components/profile/WatchList';
import FilmsList from '@/components/profile/FilmsList';
import { Edit, UserCheck, UserPlus, Calendar, Heart, BookmarkIcon, ListIcon, Loader } from 'lucide-react';

const ProfilePage = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch user data
  const { data: profileUser, isLoading: userLoading, error: userError } = useQuery({
    queryKey: [`/api/user/${username}`],
    queryFn: async () => {
      const res = await fetch(`/api/user/${username}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    }
  });

  // Check if following this user
  const { data: isFollowing, isLoading: followLoading } = useQuery({
    queryKey: [`/api/follow/${profileUser?.id}/status`],
    queryFn: async () => {
      if (!user || !profileUser) return false;
      try {
        const res = await fetch(`/api/follow/${profileUser.id}/status`);
        if (!res.ok) return false;
        const data = await res.json();
        return data.isFollowing;
      } catch (error) {
        return false;
      }
    },
    enabled: !!user && !!profileUser && user.id !== profileUser.id
  });

  // Follow user mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/follow', { followingId: profileUser.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/follow/${profileUser?.id}/status`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/${username}/followers`] });
      toast({
        title: 'Success',
        description: `You are now following ${profileUser.username}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to follow user',
        variant: 'destructive',
      });
    }
  });

  // Unfollow user mutation
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', `/api/follow/${profileUser.id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/follow/${profileUser?.id}/status`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/${username}/followers`] });
      toast({
        title: 'Success',
        description: `You have unfollowed ${profileUser.username}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to unfollow user',
        variant: 'destructive',
      });
    }
  });

  // Toggle follow
  const toggleFollow = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please login to follow users',
        variant: 'destructive',
      });
      return;
    }

    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userError || !profileUser) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <p className="text-gray-400 mb-6">We couldn't find a user with this username.</p>
        <Button variant="outline" asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  const isOwnProfile = user && user.id === profileUser.id;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Profile Header */}
      <div className="bg-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar className="h-32 w-32 border-4 border-primary">
                <AvatarImage src={profileUser.avatarUrl || undefined} alt={profileUser.username} />
                <AvatarFallback className="text-4xl">{profileUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>

            {/* User Info */}
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-3xl font-bold">{profileUser.username}</h1>
              <p className="text-gray-400 mt-1">Member since {new Date(profileUser.createdAt).toLocaleDateString()}</p>

              {profileUser.bio && (
                <p className="mt-4 text-gray-200">{profileUser.bio}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
                {isOwnProfile ? (
                  <Button variant="outline" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    className={`gap-2 ${isFollowing ? "" : "bg-primary hover:bg-primary/90"}`}
                    onClick={toggleFollow}
                    disabled={followMutation.isPending || unfollowMutation.isPending}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Navigation with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
          <div className="container mx-auto px-4">
            <TabsList className="h-auto overflow-x-auto bg-transparent justify-start pb-1">
              <TabsTrigger 
                value="profile" 
                className="whitespace-nowrap data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none px-4 py-3"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="whitespace-nowrap data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none px-4 py-3"
              >
                Activity
              </TabsTrigger>
              <TabsTrigger 
                value="films" 
                className="whitespace-nowrap data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none px-4 py-3"
              >
                Films
              </TabsTrigger>
              <TabsTrigger 
                value="diary" 
                className="whitespace-nowrap data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none px-4 py-3"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Diary
              </TabsTrigger>
              <TabsTrigger 
                value="watchlist" 
                className="whitespace-nowrap data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none px-4 py-3"
              >
                <BookmarkIcon className="h-4 w-4 mr-1" />
                Watchlist
              </TabsTrigger>
              <TabsTrigger value="followers" className="whitespace-nowrap data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none px-4 py-3">
                <UserCheck className="h-4 w-4 mr-1" />
                Followers
              </TabsTrigger>
              <TabsTrigger value="following" className="whitespace-nowrap data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none px-4 py-3">
                <UserPlus className="h-4 w-4 mr-1" />
                Following
              </TabsTrigger>
              <TabsTrigger 
                value="favorites" 
                className="whitespace-nowrap data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none px-4 py-3"
              >
                <Heart className="h-4 w-4 mr-1" />
                Favorites
              </TabsTrigger>
              <TabsTrigger 
                value="lists" 
                className="whitespace-nowrap data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none px-4 py-3"
              >
                <ListIcon className="h-4 w-4 mr-1" />
                Lists
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="bg-gray-900 min-h-[60vh]">
          <TabsContent value="profile" className="py-8">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats */}
                <ProfileStats userId={profileUser.id} />

                {/* Favorite Films */}
                <div className="lg:col-span-2">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">FAVORITE FILMS</h2>
                  </div>
                  <FavoritesList userId={profileUser.id} limit={10} grid={true} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="py-8">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">RECENT ACTIVITY</h2>
              <ActivityList userId={profileUser.id} limit={20} />
            </div>
          </TabsContent>

          <TabsContent value="films" className="py-8">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">FILMS</h2>
              <FilmsList userId={profileUser.id} grid={true} />
            </div>
          </TabsContent>

          <TabsContent value="diary" className="py-8">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">DIARY</h2>
              <DiaryList userId={profileUser.id} limit={20} showDiary={true} showReviews={true} />
            </div>
          </TabsContent>

          <TabsContent value="watchlist" className="py-8">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">WATCHLIST</h2>
              <WatchList userId={profileUser.id} />
            </div>
          </TabsContent>

          <TabsContent value="followers" className="py-8">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">Followers</h2>
              <FollowersList userId={profileUser.id} />
            </div>
          </TabsContent>

          <TabsContent value="following" className="py-8">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">Following</h2>
              <FollowingList userId={profileUser.id} />
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="py-8">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">FAVORITES</h2>
              <FavoritesList userId={profileUser.id} grid={true} />
            </div>
          </TabsContent>

          <TabsContent value="lists" className="py-8">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">LISTS</h2>
                {isOwnProfile && (
                  <Button variant="default" className="bg-primary hover:bg-primary/90">
                    Create New List
                  </Button>
                )}
              </div>

              {/* Lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* This would be populated with actual list data */}
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="font-bold text-xl">Best Films of 2024</h3>
                    <p className="text-gray-400 text-sm mt-1">Updated 2 days ago • 15 films</p>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-300 mb-4">My personal ranking of this year's best releases, updated monthly.</p>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {/* Placeholder for movie posters */}
                      <div className="w-12 h-18 flex-shrink-0 bg-gray-700 rounded"></div>
                      <div className="w-12 h-18 flex-shrink-0 bg-gray-700 rounded"></div>
                      <div className="w-12 h-18 flex-shrink-0 bg-gray-700 rounded"></div>
                      <div className="w-12 h-18 flex-shrink-0 bg-gray-700 rounded"></div>
                      <div className="w-12 h-18 flex-shrink-0 flex items-center justify-center bg-gray-700 rounded">
                        <span className="text-xs">+11</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="font-bold text-xl">Films to Watch</h3>
                    <p className="text-gray-400 text-sm mt-1">Updated 1 week ago • 27 films</p>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-300 mb-4">A collection of films I want to watch based on recommendations.</p>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {/* Placeholder for movie posters */}
                      <div className="w-12 h-18 flex-shrink-0 bg-gray-700 rounded"></div>
                      <div className="w-12 h-18 flex-shrink-0 bg-gray-700 rounded"></div>
                      <div className="w-12 h-18 flex-shrink-0 bg-gray-700 rounded"></div>
                      <div className="w-12 h-18 flex-shrink-0 flex items-center justify-center bg-gray-700 rounded">
                        <span className="text-xs">+24</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ProfilePage;