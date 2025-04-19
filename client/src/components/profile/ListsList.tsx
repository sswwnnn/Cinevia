"use client";

import { useEffect, useState } from "react";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import MovieCard from "@/components/movie-card"; // Make sure this path is correct

interface Movie {
  id: string;
  title: string;
  poster_path?: string;
}

interface MovieList {
  id: string;
  name: string;
  description?: string;
  items?: Movie[];
}

export default function ListsPage() {
  const { user } = useAuth();
  const [lists, setLists] = useState<MovieList[]>([]);

  useEffect(() => {
    if (user) {
      loadLists();
    }
  }, [user]);

  const loadLists = async () => {
    try {
      const response = await apiRequest("GET", "/api/user/lists");
      const data = await response.json();
      setLists(data);
    } catch (error) {
      console.error("Failed to load lists:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("title") as HTMLInputElement).value;
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;

    if (!name) return;

    try {
      await apiRequest("POST", "/api/lists", { name, description });
      loadLists(); // Reload lists instead of full page refresh
    } catch (error) {
      console.error("Failed to create list:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Movie Lists</h1>

        <div className="text-center py-12 border rounded-lg">
          <p className="text-lg font-medium mb-2">Create Your Movie Lists</p>
          <p className="text-muted-foreground mb-4">
            Organize your favorite movies into custom lists
          </p>

          {user && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Create New List</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New List</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="title">List Title</Label>
                      <Input id="title" name="title" required />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create List</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}

          <div className="mt-8 grid gap-6">
            {lists.map((list) => (
              <div key={list.id} className="border rounded-lg p-4 text-left">
                <h3 className="text-xl font-semibold mb-2">{list.name}</h3>
                <p className="text-muted-foreground mb-4">{list.description}</p>

                {list.items?.length ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {list.items.map((item) => (
                      <MovieCard key={item.id} movie={item} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No movies in this list yet.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
























