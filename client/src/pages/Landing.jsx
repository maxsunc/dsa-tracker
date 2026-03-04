import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors">
      <div className="text-center py-20 px-4">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-zinc-100 mb-6">
          Master the{' '}
          <span className="text-amber-500">NeetCode 150</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10">
          Stop forgetting problems you've already solved. NeetCode 150 Tracker schedules reviews at
          scientifically-backed intervals so you retain solutions long-term.
        </p>
        <div className="flex gap-4 justify-center">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="bg-amber-500 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-amber-600 transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-amber-500 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-amber-600 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-left">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-zinc-100">150 Curated Problems</h3>
            <p className="text-gray-600 dark:text-zinc-400 text-sm">
              All 150 NeetCode problems organized by topic. Track your progress across 18 categories.
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-zinc-100">Smart Scheduling</h3>
            <p className="text-gray-600 dark:text-zinc-400 text-sm">
              Reviews adapt to your performance. Easy problems space out; hard ones stay frequent.
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-zinc-100">Track Progress</h3>
            <p className="text-gray-600 dark:text-zinc-400 text-sm">
              Charts, streaks, heatmaps, and category breakdowns to visualize your growth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
