import { reviewDateLabel } from '../../utils/formatDate';

export default function OverdueList({ problems, onReview }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">
        Overdue ({problems.length})
      </h2>
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-red-200 dark:border-red-500/30 divide-y divide-gray-100 dark:divide-zinc-700">
        {problems.map((up) => (
          <div key={up.id} className="flex items-center justify-between p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 dark:text-zinc-500">#{up.problem.leetcodeNumber}</span>
                <span className="font-medium text-gray-900 dark:text-zinc-100">{up.problem.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                  {reviewDateLabel(up.nextReviewDate)}
                </span>
              </div>
              <div className="flex gap-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-zinc-400">{up.problem.category}</span>
                <span className="text-xs text-gray-400 dark:text-zinc-500">·</span>
                <span className={`text-xs capitalize ${
                  up.problem.difficulty === 'easy' ? 'text-emerald-500' :
                  up.problem.difficulty === 'medium' ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {up.problem.difficulty}
                </span>
              </div>
            </div>
            <button
              onClick={() => onReview(up)}
              className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
            >
              Review
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
