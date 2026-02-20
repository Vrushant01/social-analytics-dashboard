import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3, ArrowLeft, Loader2, Heart, MessageCircle, Share2,
  TrendingUp, Smile, Filter, Trash2, Edit3, Save, X, ChevronLeft,
  ChevronRight, Upload, FileText, Sparkles
} from 'lucide-react';
import {
  getDashboard, getPosts, updatePost, deletePost, updateDashboard, uploadFile,
  getAnalytics, type Dashboard, type ProcessedPost, type AnalyticsData
} from '@/lib/dashboardApi';
import {
  LineChart, Line, PieChart, Pie, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AIInsightsPanel } from '@/components/AIInsightsPanel';
import { EmotionDistributionChart } from '@/components/EmotionDistributionChart';
import { HashtagIntelligence } from '@/components/HashtagIntelligence';
import { PerformanceBadge } from '@/components/PerformanceBadge';
import { usePredictionModel } from '@/hooks/usePredictionModel';

const COLORS = {
  primary: 'hsl(190, 80%, 50%)',
  accent: 'hsl(160, 60%, 45%)',
  warning: 'hsl(35, 90%, 55%)',
  destructive: 'hsl(0, 70%, 50%)',
  muted: 'hsl(215, 15%, 55%)',
};

const SENTIMENT_COLORS = {
  positive: COLORS.accent,
  neutral: COLORS.warning,
  negative: COLORS.destructive,
};

const PAGE_SIZE = 10;

