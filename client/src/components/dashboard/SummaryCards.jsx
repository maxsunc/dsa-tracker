export default function SummaryCards({ stats }) {
  if (!stats) return null;

  const cards = [
    { label: 'In Queue', value: stats.totalInQueue, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Due Today', value: stats.dueToday, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Overdue', value: stats.overdue, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
    { label: 'Streak', value: `${stats.currentStreak}d`, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Total Reviews', value: stats.totalReviews, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Completion', value: `${stats.completionRate}%`, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map(({ label, value, color, bg }) => (
        <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}
