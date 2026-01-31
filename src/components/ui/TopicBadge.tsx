const colorClasses: Record<string, string> = {
  purple: 'bg-purple-900/30 text-purple-300 border-purple-700/50 hover:bg-purple-900/40 hover:border-purple-600/60',
  blue: 'bg-blue-900/30 text-blue-300 border-blue-700/50 hover:bg-blue-900/40 hover:border-blue-600/60',
  green: 'bg-green-900/30 text-green-300 border-green-700/50 hover:bg-green-900/40 hover:border-green-600/60',
  yellow: 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50 hover:bg-yellow-900/40 hover:border-yellow-600/60',
  orange: 'bg-orange-900/30 text-orange-300 border-orange-700/50 hover:bg-orange-900/40 hover:border-orange-600/60',
  gray: 'bg-gray-800/40 text-gray-400 border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600/60',
};

const activeColorClasses: Record<string, string> = {
  purple: 'bg-purple-900/50 text-purple-200 border-purple-600/70 shadow-lg shadow-purple-900/30',
  blue: 'bg-blue-900/50 text-blue-200 border-blue-600/70 shadow-lg shadow-blue-900/30',
  green: 'bg-green-900/50 text-green-200 border-green-600/70 shadow-lg shadow-green-900/30',
  yellow: 'bg-yellow-900/50 text-yellow-200 border-yellow-600/70 shadow-lg shadow-yellow-900/30',
  orange: 'bg-orange-900/50 text-orange-200 border-orange-600/70 shadow-lg shadow-orange-900/30',
  gray: 'bg-gray-700/60 text-gray-200 border-gray-600/70 shadow-lg shadow-gray-900/30',
};

const activeRingClasses: Record<string, string> = {
  purple: 'ring-2 ring-purple-500/50',
  blue: 'ring-2 ring-blue-500/50',
  green: 'ring-2 ring-green-500/50',
  yellow: 'ring-2 ring-yellow-500/50',
  orange: 'ring-2 ring-orange-500/50',
  gray: 'ring-2 ring-gray-500/50',
};

interface TopicBadgeProps {
  name: string;
  color: string;
  count?: number;
  isActive?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export function TopicBadge({
  name,
  color,
  count,
  isActive,
  onClick,
  size = 'md',
}: TopicBadgeProps) {
  const baseColorClass = colorClasses[color] || colorClasses.gray;
  const activeClass = activeColorClasses[color] || activeColorClasses.gray;
  const ringClass = activeRingClasses[color] || activeRingClasses.gray;

  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm';

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`
        inline-flex items-center gap-2 rounded-lg font-semibold
        border transition-all
        ${sizeClasses}
        ${isActive ? `${activeClass} ${ringClass}` : baseColorClass}
        ${onClick ? 'cursor-pointer active:scale-95' : 'cursor-default'}
        disabled:hover:brightness-100
      `}
    >
      <span>{name}</span>
      {count !== undefined && (
        <span className="font-bold tabular-nums opacity-80">
          {count}
        </span>
      )}
    </button>
  );
}
