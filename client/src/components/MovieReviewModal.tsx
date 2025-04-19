import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface MovieReviewModalProps {
  movieId: number;
  movieTitle: string;
  posterPath: string;
  releaseYear: number;
  isWatched: boolean;
  onAddedToDiary?: () => void;
}

const MovieReviewModal: React.FC<MovieReviewModalProps> = ({
  movieId,
  movieTitle,
  posterPath,
  releaseYear,
  isWatched,
  onAddedToDiary
}) => {
  const { toast } = useToast();
  const today = new Date();
  
  const [open, setOpen] = useState(false);
  const [watchedDate, setWatchedDate] = useState<Date>(today);
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState<string>('');
  const [liked, setLiked] = useState<boolean>(false);
  const [tags, setTags] = useState<string>('');
  const [hasWatchedBefore, setHasWatchedBefore] = useState<boolean>(false);
  
  // Add to diary mutation
  const addToDiaryMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/diary', { 
        movieId,
        watchedDate: watchedDate.toISOString(),
        rating,
        review,
        liked
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/diary/status/${movieId}`] });
      toast({
        title: 'Success',
        description: 'Added to your diary',
      });
      if (onAddedToDiary) {
        onAddedToDiary();
      }
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add to diary',
        variant: 'destructive',
      });
    }
  });

  const saveReview = () => {
    addToDiaryMutation.mutate();
  };
  
  // Rating stars display and selection
  const renderRatingStars = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-500'} transition-colors hover:text-yellow-400`}
          >
            <Star className={rating >= star ? 'fill-yellow-400' : 'fill-none'} size={28} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="px-4 py-2">
          {isWatched ? "Edit review" : "Add to diary"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <div className="w-14 h-20">
                <img 
                  src={posterPath || 'https://via.placeholder.com/92x138?text=No+Image'} 
                  alt={movieTitle} 
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">{movieTitle}</h3>
                <p className="text-gray-400">{releaseYear}</p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="watched" 
                checked={true} 
                disabled 
              />
              <label htmlFor="watched" className="text-sm font-medium">
                Watched on
              </label>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-auto border-gray-700 bg-gray-700"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {watchedDate ? format(watchedDate, 'dd MMM yyyy') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-700">
                  <Calendar
                    mode="single"
                    selected={watchedDate}
                    onSelect={(date) => date && setWatchedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Checkbox 
                id="watched-before" 
                checked={hasWatchedBefore}
                onCheckedChange={(checked) => setHasWatchedBefore(!!checked)}
              />
              <label htmlFor="watched-before" className="ml-2 text-sm font-medium">
                I've watched this before
              </label>
            </div>
          </div>
          
          <Textarea
            placeholder="Add a review..."
            className="min-h-[100px] bg-gray-700 border-gray-600"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
          
          <div className="grid grid-cols-3 gap-4 items-center">
            <div>
              <label className="text-sm text-gray-400 block">Tags</label>
              <Input 
                placeholder="e.g. netflix" 
                className="mt-1 bg-gray-700 border-gray-600"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Press Tab to complete, Enter to create</p>
            </div>
            
            <div className="flex flex-col items-center">
              <label className="text-sm text-gray-400 mb-1">Rating</label>
              {renderRatingStars()}
            </div>
            
            <div className="flex flex-col items-center">
              <label className="text-sm text-gray-400 mb-1">Like</label>
              <button
                type="button"
                onClick={() => setLiked(!liked)}
                className={`p-2 rounded-full ${liked ? 'bg-primary/20' : 'bg-gray-700'}`}
              >
                <Heart 
                  size={30} 
                  className={`${liked ? 'text-primary' : 'text-gray-400'}`}
                  fill={liked ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={saveReview}
            disabled={addToDiaryMutation.isPending}
          >
            {addToDiaryMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MovieReviewModal;
