import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Dashboard {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  datasetSize: number;
}

export interface ProcessedPost {
  id: string;
  dashboardId: string;
  userId: string;
  postId: string;
  caption: string;
  likes: number;
  commentsCount: number;
  shares: number;
  timestamp: string;
  comments: string[];
  sentimentScore: number;
  sentimentLabel: 'positive' | 'neutral' | 'negative';
  emotionLabel?: 'Happy' | 'Angry' | 'Excited' | 'Neutral';
  engagementScore: number;
}

interface AnalyticsDB extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: { 'by-email': string; 'by-username': string };
  };
  dashboards: {
    key: string;
    value: Dashboard;
    indexes: { 'by-userId': string };
  };
  posts: {
    key: string;
    value: ProcessedPost;
    indexes: { 'by-dashboardId': string; 'by-userId': string };
  };
  sessions: {
    key: string;
    value: { userId: string; token: string; expiresAt: string };
  };
}

let dbInstance: IDBPDatabase<AnalyticsDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<AnalyticsDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<AnalyticsDB>('analytics-dashboard', 1, {
    upgrade(db) {
      const userStore = db.createObjectStore('users', { keyPath: 'id' });
      userStore.createIndex('by-email', 'email', { unique: true });
      userStore.createIndex('by-username', 'username', { unique: true });

      const dashStore = db.createObjectStore('dashboards', { keyPath: 'id' });
      dashStore.createIndex('by-userId', 'userId');

      const postStore = db.createObjectStore('posts', { keyPath: 'id' });
      postStore.createIndex('by-dashboardId', 'dashboardId');
      postStore.createIndex('by-userId', 'userId');

      db.createObjectStore('sessions', { keyPath: 'token' });
    },
  });

  return dbInstance;
}

// User operations
export async function createUser(user: User): Promise<void> {
  const db = await getDB();
  await db.add('users', user);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDB();
  return db.getFromIndex('users', 'by-email', email);
}

export async function getUserById(id: string): Promise<User | undefined> {
  const db = await getDB();
  return db.get('users', id);
}

// Session operations
export async function createSession(userId: string): Promise<string> {
  const db = await getDB();
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await db.put('sessions', { userId, token, expiresAt });
  sessionStorage.setItem('session_token', token);
  return token;
}

export async function getSession(): Promise<{ userId: string } | null> {
  const token = sessionStorage.getItem('session_token');
  if (!token) return null;
  const db = await getDB();
  const session = await db.get('sessions', token);
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    await db.delete('sessions', token);
    sessionStorage.removeItem('session_token');
    return null;
  }
  return { userId: session.userId };
}

export async function clearSession(): Promise<void> {
  const token = sessionStorage.getItem('session_token');
  if (token) {
    const db = await getDB();
    await db.delete('sessions', token);
  }
  sessionStorage.removeItem('session_token');
}

// Dashboard operations
export async function createDashboard(dashboard: Dashboard): Promise<void> {
  const db = await getDB();
  await db.add('dashboards', dashboard);
}

export async function getDashboardsByUser(userId: string): Promise<Dashboard[]> {
  const db = await getDB();
  return db.getAllFromIndex('dashboards', 'by-userId', userId);
}

export async function getDashboard(id: string): Promise<Dashboard | undefined> {
  const db = await getDB();
  return db.get('dashboards', id);
}

export async function updateDashboard(dashboard: Dashboard): Promise<void> {
  const db = await getDB();
  await db.put('dashboards', dashboard);
}

export async function deleteDashboard(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('dashboards', id);
  // Delete all associated posts
  const posts = await db.getAllFromIndex('posts', 'by-dashboardId', id);
  const tx = db.transaction('posts', 'readwrite');
  for (const post of posts) {
    await tx.store.delete(post.id);
  }
  await tx.done;
}

// Post operations
export async function addPosts(posts: ProcessedPost[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('posts', 'readwrite');
  for (const post of posts) {
    await tx.store.put(post);
  }
  await tx.done;
}

export async function getPostsByDashboard(dashboardId: string): Promise<ProcessedPost[]> {
  const db = await getDB();
  return db.getAllFromIndex('posts', 'by-dashboardId', dashboardId);
}

export async function updatePost(post: ProcessedPost): Promise<void> {
  const db = await getDB();
  await db.put('posts', post);
}

export async function deletePost(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('posts', id);
}

export async function deletePostsByDashboard(dashboardId: string): Promise<void> {
  const db = await getDB();
  const posts = await db.getAllFromIndex('posts', 'by-dashboardId', dashboardId);
  const tx = db.transaction('posts', 'readwrite');
  for (const post of posts) {
    await tx.store.delete(post.id);
  }
  await tx.done;
}
