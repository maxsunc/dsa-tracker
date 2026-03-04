import { useState } from 'react';
import api from '../../services/api';

export default function ReviewModal({ userProblem, onClose, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const problem = userProblem.problem;

  const handleRate = async (rating) => {
    setLoading(true);
    try {
      await api.post(`/reviews/${userProblem.id}/submit`, { rating });
      onComplete();
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setSkipping(true);
    try {
      await api.post(`/reviews/${userProblem.id}/skip`);
      onComplete();
    } catch (err) {
      console.error('Failed to skip:', err);
    } finally {
      setSkipping(false);
    }
  };

  const handleOpenLeetCode = () => {
    window.open(problem.leetcodeUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200 dark:border-zinc-700">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
              #{problem.leetcodeNumber} {problem.title}
            </h3>
            <div className="flex gap-2 mt-1">
              <span className="text-sm text-gray-500 dark:text-zinc-400">{problem.category}</span>
              <span className="text-sm text-gray-400 dark:text-zinc-500">·</span>
              <span className="text-sm text-gray-500 dark:text-zinc-400">{problem.pattern}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 text-xl">
            ✕
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className={`text-xs px-2 py-1 rounded-full capitalize ${
            problem.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-500' :
            problem.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-500' : 'bg-red-500/20 text-red-500'
          }`}>
            {problem.difficulty}
          </span>
          <span className="text-sm text-gray-500 dark:text-zinc-400">Review #{userProblem.reviewCount + 1}</span>
        </div>

        {userProblem.notes && (
          <div className="bg-gray-50 dark:bg-zinc-700/50 rounded-lg p-3 mb-4">
            <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">Your Notes:</p>
            <p className="text-sm text-gray-700 dark:text-zinc-300 whitespace-pre-wrap">{userProblem.notes}</p>
          </div>
        )}

        <button
          onClick={handleOpenLeetCode}
          className="w-full border border-gray-300 dark:border-zinc-600 rounded-lg py-2 px-4 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors mb-6 flex items-center justify-center gap-2"
        >
          Open on LeetCode ↗
        </button>

        <div className="border-t border-gray-200 dark:border-zinc-700 pt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-3 text-center">How did it go?</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleRate('easy')}
              disabled={loading}
              className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 py-3 rounded-lg font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
            >
              Easy ✓
            </button>
            <button
              onClick={() => handleRate('medium')}
              disabled={loading}
              className="bg-amber-500/10 border border-amber-500/30 text-amber-500 py-3 rounded-lg font-medium hover:bg-amber-500/20 transition-colors disabled:opacity-50"
            >
              Medium ~
            </button>
            <button
              onClick={() => handleRate('hard')}
              disabled={loading}
              className="bg-red-500/10 border border-red-500/30 text-red-500 py-3 rounded-lg font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              Hard ✗
            </button>
          </div>
        </div>

        <button
          onClick={handleSkip}
          disabled={skipping}
          className="w-full text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300 mt-4 py-2 transition-colors"
        >
          {skipping ? 'Skipping...' : 'Skip → Tomorrow'}
        </button>
      </div>
    </div>
  );
}
