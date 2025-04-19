import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  insertWatchlistSchema, insertFavoriteSchema, insertDiarySchema,
  insertFollowSchema, insertListSchema, insertListItemSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // TMDB API Proxy - securely use API key from server environment
  app.get('/api/tmdb/*', async (req, res) => {
    try {
      // Get the path after '/api/tmdb/'
      const tmdbPath = req.path.replace('/api/tmdb/', '');
      const queryParams = new URLSearchParams(req.query as Record<string, string>);
      queryParams.append('api_key', process.env.TMDB_API_KEY!);
      
      const url = `https://api.themoviedb.org/3/${tmdbPath}?${queryParams}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const error = await response.text();
        return res.status(response.status).send(error);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      handleError(res, error);
    }
  });

  // API Error Handler
  const handleError = (res: Response, error: any) => {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: fromZodError(error).message 
      });
    }
    return res.status(500).json({ message: error.message || "Internal server error" });
  };

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // User Routes
  app.get("/api/user/:username", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Update user profile
  app.patch("/api/user", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.updateUser(req.user!.id, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update the session user
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Watchlist Routes
  app.post("/api/watchlist", isAuthenticated, async (req, res) => {
    try {
      const data = insertWatchlistSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      // Check if already in watchlist
      const inWatchlist = await storage.isInWatchlist(data.userId, data.movieId);
      if (inWatchlist) {
        return res.status(400).json({ message: "Movie already in watchlist" });
      }
      
      const watchlistItem = await storage.addToWatchlist(data);
      res.status(201).json(watchlistItem);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete("/api/watchlist/:movieId", isAuthenticated, async (req, res) => {
    try {
      const movieId = parseInt(req.params.movieId);
      await storage.removeFromWatchlist(req.user!.id, movieId);
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/watchlist", isAuthenticated, async (req, res) => {
    try {
      const watchlist = await storage.getWatchlistByUser(req.user!.id);
      res.json(watchlist);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/user/:userId/watchlist", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const watchlist = await storage.getWatchlistByUser(userId);
      res.json(watchlist);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.get("/api/watchlist/:movieId/status", isAuthenticated, async (req, res) => {
    try {
      const movieId = parseInt(req.params.movieId);
      const inWatchlist = await storage.isInWatchlist(req.user!.id, movieId);
      res.json({ inWatchlist });
    } catch (error) {
      handleError(res, error);
    }
  });

  // Favorites Routes
  app.post("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const data = insertFavoriteSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      // Check if already in favorites
      const inFavorites = await storage.isInFavorites(data.userId, data.movieId);
      if (inFavorites) {
        return res.status(400).json({ message: "Movie already in favorites" });
      }
      
      const favoriteItem = await storage.addToFavorites(data);
      res.status(201).json(favoriteItem);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete("/api/favorites/:movieId", isAuthenticated, async (req, res) => {
    try {
      const movieId = parseInt(req.params.movieId);
      await storage.removeFromFavorites(req.user!.id, movieId);
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const favorites = await storage.getFavoritesByUser(req.user!.id);
      res.json(favorites);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/user/:userId/favorites", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const favorites = await storage.getFavoritesByUser(userId);
      res.json(favorites);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.get("/api/favorites/:movieId/status", isAuthenticated, async (req, res) => {
    try {
      const movieId = parseInt(req.params.movieId);
      const inFavorites = await storage.isInFavorites(req.user!.id, movieId);
      res.json({ inFavorites });
    } catch (error) {
      handleError(res, error);
    }
  });

  // Diary Routes
  app.post("/api/diary", isAuthenticated, async (req, res) => {
    try {
      const data = insertDiarySchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const diaryEntry = await storage.addDiaryEntry(data);
      res.status(201).json(diaryEntry);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch("/api/diary/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const diaryEntry = await storage.updateDiaryEntry(id, req.body);
      
      if (!diaryEntry) {
        return res.status(404).json({ message: "Diary entry not found" });
      }
      
      res.json(diaryEntry);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete("/api/diary/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeDiaryEntry(id);
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/diary", isAuthenticated, async (req, res) => {
    try {
      const diaryEntries = await storage.getDiaryEntriesByUser(req.user!.id);
      res.json(diaryEntries);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/user/:userId/diary", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const diaryEntries = await storage.getDiaryEntriesByUser(userId);
      res.json(diaryEntries);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.get("/api/diary/:movieId/status", isAuthenticated, async (req, res) => {
    try {
      const movieId = parseInt(req.params.movieId);
      const diaryEntries = await storage.getDiaryEntriesByUser(req.user!.id);
      const watched = diaryEntries.some(entry => entry.movieId === movieId);
      res.json({ watched });
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.delete("/api/diary/:movieId", isAuthenticated, async (req, res) => {
    try {
      const movieId = parseInt(req.params.movieId);
      const diaryEntries = await storage.getDiaryEntriesByUser(req.user!.id);
      const diaryEntry = diaryEntries.find(entry => entry.movieId === movieId);
      
      if (diaryEntry) {
        await storage.removeDiaryEntry(diaryEntry.id);
      }
      
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Follow Routes
  app.post("/api/follow", isAuthenticated, async (req, res) => {
    try {
      const data = insertFollowSchema.parse({
        followerId: req.user!.id,
        followingId: req.body.followingId
      });
      
      // Can't follow yourself
      if (data.followerId === data.followingId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      
      // Check if already following
      const isFollowing = await storage.isFollowing(data.followerId, data.followingId);
      if (isFollowing) {
        return res.status(400).json({ message: "Already following this user" });
      }
      
      const follow = await storage.followUser(data);
      res.status(201).json(follow);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete("/api/follow/:userId", isAuthenticated, async (req, res) => {
    try {
      const followingId = parseInt(req.params.userId);
      await storage.unfollowUser(req.user!.id, followingId);
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/followers", isAuthenticated, async (req, res) => {
    try {
      const followers = await storage.getFollowers(req.user!.id);
      res.json(followers);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/following", isAuthenticated, async (req, res) => {
    try {
      const following = await storage.getFollowing(req.user!.id);
      res.json(following);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/user/:userId/followers", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const followers = await storage.getFollowers(userId);
      res.json(followers);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/user/:userId/following", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const following = await storage.getFollowing(userId);
      res.json(following);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Lists Routes
  app.post("/api/lists", isAuthenticated, async (req, res) => {
    try {
      const data = insertListSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const list = await storage.createList(data);
      res.status(201).json(list);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch("/api/lists/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const list = await storage.getList(id);
      
      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }
      
      if (list.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const updatedList = await storage.updateList(id, req.body);
      res.json(updatedList);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete("/api/lists/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const list = await storage.getList(id);
      
      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }
      
      if (list.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      await storage.deleteList(id);
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/lists", isAuthenticated, async (req, res) => {
    try {
      const lists = await storage.getListsByUser(req.user!.id);
      res.json(lists);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/user/:userId/lists", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const lists = await storage.getListsByUser(userId);
      
      // Filter out private lists if not the owner
      const isOwner = req.isAuthenticated() && req.user!.id === userId;
      const filteredLists = isOwner ? lists : lists.filter(list => list.isPublic);
      
      res.json(filteredLists);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/lists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const list = await storage.getList(id);
      
      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }
      
      // Check if private list
      if (!list.isPublic) {
        const isOwner = req.isAuthenticated() && req.user!.id === list.userId;
        if (!isOwner) {
          return res.status(403).json({ message: "This list is private" });
        }
      }
      
      res.json(list);
    } catch (error) {
      handleError(res, error);
    }
  });

  // List Items Routes
  app.post("/api/lists/:listId/items", isAuthenticated, async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      const list = await storage.getList(listId);
      
      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }
      
      if (list.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const data = insertListItemSchema.parse({
        ...req.body,
        listId
      });
      
      const listItem = await storage.addListItem(data);
      res.status(201).json(listItem);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete("/api/lists/:listId/items/:movieId", isAuthenticated, async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      const movieId = parseInt(req.params.movieId);
      
      const list = await storage.getList(listId);
      
      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }
      
      if (list.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      await storage.removeListItem(listId, movieId);
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/lists/:listId/items", async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      
      const list = await storage.getList(listId);
      
      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }
      
      // Check if private list
      if (!list.isPublic) {
        const isOwner = req.isAuthenticated() && req.user!.id === list.userId;
        if (!isOwner) {
          return res.status(403).json({ message: "This list is private" });
        }
      }
      
      const listItems = await storage.getListItems(listId);
      res.json(listItems);
    } catch (error) {
      handleError(res, error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
