import { formatDate } from '../../utils/formatDate';

export default function UpcomingPreview({ problems }) {
  // Group by date
  const grouped = {};
  for (const p of problems) {
    const key = new Date(p.nextReviewDate).toISOString().split('T')[0];
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Upcoming (next 7 days)</h2>
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-wrap gap-4">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="text-center">
              <p className="text-sm font-medium text-gray-700">{formatDate(date)}</p>
              <p className="text-2xl font-bold text-indigo-600">{items.length}</p>
              <p className="text-xs text-gray-500">problem{items.length !== 1 ? 's' : ''}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
