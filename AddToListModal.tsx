import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
        description: newListDescription.trim() 
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
      <DialogContent className="sm:max-w-md bg-black/95 border border-red-600/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-600">Add to List</DialogTitle>
        </DialogHeader>
        
        {isCreatingList ? (
          <form onSubmit={handleCreateList} className="space-y-4">
            <div>
              <Label htmlFor="listName" className="text-lg font-semibold text-gray-200">List Name</Label>
              <Input 
                id="listName" 
                value={newListName} 
                onChange={(e) => setNewListName(e.target.value)} 
                placeholder="Enter list name" 
                required 
                className="bg-gray-900 border-gray-700 focus:border-red-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="listDescription" className="text-lg font-semibold text-gray-200">Description (optional)</Label>
              <Textarea 
                id="listDescription" 
                value={newListDescription} 
                onChange={(e) => setNewListDescription(e.target.value)} 
                placeholder="Enter list description" 
                className="bg-gray-900 border-gray-700 focus:border-red-600 text-white"
              />
            </div>
            <DialogFooter className="flex justify-between sm:justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreatingList(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!newListName.trim() || createListMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Create & Add
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your lists"
                className="pl-8 bg-gray-900 border-gray-700 focus:border-red-600 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="text-center py-4">Loading your lists...</div>
              ) : filteredLists.length > 0 ? (
                filteredLists.map((list: List) => (
                  <div 
                    key={list.id} 
                    className="flex justify-between items-center p-3 hover:bg-red-600/10 rounded-md cursor-pointer transition-colors duration-200 border border-transparent hover:border-red-600/50"
                    onClick={() => handleAddToList(list.id)}
                  >
                    <div>
                      <h4 className="font-medium">{list.name}</h4>
                      {list.description && (
                        <p className="text-sm text-gray-400 truncate">{list.description}</p>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" className="hover:bg-red-600/20 hover:text-red-600">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400">
                  {searchQuery ? 'No matching lists found' : 'You have no lists yet'}
                </div>
              )}
            </div>
            
            <Button 
              onClick={() => setIsCreatingList(true)} 
              className="w-full bg-red-600 hover:bg-red-700 text-white border-none" 
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New List
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddToListModal;
