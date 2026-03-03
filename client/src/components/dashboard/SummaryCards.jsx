export default function SummaryCards({ stats }) {
  if (!stats) return null;

  const cards = [
    { label: 'In Queue', value: stats.totalInQueue, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Due Today', value: stats.dueToday, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Overdue', value: stats.overdue, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Streak', value: `${stats.currentStreak}d`, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Reviews', value: stats.totalReviews, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Completion', value: `${stats.completionRate}%`, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map(({ label, value, color, bg }) => (
        <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-sm text-gray-600 mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}
