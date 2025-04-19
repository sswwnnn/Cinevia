import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  avatarUrl: true,
  bio: true,
});

// Watchlist items
export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  movieId: integer("movie_id").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const insertWatchlistSchema = createInsertSchema(watchlist).pick({
  userId: true,
  movieId: true,
});

// Favorites
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  movieId: integer("movie_id").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).pick({
  userId: true,
  movieId: true,
});

// Watched / Diary entries
export const diary = pgTable("diary", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  movieId: integer("movie_id").notNull(),
  watchedAt: timestamp("watched_at").defaultNow().notNull(),
  rating: integer("rating"),
  review: text("review"),
  liked: boolean("liked").default(false),
});

export const insertDiarySchema = createInsertSchema(diary).pick({
  userId: true,
  movieId: true,
  watchedAt: true,
  rating: true,
  review: true,
  liked: true,
});

// Follows
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull(),
  followingId: integer("following_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFollowSchema = createInsertSchema(follows).pick({
  followerId: true,
  followingId: true,
});

// Custom Lists
export const lists = pgTable("lists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertListSchema = createInsertSchema(lists).pick({
  userId: true,
  name: true,
  description: true,
  isPublic: true,
});

// List Items
export const listItems = pgTable("list_items", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").notNull(),
  movieId: integer("movie_id").notNull(),
  notes: text("notes"),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const insertListItemSchema = createInsertSchema(listItems).pick({
  listId: true,
  movieId: true,
  notes: true,
});

// Movie cache (to store movie data from TMDB to reduce API calls)
export const movieCache = pgTable("movie_cache", {
  id: serial("id").primaryKey(),
  tmdbId: integer("tmdb_id").notNull().unique(),
  data: json("data").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertMovieCacheSchema = createInsertSchema(movieCache).pick({
  tmdbId: true,
  data: true,
});

// Type Definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type Watchlist = typeof watchlist.$inferSelect;

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

export type InsertDiary = z.infer<typeof insertDiarySchema>;
export type Diary = typeof diary.$inferSelect;

export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Follow = typeof follows.$inferSelect;

export type InsertList = z.infer<typeof insertListSchema>;
export type List = typeof lists.$inferSelect;

export type InsertListItem = z.infer<typeof insertListItemSchema>;
export type ListItem = typeof listItems.$inferSelect;

export type InsertMovieCache = z.infer<typeof insertMovieCacheSchema>;
export type MovieCache = typeof movieCache.$inferSelect;
