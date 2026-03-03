import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const DIFFICULTIES = ['easy', 'medium', 'hard'];

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [userProblems, setUserProblems] = useState({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const limit = 50;

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (difficulty) params.set('difficulty', difficulty);
      params.set('page', page);
      params.set('limit', limit);

      const [problemsRes, userProblemsRes] = await Promise.all([
        api.get(`/problems?${params}`),
        api.get('/user/problems'),
      ]);

      setProblems(problemsRes.data.problems);
      setTotal(problemsRes.data.total);

      // Build a lookup map for user problems
      const upMap = {};
      for (const up of userProblemsRes.data) {
        upMap[up.problemId] = up;
      }
      setUserProblems(upMap);

      // Extract categories
      if (categories.length === 0) {
        const cats = [...new Set(problemsRes.data.problems.map((p) => p.category))].sort();
        setCategories(cats);
      }
    } catch (err) {
      console.error('Failed to fetch problems:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category, difficulty, page]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const handleComplete = async (problemId) => {
    try {
      await api.post(`/user/problems/${problemId}/complete`);
      fetchProblems();
    } catch (err) {
      console.error('Failed to mark complete:', err);
    }
  };

  const getStatusBadge = (problemId) => {
    const up = userProblems[problemId];
    if (!up) return null;

    if (up.status === 'in_review') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const reviewDate = new Date(up.nextReviewDate);
      reviewDate.setHours(0, 0, 0, 0);

      if (reviewDate < now) {
        return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Overdue</span>;
      }
      if (reviewDate.getTime() === now.getTime()) {
        return <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Due</span>;
      }
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
          ✓ R{up.reviewCount}
        </span>
      );
    }
    return null;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Problem Library</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search by title or number..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase() + d.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 w-16">#</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Problem</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 w-24">Diff</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 w-40">Category</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 w-40">Pattern</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 w-28">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">Loading...</td>
                </tr>
              ) : problems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">No problems found</td>
                </tr>
              ) : (
                problems.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{p.leetcodeNumber}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/problems/${p.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs capitalize font-medium ${p.difficulty === 'easy' ? 'text-green-600' :
                          p.difficulty === 'medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.pattern}</td>
                    <td className="px-4 py-3">{getStatusBadge(p.id)}</td>
                    <td className="px-4 py-3">
                      {!userProblems[p.id] && (
                        <button
                          onClick={() => handleComplete(p.id)}
                          className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
