import api from './api';

export interface Dashboard {
  _id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  datasetSize: number;
}

export interface ProcessedPost {
  _id: string;
  dashboardId: string;
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
  predictedPerformance?: 'High 🚀' | 'Medium ⚡' | 'Low 📉';
  confidenceScore?: number;
}

export interface AnalyticsData {
  totalPosts: number;
  totalLikes: number;
  avgEngagement: number;
  sentimentDistribution: { positive: number; neutral: number; negative: number };
  emotionDistribution: { Happy: number; Excited: number; Neutral: number; Angry: number };
  engagementOverTime: Array<{ date: string; engagement: number }>;
  hashtagFrequency: Array<{ hashtag: string; count: number; avgEngagement: number }>;
  bestPerformingPost: {
    postId: string;
    caption: string;
    engagementScore: number;
  } | null;
  engagementTrend: 'up' | 'down' | 'neutral';
}

// Dashboard APIs
export async function createDashboard(name: string): Promise<Dashboard> {
  const response = await api.post('/dashboard', { name });
  return response.data.data;
}

export async function getDashboards(): Promise<Dashboard[]> {
  const response = await api.get('/dashboard');
  return response.data.data;
}

export async function getDashboard(id: string): Promise<Dashboard> {
  const response = await api.get(`/dashboard/${id}`);
  return response.data.data;
}

export async function updateDashboard(id: string, data: Partial<Dashboard>): Promise<Dashboard> {
  const response = await api.put(`/dashboard/${id}`, data);
  return response.data.data;
}

export async function deleteDashboard(id: string): Promise<void> {
  await api.delete(`/dashboard/${id}`);
}

// Post APIs
export async function getPosts(
  dashboardId: string,
  options?: {
    page?: number;
    limit?: number;
    sentiment?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<{ data: ProcessedPost[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.sentiment) params.append('sentiment', options.sentiment);
  if (options?.dateFrom) params.append('dateFrom', options.dateFrom);
  if (options?.dateTo) params.append('dateTo', options.dateTo);
  if (options?.sortBy) params.append('sortBy', options.sortBy);
  if (options?.sortOrder) params.append('sortOrder', options.sortOrder);

  const response = await api.get(`/dashboard/${dashboardId}/posts?${params.toString()}`);
  return response.data;
}

export async function updatePost(postId: string, data: { likes?: number; commentsCount?: number; shares?: number }): Promise<ProcessedPost> {
  const response = await api.put(`/dashboard/posts/${postId}`, data);
  return response.data.data;
}

export async function deletePost(postId: string): Promise<void> {
  await api.delete(`/dashboard/posts/${postId}`);
}

// Upload API
export async function uploadFile(
  dashboardId: string,
  file: File,
  overwrite: boolean = false
): Promise<{ count: number; data: ProcessedPost[] }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`/upload/${dashboardId}?overwrite=${overwrite}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

// Analytics API
export async function getAnalytics(
  dashboardId: string,
  filters?: { sentiment?: string; dateFrom?: string; dateTo?: string }
): Promise<AnalyticsData> {
  const params = new URLSearchParams();
  if (filters?.sentiment) params.append('sentiment', filters.sentiment);
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);

  const response = await api.get(`/analytics/${dashboardId}?${params.toString()}`);
  return response.data.data;
}
