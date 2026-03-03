import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-bold text-gray-900 mb-6">
        Master DSA with{' '}
        <span className="text-indigo-600">Spaced Repetition</span>
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
        Stop forgetting problems you've already solved. DSA Tracker schedules reviews at
        scientifically-backed intervals so you retain knowledge long-term.
      </p>
      <div className="flex gap-4 justify-center">
        {isAuthenticated ? (
          <Link
            to="/dashboard"
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link
              to="/register"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
          </>
        )}
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-left">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="text-3xl mb-3">📚</div>
          <h3 className="font-semibold text-lg mb-2">130+ Curated Problems</h3>
          <p className="text-gray-600 text-sm">
            Pre-loaded with Blind 75, NeetCode 150, and more. Browse by category and pattern.
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="text-3xl mb-3">🧠</div>
          <h3 className="font-semibold text-lg mb-2">Smart Scheduling</h3>
          <p className="text-gray-600 text-sm">
            Reviews adapt to your performance. Easy problems space out; hard ones stay frequent.
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="font-semibold text-lg mb-2">Track Progress</h3>
          <p className="text-gray-600 text-sm">
            Charts, streaks, heatmaps, and category breakdowns to visualize your growth.
          </p>
        </div>
      </div>
    </div>
  );
}
