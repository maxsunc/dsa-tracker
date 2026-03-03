import { reviewDateLabel } from '../../utils/formatDate';

export default function OverdueList({ problems, onReview }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-red-600 mb-3">
        Overdue ({problems.length})
      </h2>
      <div className="bg-white rounded-xl border border-red-200 divide-y">
        {problems.map((up) => (
          <div key={up.id} className="flex items-center justify-between p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">#{up.problem.leetcodeNumber}</span>
                <span className="font-medium text-gray-900">{up.problem.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  {reviewDateLabel(up.nextReviewDate)}
                </span>
              </div>
              <div className="flex gap-2 mt-1">
                <span className="text-xs text-gray-500">{up.problem.category}</span>
                <span className="text-xs text-gray-400">·</span>
                <span className={`text-xs capitalize ${up.problem.difficulty === 'easy' ? 'text-green-600' :
                    up.problem.difficulty === 'medium' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                  {up.problem.difficulty}
                </span>
              </div>
            </div>
            <button
              onClick={() => onReview(up)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Review
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
