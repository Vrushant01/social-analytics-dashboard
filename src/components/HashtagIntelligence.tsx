import { useHashtagAnalytics } from '@/hooks/useHashtagAnalytics';
import type { ProcessedPost } from '@/lib/db';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

interface HashtagIntelligenceProps {
  posts: ProcessedPost[];
}

export function HashtagIntelligence({ posts }: HashtagIntelligenceProps) {
  const { topHashtags, topByEngagement, totalUniqueHashtags } = useHashtagAnalytics(posts);

  if (topHashtags.length === 0) {
    return (
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Hash className="w-4 h-4" />
          Hashtag Intelligence
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Analysis of hashtag usage and performance</p>
            </TooltipContent>
          </Tooltip>
        </h3>
        <p className="text-sm text-muted-foreground">No hashtags found in posts</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
        <Hash className="w-4 h-4" />
        Hashtag Intelligence
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Analysis of hashtag usage and performance</p>
          </TooltipContent>
        </Tooltip>
      </h3>
      <div className="mb-4">
        <p className="text-xs text-muted-foreground">
          Total Unique Hashtags: <span className="text-foreground font-medium">{totalUniqueHashtags}</span>
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-3">Top 5 by Frequency</h4>
          <div className="space-y-2">
            {topHashtags.map((hashtag, index) => (
              <motion.div
                key={hashtag.hashtag}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-primary font-mono text-sm">{hashtag.hashtag}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-foreground">{hashtag.count}x</div>
                  <div className="text-xs text-muted-foreground">Avg: {hashtag.avgEngagement}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-3">Top 5 by Engagement</h4>
          <div className="space-y-2">
            {topByEngagement.map((hashtag, index) => (
              <motion.div
                key={hashtag.hashtag}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-accent font-mono text-sm">{hashtag.hashtag}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-foreground">{hashtag.avgEngagement}</div>
                  <div className="text-xs text-muted-foreground">{hashtag.count}x used</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
