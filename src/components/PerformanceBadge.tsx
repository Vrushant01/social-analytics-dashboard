import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PerformanceBadgeProps {
  performance: 'High 🚀' | 'Medium ⚡' | 'Low 📉';
  confidenceScore: number;
}

const PERFORMANCE_COLORS = {
  'High 🚀': { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  'Medium ⚡': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  'Low 📉': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
};

export function PerformanceBadge({ performance, confidenceScore }: PerformanceBadgeProps) {
  const colors = PERFORMANCE_COLORS[performance];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
        >
          {performance}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>Confidence: {confidenceScore}%</p>
      </TooltipContent>
    </Tooltip>
  );
}

