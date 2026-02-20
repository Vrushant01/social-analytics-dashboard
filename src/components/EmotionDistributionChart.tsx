import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import type { ProcessedPost } from '@/lib/db';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface EmotionDistributionChartProps {
  posts: ProcessedPost[];
}

const EMOTION_COLORS = {
  Happy: 'hsl(160, 60%, 45%)',
  Excited: 'hsl(35, 90%, 55%)',
  Neutral: 'hsl(215, 15%, 55%)',
  Angry: 'hsl(0, 70%, 50%)',
};

export function EmotionDistributionChart({ posts }: EmotionDistributionChartProps) {
  const emotionData = useMemo(() => {
    const emotionCounts: Record<string, number> = {
      Happy: 0,
      Excited: 0,
      Neutral: 0,
      Angry: 0,
    };

    posts.forEach(post => {
      const emotion = post.emotionLabel || 'Neutral';
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    return Object.entries(emotionCounts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  }, [posts]);

  if (emotionData.length === 0) {
    return (
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          Emotion Distribution
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Distribution of emotions detected in post captions</p>
            </TooltipContent>
          </Tooltip>
        </h3>
        <p className="text-sm text-muted-foreground">No emotion data available</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
        Emotion Distribution
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Distribution of emotions detected in post captions</p>
          </TooltipContent>
        </Tooltip>
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart key={`emotion-${posts.length}`}>
          <Pie
            data={emotionData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            animationDuration={300}
          >
            {emotionData.map((entry) => (
              <Cell
                key={entry.name}
                fill={EMOTION_COLORS[entry.name as keyof typeof EMOTION_COLORS] || EMOTION_COLORS.Neutral}
              />
            ))}
          </Pie>
          <RechartsTooltip
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
            formatter={(value: number) => [value, 'Posts']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2 flex-wrap">
        {emotionData.map((emotion) => (
          <div
            key={emotion.name}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background:
                  EMOTION_COLORS[emotion.name as keyof typeof EMOTION_COLORS] ||
                  EMOTION_COLORS.Neutral,
              }}
            />
            {emotion.name} ({emotion.value})
          </div>
        ))}
      </div>
    </div>
  );
}