const DashboardView = () => {
  const { user, loading: authLoading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [posts, setPosts] = useState<ProcessedPost[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<ProcessedPost | null>(null);
  const [editLikes, setEditLikes] = useState(0);
  const [editComments, setEditComments] = useState(0);
  const [editShares, setEditShares] = useState(0);

  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const [showUpload, setShowUpload] = useState(false);
  const [uploadFileState, setUploadFileState] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<'append' | 'overwrite'>('append');
  const [processing, setProcessing] = useState(false);
  const [showForecast, setShowForecast] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [dash, postsData, analyticsData] = await Promise.all([
        getDashboard(id),
        getPosts(id, { page: 1, limit: 1000, sentiment: sentimentFilter !== 'all' ? sentimentFilter : undefined, dateFrom, dateTo }),
        getAnalytics(id, { sentiment: sentimentFilter !== 'all' ? sentimentFilter : undefined, dateFrom, dateTo })
      ]);
      setDashboard(dash);
      setPosts(postsData.data);
      setAnalytics(analyticsData);
    } catch (error: any) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [id, sentimentFilter, dateFrom, dateTo]);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  const filteredPosts = useMemo(() => {
    return posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [posts]);

  const { avgEngagement, predictPost } = usePredictionModel(filteredPosts);

  const totalPages = Math.ceil(filteredPosts.length / PAGE_SIZE);
  const paginatedPosts = filteredPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    if (analytics) {
      return {
        total: analytics.totalPosts,
        totalLikes: analytics.totalLikes,
        avgEngagement: analytics.avgEngagement,
        positivePercent: analytics.totalPosts > 0 
          ? Math.round((analytics.sentimentDistribution.positive / analytics.totalPosts) * 100)
          : 0,
      };
    }
    return {
      total: 0,
      totalLikes: 0,
      avgEngagement: 0,
      positivePercent: 0,
    };
  }, [analytics]);

  const engagementOverTime = useMemo(() => {
    if (analytics?.engagementOverTime) {
      const historical = analytics.engagementOverTime;
      
      if (showForecast && historical.length > 0) {
        const lastEngagement = historical[historical.length - 1].engagement;
        const secondLastEngagement = historical.length > 1 ? historical[historical.length - 2].engagement : lastEngagement;
        const growthRate = (lastEngagement - secondLastEngagement) / (secondLastEngagement || 1);
        
        const forecast = [];
        const lastDate = new Date(filteredPosts[filteredPosts.length - 1]?.timestamp || new Date());
        for (let i = 1; i <= 7; i++) {
          const forecastDate = new Date(lastDate);
          forecastDate.setDate(forecastDate.getDate() + i);
          const forecastEngagement = Math.round(lastEngagement * (1 + growthRate * i));
          forecast.push({
            date: forecastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            engagement: forecastEngagement,
            count: 1,
            isForecast: true,
          });
        }
        return [...historical, ...forecast];
      }
      
      return historical;
    }
    return [];
  }, [analytics, showForecast, filteredPosts]);

  const sentimentDist = useMemo(() => {
    if (analytics?.sentimentDistribution) {
      return Object.entries(analytics.sentimentDistribution).map(([name, value]) => ({ name, value }));
    }
    return [];
  }, [analytics]);

  const likesPerPost = useMemo(() => {
    return filteredPosts.slice(0, 15).map(p => ({
      name: p.postId.slice(0, 6),
      likes: p.likes,
    }));
  }, [filteredPosts]);

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!dashboard || dashboard.userId !== user.id) return <Navigate to="/dashboards" replace />;

  const handleEditPost = (post: ProcessedPost) => {
    setEditingPost(post);
    setEditLikes(post.likes);
    setEditComments(post.commentsCount);
    setEditShares(post.shares);
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    try {
      const updated = await updatePost(editingPost._id, {
        likes: editLikes,
        commentsCount: editComments,
        shares: editShares,
      });
      setPosts(prev => prev.map(p => p._id === updated._id ? updated : p));
      setEditingPost(null);
      await loadData(); // Reload to get updated analytics
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      setPosts(prev => prev.filter(p => p._id !== postId));
      await loadData(); // Reload to get updated analytics
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleUpload = async () => {
    if (!uploadFileState || !dashboard) return;
    setProcessing(true);
    try {
      await uploadFile(dashboard._id, uploadFileState, uploadMode === 'overwrite');
      setShowUpload(false);
      setUploadFileState(null);
      await loadData();
    } catch (e: any) {
      console.error(e);
    }
    setProcessing(false);
  };

  const statCards = [
    { label: 'Total Posts', value: stats.total, icon: FileText, color: 'text-primary' },
    { label: 'Total Likes', value: stats.totalLikes.toLocaleString(), icon: Heart, color: 'text-destructive' },
    { label: 'Avg Engagement', value: stats.avgEngagement, icon: TrendingUp, color: 'text-accent' },
    { label: 'Positive Sentiment', value: `${stats.positivePercent}%`, icon: Smile, color: 'text-success' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border glass-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboards')} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="font-semibold text-foreground truncate">{dashboard.name}</h1>
          </div>
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm hover:bg-muted transition-colors">
            <Upload className="w-4 h-4" /> Update Data
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-5 stat-card-hover"
            >
              <div className="flex items-center justify-between mb-3">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass-card rounded-xl p-4 flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={sentimentFilter}
            onChange={e => { setSentimentFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <span className="text-muted-foreground text-sm">to</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          {(sentimentFilter !== 'all' || dateFrom || dateTo) && (
            <button onClick={() => { setSentimentFilter('all'); setDateFrom(''); setDateTo(''); setPage(1); }} className="text-xs text-primary hover:underline">Clear</button>
          )}
        </div>

        {/* AI Insights Panel */}
        <AIInsightsPanel posts={filteredPosts} />

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Engagement Over Time</h3>
              <button
                onClick={() => setShowForecast(!showForecast)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  showForecast
                    ? 'gradient-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-muted'
                }`}
              >
                <Sparkles className="w-3 h-3 inline mr-1" />
                {showForecast ? 'Hide Forecast' : 'Simulate Next 7 Days'}
              </button>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={engagementOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 16%)" />
                <XAxis dataKey="date" stroke={COLORS.muted} fontSize={11} />
                <YAxis stroke={COLORS.muted} fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(222, 25%, 15%)', 
                    border: '2px solid hsl(190, 80%, 50%)', 
                    borderRadius: '8px', 
                    color: 'hsl(210, 40%, 98%)',
                    fontWeight: '600',
                    fontSize: '13px',
                    padding: '8px 12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ color: 'hsl(210, 40%, 98%)', fontWeight: '600' }}
                  labelStyle={{ color: 'hsl(190, 80%, 50%)', fontWeight: '700', marginBottom: '4px' }}
                />
                <Line
                  type="monotone"
                  dataKey="engagement"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  dot={false}
                  name="Historical"
                  connectNulls={false}
                />
                {showForecast && (
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke={COLORS.accent}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Forecast"
                    connectNulls={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <EmotionDistributionChart posts={filteredPosts} />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-medium text-foreground mb-4">Sentiment Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={sentimentDist.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} animationDuration={300}>
                  {sentimentDist.filter(d => d.value > 0).map(entry => (
                    <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name as keyof typeof SENTIMENT_COLORS]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(222, 25%, 15%)', 
                    border: '2px solid hsl(190, 80%, 50%)', 
                    borderRadius: '8px', 
                    color: 'hsl(210, 40%, 98%)',
                    fontWeight: '600',
                    fontSize: '13px',
                    padding: '8px 12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ color: 'hsl(210, 40%, 98%)', fontWeight: '600' }}
                  labelStyle={{ color: 'hsl(190, 80%, 50%)', fontWeight: '700', marginBottom: '4px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {sentimentDist.map(s => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: SENTIMENT_COLORS[s.name as keyof typeof SENTIMENT_COLORS] }} />
                  {s.name} ({s.value})
                </div>
              ))}
            </div>
          </div>
          <HashtagIntelligence posts={filteredPosts} />
        </div>

        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Likes Per Post</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={likesPerPost}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 16%)" />
              <XAxis dataKey="name" stroke={COLORS.muted} fontSize={11} />
              <YAxis stroke={COLORS.muted} fontSize={11} />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(222, 25%, 15%)', 
                  border: '2px solid hsl(190, 80%, 50%)', 
                  borderRadius: '8px', 
                  color: 'hsl(210, 40%, 98%)',
                  fontWeight: '600',
                  fontSize: '13px',
                  padding: '8px 12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                }}
                itemStyle={{ color: 'hsl(210, 40%, 98%)', fontWeight: '600' }}
                labelStyle={{ color: 'hsl(190, 80%, 50%)', fontWeight: '700', marginBottom: '4px' }}
              />
              <Bar dataKey="likes" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Posts Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-medium text-foreground">Posts ({filteredPosts.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Post ID</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Caption</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-3">Likes</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-3">Comments</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-3">Shares</th>
                  <th className="text-center text-xs font-medium text-muted-foreground p-3">Sentiment</th>
                  <th className="text-center text-xs font-medium text-muted-foreground p-3">Prediction</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-3">Date</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPosts.map(post => (
                  <tr key={post._id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="p-3 text-xs font-mono text-muted-foreground">{post.postId.slice(0, 8)}</td>
                    <td className="p-3 text-sm text-foreground max-w-[200px] truncate">{post.caption || '—'}</td>
                    <td className="p-3 text-sm text-right text-foreground">{post.likes}</td>
                    <td className="p-3 text-sm text-right text-foreground">{post.commentsCount}</td>
                    <td className="p-3 text-sm text-right text-foreground">{post.shares}</td>
                    <td className="p-3 text-center">
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background: `${SENTIMENT_COLORS[post.sentimentLabel]}20`,
                          color: SENTIMENT_COLORS[post.sentimentLabel],
                        }}
                      >
                        {post.sentimentLabel}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {post.predictedPerformance && post.confidenceScore ? (
                        <PerformanceBadge performance={post.predictedPerformance} confidenceScore={post.confidenceScore} />
                      ) : (
                        <PerformanceBadge {...predictPost(post)} />
                      )}
                    </td>
                    <td className="p-3 text-xs text-right text-muted-foreground">{new Date(post.timestamp).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEditPost(post)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeletePost(post._id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
              <div className="flex gap-1">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-md bg-secondary text-foreground disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-md bg-secondary text-foreground disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Post Dialog */}
      <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
        <DialogContent className="glass-card border-border">
          <DialogHeader><DialogTitle>Edit Post Metrics</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Likes</label>
              <input type="number" value={editLikes} onChange={e => setEditLikes(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Comments Count</label>
              <input type="number" value={editComments} onChange={e => setEditComments(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Shares</label>
              <input type="number" value={editShares} onChange={e => setEditShares(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setEditingPost(null)} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm">Cancel</button>
            <button onClick={handleSaveEdit} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="glass-card border-border">
          <DialogHeader><DialogTitle>Update Dataset</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <button onClick={() => setUploadMode('append')} className={`px-3 py-1.5 rounded-lg text-sm ${uploadMode === 'append' ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>Append</button>
              <button onClick={() => setUploadMode('overwrite')} className={`px-3 py-1.5 rounded-lg text-sm ${uploadMode === 'overwrite' ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>Overwrite</button>
            </div>
            <input type="file" accept=".csv,.json" onChange={e => setUploadFileState(e.target.files?.[0] || null)} className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
          </div>
          <DialogFooter>
            <button onClick={() => setShowUpload(false)} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm">Cancel</button>
            <button onClick={handleUpload} disabled={processing || !uploadFileState} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-50 flex items-center gap-2">
              {processing && <Loader2 className="w-4 h-4 animate-spin" />} Upload
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardView;
