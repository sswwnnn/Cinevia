import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ListPlus, Search, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface List {
  id: string;
  name: string;
  description?: string;
}

interface AddToListModalProps {
  movieId: number;
  movieTitle: string;
}

const AddToListModal: React.FC<AddToListModalProps> = ({ movieId, movieTitle }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [isRankedList, setIsRankedList] = useState(false);
  const [visibility, setVisibility] = useState('public');

  // Fetch user's lists
  const { data: lists, isLoading } = useQuery({
    queryKey: [`/api/user/${user?.id}/lists`],
    queryFn: async () => {
      if (!user) return [];
      const res = await apiRequest('GET', `/api/user/${user.id}/lists`);
      return res.json();
    },
    enabled: !!user && isOpen
  });

  // Create new list mutation
  const createListMutation = useMutation({
    mutationFn: async () => {
      if (!user || !newListName.trim()) return null;
      return await apiRequest('POST', '/api/lists', { 
        name: newListName.trim(), 
        description: newListDescription.trim(),
        isPublic: visibility === 'public',
        isRanked: isRankedList
      });
    },
    onSuccess: async (response) => {
      if (!response) return;
      const newList = await response.json();
      queryClient.invalidateQueries({ queryKey: [`/api/user/${user?.id}/lists`] });
      setNewListName('');
      setNewListDescription('');
      setIsCreatingList(false);
      toast({
        title: 'Success',
        description: `List "${newListName}" created successfully`,
      });
      
      // Add movie to the newly created list
      addToListMutation.mutate({ listId: newList.id });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create list',
        variant: 'destructive',
      });
    }
  });

  // Add movie to list mutation
  const addToListMutation = useMutation({
    mutationFn: async ({ listId }: { listId: string }) => {
      return await apiRequest('POST', `/api/lists/${listId}/items`, { movieId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${user?.id}/lists`] });
      toast({
        title: 'Success',
        description: `Added "${movieTitle}" to list`,
      });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add movie to list',
        variant: 'destructive',
      });
    }
  });

  // Filter lists based on search query
  const filteredLists = lists ? lists.filter((list: List) => 
    list.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleAddToList = (listId: string) => {
    addToListMutation.mutate({ listId });
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    createListMutation.mutate();
  };

  if (!user) {
    return (
      <Button 
        variant="outline" 
        size="icon" 
        className="w-12 h-12 rounded-full bg-black border-red-600 hover:bg-red-600/20 flex items-center justify-center transition-colors duration-200"
        onClick={() => {
          toast({
            title: 'Authentication required',
            description: 'Please login to add movies to your lists',
            variant: 'destructive',
          });
        }}
      >
        <ListPlus className="h-5 w-5 text-red-600" />
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="w-12 h-12 rounded-full bg-black border-red-600 hover:bg-red-600/20 flex items-center justify-center transition-colors duration-200"
        >
          <ListPlus className="h-5 w-5 text-red-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-gray-900 border border-gray-800 p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-gray-800">
          <DialogTitle className="text-2xl font-bold text-white">New List</DialogTitle>
        </DialogHeader>
        
        {isCreatingList ? (
          <form onSubmit={handleCreateList} className="p-4 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Label htmlFor="listName" className="text-lg font-semibold text-white">Name</Label>
                <div className="h-2 w-2 rounded-full bg-red-600"></div>
              </div>
              <Input 
                id="listName" 
                value={newListName} 
                onChange={(e) => setNewListName(e.target.value)} 
                placeholder="Enter list name" 
                required 
                className="bg-gray-800 border-gray-700 focus:border-red-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="listDescription" className="text-lg font-semibold text-white">Description</Label>
              <Textarea 
                id="listDescription" 
                value={newListDescription} 
                onChange={(e) => setNewListDescription(e.target.value)} 
                placeholder="Enter list description" 
                className="bg-gray-800 border-gray-700 focus:border-red-600 text-white h-32"
              />
              <div className="text-right mt-1">
                <button type="button" className="text-xs text-red-600 hover:underline">
                  Show supported HTML
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="tags" className="text-lg font-semibold text-white">Tags</Label>
              <Input 
                id="tags" 
                placeholder="eg. top 10" 
                className="bg-gray-800 border-gray-700 focus:border-red-600 text-white"
              />
              <div className="text-gray-400 text-xs mt-1">
                Press Tab to complete, Enter to create
              </div>
            </div>
            <div>
              <Label htmlFor="visibility" className="text-lg font-semibold text-white">Who can view</Label>
              <div className="relative mt-1">
                <select 
                  id="visibility" 
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-md text-white appearance-none"
                >
                  <option value="public">Anyone — Public list</option>
                  <option value="private">Only you — Private list</option>
                  <option value="followers">My followers</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="ranked" 
                checked={isRankedList}
                onCheckedChange={(checked) => setIsRankedList(checked === true)}
                className="h-5 w-5 border-gray-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
              />
              <Label htmlFor="ranked" className="text-white">Ranked list</Label>
              <span className="text-gray-400 text-sm ml-2">
                Show position for each film.
              </span>
            </div>
            <div className="flex justify-between pt-4 border-t border-gray-800">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreatingList(false)}
                className="bg-gray-800 hover:bg-gray-700 border-gray-700 text-white"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!newListName.trim() || createListMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white border-none"
              >
                Save
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Enter name of film..."
                className="pl-10 bg-gray-800 border-gray-700 focus:border-red-600 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute right-3 top-3 text-gray-400">or</span>
            </div>
            
            <Button 
              onClick={() => setIsCreatingList(true)} 
              className="mb-4 bg-red-600 hover:bg-red-700 text-white border-none" 
            >
              ADD A FILM
            </Button>
            
            <Button 
              variant="outline" 
              className="mb-4 ml-2 bg-gray-800 hover:bg-gray-700 border-gray-700 text-white"
            >
              IMPORT
            </Button>
            
            <div className="text-center mb-4">
              <span className="text-gray-400">
                Sort by
              </span>
              <button className="text-white ml-2 hover:underline">
                <span>Recently added</span>
                <svg className="inline-block h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="py-8 border border-gray-800 rounded mb-4 flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold text-white">Your list is empty.</h3>
              <p className="text-gray-400 mt-2 text-center">
                Add films using the field above, or from the links on a film poster or page.
              </p>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                className="bg-gray-800 hover:bg-gray-700 border-gray-700 text-white"
                onClick={() => setIsOpen(false)}
              >
                CANCEL
              </Button>
              <Button 
                disabled={true}
                className="bg-red-600 hover:bg-red-700 text-white border-none opacity-50"
              >
                SAVE
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddToListModal;
