import { 
  User, InsertUser, Watchlist, InsertWatchlist, 
  Favorite, InsertFavorite, Diary, InsertDiary,
  Follow, InsertFollow, List, InsertList,
  ListItem, InsertListItem, MovieCache, InsertMovieCache,
  users, watchlist, favorites, diary, follows, lists, listItems, movieCache
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Watchlist operations
  addToWatchlist(item: InsertWatchlist): Promise<Watchlist>;
  removeFromWatchlist(userId: number, movieId: number): Promise<void>;
  getWatchlistByUser(userId: number): Promise<Watchlist[]>;
  isInWatchlist(userId: number, movieId: number): Promise<boolean>;
  
  // Favorites operations
  addToFavorites(item: InsertFavorite): Promise<Favorite>;
  removeFromFavorites(userId: number, movieId: number): Promise<void>;
  getFavoritesByUser(userId: number): Promise<Favorite[]>;
  isInFavorites(userId: number, movieId: number): Promise<boolean>;
  
  // Diary operations
  addDiaryEntry(entry: InsertDiary): Promise<Diary>;
  updateDiaryEntry(id: number, entry: Partial<Diary>): Promise<Diary | undefined>;
  removeDiaryEntry(id: number): Promise<void>;
  getDiaryEntriesByUser(userId: number): Promise<Diary[]>;
  
  // Follow operations
  followUser(follow: InsertFollow): Promise<Follow>;
  unfollowUser(followerId: number, followingId: number): Promise<void>;
  getFollowers(userId: number): Promise<Follow[]>;
  getFollowing(userId: number): Promise<Follow[]>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  
  // List operations
  createList(list: InsertList): Promise<List>;
  updateList(id: number, list: Partial<List>): Promise<List | undefined>;
  deleteList(id: number): Promise<void>;
  getListsByUser(userId: number): Promise<List[]>;
  getList(id: number): Promise<List | undefined>;
  
  // List item operations
  addListItem(item: InsertListItem): Promise<ListItem>;
  removeListItem(listId: number, movieId: number): Promise<void>;
  getListItems(listId: number): Promise<ListItem[]>;
  
  // Movie cache operations
  cacheMovie(movie: InsertMovieCache): Promise<MovieCache>;
  getCachedMovie(tmdbId: number): Promise<MovieCache | undefined>;
  
  // Session store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  // Watchlist methods
  async addToWatchlist(item: InsertWatchlist): Promise<Watchlist> {
    const [watchlistItem] = await db.insert(watchlist).values(item).returning();
    return watchlistItem;
  }
  
  async removeFromWatchlist(userId: number, movieId: number): Promise<void> {
    await db.delete(watchlist)
      .where(
        and(
          eq(watchlist.userId, userId),
          eq(watchlist.movieId, movieId)
        )
      );
  }
  
  async getWatchlistByUser(userId: number): Promise<Watchlist[]> {
    return await db.select().from(watchlist).where(eq(watchlist.userId, userId));
  }
  
  async isInWatchlist(userId: number, movieId: number): Promise<boolean> {
    const [item] = await db.select().from(watchlist)
      .where(
        and(
          eq(watchlist.userId, userId),
          eq(watchlist.movieId, movieId)
        )
      );
    return !!item;
  }
  
  // Favorites methods
  async addToFavorites(item: InsertFavorite): Promise<Favorite> {
    const [favoriteItem] = await db.insert(favorites).values(item).returning();
    return favoriteItem;
  }
  
  async removeFromFavorites(userId: number, movieId: number): Promise<void> {
    await db.delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.movieId, movieId)
        )
      );
  }
  
  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId));
  }
  
  async isInFavorites(userId: number, movieId: number): Promise<boolean> {
    const [item] = await db.select().from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.movieId, movieId)
        )
      );
    return !!item;
  }
  
  // Diary / watched movies methods
  async addDiaryEntry(entry: InsertDiary): Promise<Diary> {
    const [diaryEntry] = await db.insert(diary).values(entry).returning();
    return diaryEntry;
  }
  
  async updateDiaryEntry(id: number, entryData: Partial<Diary>): Promise<Diary | undefined> {
    const [updatedEntry] = await db.update(diary)
      .set(entryData)
      .where(eq(diary.id, id))
      .returning();
    return updatedEntry;
  }
  
  async removeDiaryEntry(id: number): Promise<void> {
    await db.delete(diary).where(eq(diary.id, id));
  }
  
  async getDiaryEntriesByUser(userId: number): Promise<Diary[]> {
    return await db.select().from(diary).where(eq(diary.userId, userId));
  }
  
  // Follow methods
  async followUser(follow: InsertFollow): Promise<Follow> {
    const [followEntry] = await db.insert(follows).values(follow).returning();
    return followEntry;
  }
  
  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    await db.delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );
  }
  
  async getFollowers(userId: number): Promise<Follow[]> {
    return await db.select().from(follows).where(eq(follows.followingId, userId));
  }
  
  async getFollowing(userId: number): Promise<Follow[]> {
    return await db.select().from(follows).where(eq(follows.followerId, userId));
  }
  
  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const [follow] = await db.select().from(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );
    return !!follow;
  }
  
  // List methods
  async createList(list: InsertList): Promise<List> {
    const [newList] = await db.insert(lists).values(list).returning();
    return newList;
  }
  
  async updateList(id: number, listData: Partial<List>): Promise<List | undefined> {
    const [updatedList] = await db.update(lists)
      .set(listData)
      .where(eq(lists.id, id))
      .returning();
    return updatedList;
  }
  
  async deleteList(id: number): Promise<void> {
    // First, delete all items in the list
    await db.delete(listItems).where(eq(listItems.listId, id));
    
    // Then delete the list itself
    await db.delete(lists).where(eq(lists.id, id));
  }
  
  async getListsByUser(userId: number): Promise<List[]> {
    return await db.select().from(lists).where(eq(lists.userId, userId));
  }
  
  async getList(id: number): Promise<List | undefined> {
    const [list] = await db.select().from(lists).where(eq(lists.id, id));
    return list;
  }
  
  // List item methods
  async addListItem(item: InsertListItem): Promise<ListItem> {
    const [listItem] = await db.insert(listItems).values(item).returning();
    return listItem;
  }
  
  async removeListItem(listId: number, movieId: number): Promise<void> {
    await db.delete(listItems)
      .where(
        and(
          eq(listItems.listId, listId),
          eq(listItems.movieId, movieId)
        )
      );
  }
  
  async getListItems(listId: number): Promise<ListItem[]> {
    return await db.select().from(listItems).where(eq(listItems.listId, listId));
  }
  
  // Movie cache methods
  async cacheMovie(movie: InsertMovieCache): Promise<MovieCache> {
    const [cacheEntry] = await db.insert(movieCache).values(movie).returning();
    return cacheEntry;
  }
  
  async getCachedMovie(tmdbId: number): Promise<MovieCache | undefined> {
    const [movie] = await db.select().from(movieCache).where(eq(movieCache.tmdbId, tmdbId));
    return movie;
  }
}

// Export the database storage
export const storage = new DatabaseStorage();