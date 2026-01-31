// Light mode colors
const lightColorClasses: Record<string, string> = {
  purple: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-150 hover:border-purple-300',
  blue: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-150 hover:border-blue-300',
  green: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-150 hover:border-green-300',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-150 hover:border-yellow-300',
  orange: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-150 hover:border-orange-300',
  gray: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-150 hover:border-gray-300',
};

// Dark mode colors
const darkColorClasses: Record<string, string> = {
  purple: 'dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/50 dark:hover:bg-purple-900/40 dark:hover:border-purple-600/60',
  blue: 'dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50 dark:hover:bg-blue-900/40 dark:hover:border-blue-600/60',
  green: 'dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50 dark:hover:bg-green-900/40 dark:hover:border-green-600/60',
  yellow: 'dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700/50 dark:hover:bg-yellow-900/40 dark:hover:border-yellow-600/60',
  orange: 'dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700/50 dark:hover:bg-orange-900/40 dark:hover:border-orange-600/60',
  gray: 'dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-700/50 dark:hover:bg-gray-700/50 dark:hover:border-gray-600/60',
};

// Light mode active colors
const lightActiveColorClasses: Record<string, string> = {
  purple: 'bg-purple-200 text-purple-800 border-purple-300 shadow-md shadow-purple-200/50',
  blue: 'bg-blue-200 text-blue-800 border-blue-300 shadow-md shadow-blue-200/50',
  green: 'bg-green-200 text-green-800 border-green-300 shadow-md shadow-green-200/50',
  yellow: 'bg-yellow-200 text-yellow-800 border-yellow-300 shadow-md shadow-yellow-200/50',
  orange: 'bg-orange-200 text-orange-800 border-orange-300 shadow-md shadow-orange-200/50',
  gray: 'bg-gray-200 text-gray-700 border-gray-300 shadow-md shadow-gray-200/50',
};

// Dark mode active colors
const darkActiveColorClasses: Record<string, string> = {
  purple: 'dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-600/70 dark:shadow-lg dark:shadow-purple-900/30',
  blue: 'dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-600/70 dark:shadow-lg dark:shadow-blue-900/30',
  green: 'dark:bg-green-900/50 dark:text-green-200 dark:border-green-600/70 dark:shadow-lg dark:shadow-green-900/30',
  yellow: 'dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-600/70 dark:shadow-lg dark:shadow-yellow-900/30',
  orange: 'dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-600/70 dark:shadow-lg dark:shadow-orange-900/30',
  gray: 'dark:bg-gray-700/60 dark:text-gray-200 dark:border-gray-600/70 dark:shadow-lg dark:shadow-gray-900/30',
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
  const lightColor = lightColorClasses[color] || lightColorClasses.gray;
  const darkColor = darkColorClasses[color] || darkColorClasses.gray;
  const lightActiveColor = lightActiveColorClasses[color] || lightActiveColorClasses.gray;
  const darkActiveColor = darkActiveColorClasses[color] || darkActiveColorClasses.gray;
  const ringClass = activeRingClasses[color] || activeRingClasses.gray;

  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm';

  const baseClasses = `${lightColor} ${darkColor}`;
  const activeClasses = `${lightActiveColor} ${darkActiveColor}`;

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`
        inline-flex items-center gap-2 rounded-lg font-semibold
        border transition-all
        ${sizeClasses}
        ${isActive ? `${activeClasses} ${ringClass}` : baseClasses}
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
