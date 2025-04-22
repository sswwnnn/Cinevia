"use client";

import { useEffect, useState } from "react";

import { NavigationMenu } from "@/components/ui/navigation-menu";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import MovieCard from "@/components/MovieCard";
import { Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Movie {
  id: string;
  title: string;
  poster_path?: string;
  overview?: string;
  release_date?: string;
}

interface MovieList {
  id: string;
  name: string;
  description?: string;
  items?: Movie[];
}

export default function ListsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lists, setLists] = useState<MovieList[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (user) {
      loadLists();
    }
  }, [user]);

  const loadLists = async () => {
    try {
      if (!user) {
        console.error("User is not authenticated");
        return;
      }
      console.log(`User ID: ${user.id}`); // Log user.id to verify it's defined

      const response = await apiRequest("GET", `/api/user/${user.id}/lists`); // Ensure correct API route
      const data = await response.json();
      setLists(data);
    } catch (error) {
      console.error("Failed to load lists:", error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiRequest("GET", `/api/movies/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Failed to search movies:", error);
      toast({
        title: "Error",
        description: "Failed to search movies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleMovieSelect = (movie: Movie) => {
    if (!selectedMovies.some(m => m.id === movie.id)) {
      setSelectedMovies([...selectedMovies, movie]);
    }
  };

  const handleMovieRemove = (movieId: string) => {
    setSelectedMovies(selectedMovies.filter(m => m.id !== movieId));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("title") as HTMLInputElement).value;
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;

    if (!name) return;

    try {
      // Create the list with isPublic parameter explicitly set
      const response = await apiRequest("POST", "/api/lists", { 
        name, 
        description, 
        isPublic: true,
        movies: selectedMovies.map(movie => ({ 
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path
        }))
      });
      
      // Check if the response was successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create list');
      }
      
      loadLists(); // Reload lists instead of full page refresh
      setIsModalOpen(false); // Close the modal after submission
    } catch (error) {
      console.error("Failed to create list:", error);
      alert(error instanceof Error ? error.message : 'Failed to create list. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavigationMenu />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">LISTS</h1>
          {user && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button variant="default" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => setIsModalOpen(true)}>Create New List</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] bg-black/95 border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-red-600">Create New List</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6 py-4">
                    <div>
                      <Label htmlFor="title" className="text-lg font-semibold text-gray-200">List Title</Label>
                      <Input id="title" name="title" required className="bg-gray-900 border-gray-700 focus:border-red-600 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-lg font-semibold text-gray-200">Description</Label>
                      <Textarea id="description" name="description" className="bg-gray-900 border-gray-700 focus:border-red-600 text-white" />
                    </div>
                    <div>
                      <Label className="text-lg font-semibold text-gray-200">Add Movies</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          placeholder="Search for movies"
                          className="pl-10 py-6 bg-gray-900 border-gray-700 focus:border-red-600 text-white text-lg"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            handleSearch(e.target.value);
                          }}
                        />
                      </div>
                      {isSearching ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="w-8 h-8 border-4 border-t-red-600 border-red-600/30 rounded-full animate-spin"></div>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-2">
                          {searchResults.map((movie) => (
                            <div
                              key={movie.id}
                              className="group relative cursor-pointer rounded-lg overflow-hidden transition-transform hover:scale-105"
                              onClick={() => handleMovieSelect(movie)}
                            >
                              <div className="aspect-[2/3]">
                                <img
                                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Image'}
                                  alt={movie.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <div>
                                  <h3 className="font-bold text-white">{movie.title}</h3>
                                  <p className="text-sm text-gray-300">{movie.release_date?.split("-")[0]}</p>
                                </div>
                                <div className="absolute top-2 right-2 bg-red-600 rounded-full p-1">
                                  <Plus className="h-6 w-6 text-white" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : searchQuery && (
                        <div className="text-center py-8 text-gray-400 text-lg">
                          No movies found
                        </div>
                      )}
                    </div>
                    {selectedMovies.length > 0 && (
                      <div className="mt-8">
                        <Label className="text-lg font-semibold text-gray-200 mb-4 block">Selected Movies</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {selectedMovies.map((movie) => (
                            <div
                              key={movie.id}
                              className="relative group rounded-lg overflow-hidden aspect-[2/3]"
                            >
                              <img
                                src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Image'}
                                alt={movie.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute bottom-2 left-2 right-2">
                                  <h3 className="font-bold text-white truncate">{movie.title}</h3>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="absolute top-2 right-2 p-2 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                onClick={() => handleMovieRemove(movie.id)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-white"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setIsModalOpen(false);
                      setSearchQuery("");
                      setSearchResults([]);
                      setSelectedMovies([]);
                    }}>Cancel</Button>
                    <Button type="submit">Create List</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {lists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lists.map((list) => (
              <div key={list.id} className="border border-gray-800 rounded-lg p-6 text-left bg-gray-900">
                <h3 className="text-xl font-semibold mb-2">{list.name}</h3>
                <p className="text-gray-400 mb-2">Updated {Math.floor(Math.random() * 10) + 1} days ago • {list.items?.length || 0} films</p>
                <p className="text-gray-300 mb-4">{list.description}</p>

                {list.items?.length ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {list.items.slice(0, 4).map((item) => (
                      <MovieCard 
                        key={item.id} 
                        id={Number(item.id)}
                        title={item.title}
                        posterPath={item.poster_path ?? null}
                      />
                    ))}
                    {list.items.length > 4 && (
                      <div className="relative bg-gray-800 rounded-md flex items-center justify-center">
                        <span className="text-white font-medium">+{list.items.length - 4}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400">No movies in this list yet.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-gray-800 rounded-lg">
            <p className="text-lg font-medium mb-2">You haven't created any lists yet</p>
            <p className="text-gray-400 mb-4">
              Create lists to organize your favorite movies
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
