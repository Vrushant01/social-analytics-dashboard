import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3, Plus, Trash2, FolderOpen, Edit3, Upload, Loader2,
  LogOut, Calendar, Database, MoreVertical
} from 'lucide-react';
import {
  getDashboards, createDashboard, deleteDashboard, updateDashboard, uploadFile,
  type Dashboard
} from '@/lib/dashboardApi';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';

const MyDashboards = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<Dashboard | null>(null);
  const [showUpload, setShowUpload] = useState<Dashboard | null>(null);
  const [newName, setNewName] = useState('');
  const [editName, setEditName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboards = useCallback(async () => {
    if (!user) return;
    try {
      const list = await getDashboards();
      setDashboards(list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboards();
  }, [loadDashboards]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  const handleCreate = async () => {
    if (!newName.trim() || !file) return;
    setProcessing(true);
    setError('');
    try {
      const dashboard = await createDashboard(newName.trim());
      await uploadFile(dashboard._id, file, true);
      setShowCreate(false);
      setNewName('');
      setFile(null);
      await loadDashboards();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create dashboard');
    }
    setProcessing(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDashboard(id);
      await loadDashboards();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete dashboard');
    }
  };

  const handleEditName = async () => {
    if (!showEdit || !editName.trim()) return;
    try {
      await updateDashboard(showEdit._id, { name: editName.trim() });
      setShowEdit(null);
      await loadDashboards();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update dashboard');
    }
  };

  const handleUpdateData = async () => {
    if (!showUpload || !file) return;
    setProcessing(true);
    setError('');
    try {
      await uploadFile(showUpload._id, file, true);
      setShowUpload(null);
      setFile(null);
      await loadDashboards();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to upload file');
    }
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border glass-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-gradient">SocialPulse</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.name}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Dashboards</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your analytics projects</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity text-sm"
          >
            <Plus className="w-4 h-4" />
            New Dashboard
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : dashboards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No dashboards yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Upload a CSV or JSON file to get started</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground font-medium text-sm"
            >
              Create your first dashboard
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboards.map((dash, i) => (
              <motion.div
                key={dash._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-5 stat-card-hover cursor-pointer group"
                onClick={() => navigate(`/dashboard/${dash._id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={e => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-secondary"
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => navigate(`/dashboard/${dash._id}`)}>
                        <FolderOpen className="w-4 h-4 mr-2" /> Open
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setShowEdit(dash); setEditName(dash.name); }}>
                        <Edit3 className="w-4 h-4 mr-2" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setShowUpload(dash); setFile(null); }}>
                        <Upload className="w-4 h-4 mr-2" /> Update Data
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(dash._id)} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="font-semibold text-foreground mb-2 truncate">{dash.name}</h3>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(dash.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    {dash.datasetSize} posts
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Updated {new Date(dash.updatedAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="glass-card border-border">
          <DialogHeader>
            <DialogTitle>Create New Dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Dashboard Name</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="My Instagram Analytics"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Upload Dataset (CSV or JSON)</label>
              <input
                type="file"
                accept=".csv,.json"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm">Cancel</button>
            <button onClick={handleCreate} disabled={processing || !newName.trim() || !file} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-50 flex items-center gap-2">
              {processing && <Loader2 className="w-4 h-4 animate-spin" />}
              Create
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!showEdit} onOpenChange={() => setShowEdit(null)}>
        <DialogContent className="glass-card border-border">
          <DialogHeader><DialogTitle>Rename Dashboard</DialogTitle></DialogHeader>
          <input
            value={editName}
            onChange={e => setEditName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <DialogFooter>
            <button onClick={() => setShowEdit(null)} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm">Cancel</button>
            <button onClick={handleEditName} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={!!showUpload} onOpenChange={() => setShowUpload(null)}>
        <DialogContent className="glass-card border-border">
          <DialogHeader><DialogTitle>Update Dataset</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {error && <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>}
            <p className="text-sm text-muted-foreground">This will replace all existing data in "{showUpload?.name}".</p>
            <input
              type="file"
              accept=".csv,.json"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>
          <DialogFooter>
            <button onClick={() => setShowUpload(null)} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm">Cancel</button>
            <button onClick={handleUpdateData} disabled={processing || !file} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-50 flex items-center gap-2">
              {processing && <Loader2 className="w-4 h-4 animate-spin" />}
              Upload
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyDashboards;
