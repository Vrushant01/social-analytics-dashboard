import { motion } from 'framer-motion';
import { useAIInsights, type AIInsight } from '@/hooks/useAIInsights';
import type { ProcessedPost } from '@/lib/db';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface AIInsightsPanelProps {
  posts: ProcessedPost[];
}

export function AIInsightsPanel({ posts }: AIInsightsPanelProps) {
  const insights = useAIInsights(posts);

  if (insights.length === 0) {
    return (
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          AI Insights Engine
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>AI-powered insights generated from your data</p>
            </TooltipContent>
          </Tooltip>
        </h3>
        <p className="text-sm text-muted-foreground">No data available for insights</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
        AI Insights Engine
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>AI-powered insights generated from your data</p>
          </TooltipContent>
        </Tooltip>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <InsightCard key={insight.id} insight={insight} index={index} />
        ))}
      </div>
    </div>
  );
}

function InsightCard({ insight, index }: { insight: AIInsight; index: number }) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-muted-foreground',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-secondary/50 rounded-lg p-4 border border-border/50 hover:border-primary/30 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{insight.icon}</span>
        {insight.trend && (
          <span className={`text-xs font-medium ${trendColors[insight.trend]}`}>
            {insight.trend === 'up' ? '↑' : insight.trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
      <h4 className="text-xs font-medium text-muted-foreground mb-1">{insight.title}</h4>
      <p className="text-lg font-bold text-foreground mb-1">{insight.value}</p>
      <p className="text-xs text-muted-foreground">{insight.description}</p>
    </motion.div>
  );
}
