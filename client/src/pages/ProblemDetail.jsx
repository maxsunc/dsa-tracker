import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { formatDate, reviewDateLabel } from '../utils/formatDate';

export default function ProblemDetail() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [userProblem, setUserProblem] = useState(null);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [problemRes, userProblemsRes] = await Promise.all([
          api.get(`/problems/${id}`),
          api.get('/user/problems'),
        ]);
        setProblem(problemRes.data);

        const up = userProblemsRes.data.find((u) => u.problemId === parseInt(id));
        if (up) {
          setUserProblem(up);
          setNotes(up.notes || '');
          // Fetch review history if the problem has been solved
          if (up.reviewHistory) {
            setReviewHistory(up.reviewHistory);
          }
        }
      } catch (err) {
        console.error('Failed to fetch problem:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleComplete = async () => {
    try {
      const res = await api.post(`/user/problems/${id}/complete`);
      setUserProblem(res.data);
      setNotes(res.data.notes || '');
    } catch (err) {
      console.error('Failed to mark complete:', err);
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await api.put(`/user/problems/${id}/notes`, { notes });
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset this problem? This will clear all review progress.')) return;
    try {
      await api.post(`/user/problems/${id}/reset`);
      setUserProblem(null);
      setNotes('');
      setReviewHistory([]);
    } catch (err) {
      console.error('Failed to reset:', err);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Remove this problem from your queue?')) return;
    try {
      await api.delete(`/user/problems/${id}`);
      setUserProblem(null);
      setNotes('');
      setReviewHistory([]);
    } catch (err) {
      console.error('Failed to remove:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!problem) {
    return <div className="text-center py-12 text-gray-500">Problem not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link to="/problems" className="text-sm text-indigo-600 hover:text-indigo-800">
        ← Back to Problems
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-gray-400 font-mono text-sm">#{problem.leetcodeNumber}</span>
              <span className={`text-xs capitalize font-medium px-2 py-0.5 rounded-full ${problem.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                {problem.difficulty}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{problem.title}</h1>
            <div className="flex gap-4 text-sm text-gray-500">
              <span>Category: <span className="text-gray-700">{problem.category}</span></span>
              <span>Pattern: <span className="text-gray-700">{problem.pattern}</span></span>
            </div>
          </div>

          <a
            href={problem.leetcodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
          >
            Open on LeetCode →
          </a>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="bg-white rounded-xl border p-6">
        {userProblem ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Review Status</h3>
                <div className="flex gap-4 mt-1 text-sm text-gray-600">
                  <span>Reviews: {userProblem.reviewCount}</span>
                  <span>Ease Factor: {userProblem.easeFactor?.toFixed(2)}</span>
                  {userProblem.nextReviewDate && (
                    <span>Next: {reviewDateLabel(userProblem.nextReviewDate)}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  Reset Progress
                </button>
                <button
                  onClick={handleRemove}
                  className="text-xs border border-red-300 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add approach notes, key insights, common mistakes..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              />
              <button
                onClick={handleSaveNotes}
                disabled={saving}
                className="mt-2 bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>

            {/* Review History */}
            {userProblem.reviewHistory && userProblem.reviewHistory.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Review History</h4>
                <div className="space-y-1">
                  {userProblem.reviewHistory.map((r) => (
                    <div key={r.id} className="flex items-center gap-4 text-sm py-1">
                      <span className="text-gray-400 w-28">{formatDate(r.reviewedAt)}</span>
                      <span className={`capitalize font-medium ${r.rating === 'easy' ? 'text-green-600' :
                          r.rating === 'medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {r.rating}
                      </span>
                      <span className="text-gray-400">→ {r.nextInterval}d interval</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-3">You haven't completed this problem yet</p>
            <button
              onClick={handleComplete}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Mark as Completed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
