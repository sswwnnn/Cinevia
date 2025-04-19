import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLocation, useLocation as useNavigate } from 'wouter'; // Corrected import

const ProfileEditPage = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation(); // Corrected usage
  const navigate = useNavigate(); //useLocation will be used, but this name is kept for consistency
  const [formData, setFormData] = React.useState({
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser(formData);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      setLocation(`/profile/${user?.username}`); // Corrected navigation
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className="block mb-2">Avatar URL</label>
          <Input
            value={formData.avatarUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
            placeholder="Enter avatar URL"
          />
        </div>
        <div>
          <label className="block mb-2">Bio</label>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Write something about yourself"
            rows={4}
          />
        </div>
        <div className="flex gap-4">
          <Button type="submit">Save Changes</Button>
          <Button variant="outline" onClick={() => setLocation(`/profile/${user?.username}`)}>Cancel</Button> {/*Corrected navigation*/}
        </div>
      </form>
    </div>
  );
};

export default ProfileEditPage;