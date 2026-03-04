import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import SummaryCards from '../components/dashboard/SummaryCards';
import OverdueList from '../components/dashboard/OverdueList';
import DueTodayList from '../components/dashboard/DueTodayList';
import UpcomingPreview from '../components/dashboard/UpcomingPreview';
import ReviewModal from '../components/review/ReviewModal';

const CATEGORY_ORDER = [
  'Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Stack',
  'Binary Search', 'Linked List', 'Trees', 'Tries',
  'Heap / Priority Queue', 'Backtracking', 'Graphs', 'Advanced Graphs',
  '1-D Dynamic Programming', '2-D Dynamic Programming', 'Greedy',
  'Intervals', 'Math & Geometry', 'Bit Manipulation',
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [dueData, setDueData] = useState({ overdue: [], dueToday: [] });
  const [upcoming, setUpcoming] = useState([]);
  const [problems, setProblems] = useState([]);
  const [userProblems, setUserProblems] = useState({});
  const [reviewProblem, setReviewProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, dueRes, upcomingRes, problemsRes, userProblemsRes] = await Promise.all([
        api.get('/stats/overview'),
        api.get('/reviews/due'),
        api.get('/reviews/upcoming?days=7'),
        api.get('/problems?limit=999'),
        api.get('/user/problems'),
      ]);
      setStats(statsRes.data);
      setDueData(dueRes.data);
      setUpcoming(upcomingRes.data);
      setProblems(problemsRes.data.problems);

      const upMap = {};
      for (const up of userProblemsRes.data) {
        upMap[up.problemId] = up;
      }
      setUserProblems(upMap);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleComplete = async (problemId) => {
    try {
      await api.post(`/user/problems/${problemId}/complete`);
      fetchData();
    } catch (err) {
      console.error('Failed to mark complete:', err);
    }
  };

  const handleReviewComplete = () => {
    setReviewProblem(null);
    fetchData();
  };

  const toggleCategory = (cat) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const expandAll = () => {
    const all = {};
    CATEGORY_ORDER.forEach((c) => (all[c] = true));
    setExpandedCategories(all);
  };

  const collapseAll = () => setExpandedCategories({});

  // Filter problems
  const filteredProblems = problems.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !String(p.leetcodeNumber).includes(search)) return false;
    if (difficultyFilter && p.difficulty !== difficultyFilter) return false;
    if (statusFilter === 'completed' && !userProblems[p.id]) return false;
    if (statusFilter === 'not_started' && userProblems[p.id]) return false;
    return true;
  });

  // Group by category
  const grouped = {};
  for (const p of filteredProblems) {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  }

  const getStatusInfo = (problemId) => {
    const up = userProblems[problemId];
    if (!up) return { label: null, className: '' };

    if (up.status === 'in_review') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const reviewDate = new Date(up.nextReviewDate);
      reviewDate.setHours(0, 0, 0, 0);

      if (reviewDate < now) {
        return { label: 'Overdue', className: 'bg-red-500/20 text-red-400' };
      }
      if (reviewDate.getTime() === now.getTime()) {
        return { label: 'Due', className: 'bg-purple-500/20 text-purple-400' };
      }
      return { label: `R${up.reviewCount}`, className: 'bg-emerald-500/20 text-emerald-400' };
    }
    return { label: null, className: '' };
  };

  const getCategoryProgress = (cat) => {
    const catProblems = problems.filter((p) => p.category === cat);
    const done = catProblems.filter((p) => userProblems[p.id]).length;
    return { done, total: catProblems.length };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Section */}
      <SummaryCards stats={stats} />

      {dueData.overdue.length > 0 && (
        <OverdueList problems={dueData.overdue} onReview={setReviewProblem} />
      )}

      {dueData.dueToday.length > 0 && (
        <DueTodayList problems={dueData.dueToday} onReview={setReviewProblem} />
      )}

      {dueData.overdue.length === 0 && dueData.dueToday.length === 0 && (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-6 text-center">
          <p className="text-gray-500 dark:text-zinc-400 text-lg">No problems due today! 🎉</p>
          <p className="text-gray-400 dark:text-zinc-500 mt-1 text-sm">Check back tomorrow or add more problems.</p>
        </div>
      )}

      {upcoming.length > 0 && <UpcomingPreview problems={upcoming} />}

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-zinc-700" />

      {/* Problems Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
            NeetCode 150
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-zinc-400">
              {Object.keys(userProblems).length} / {problems.length} completed
            </span>
          </h2>
          <div className="flex gap-2">
            <button onClick={expandAll} className="text-xs text-amber-600 dark:text-amber-400 hover:underline">Expand All</button>
            <span className="text-zinc-400">|</span>
            <button onClick={collapseAll} className="text-xs text-amber-600 dark:text-amber-400 hover:underline">Collapse All</button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400 dark:placeholder-zinc-500"
          />
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="not_started">Not Started</option>
          </select>
        </div>

        {/* Topic Groups */}
        <div className="space-y-2">
          {CATEGORY_ORDER.filter((cat) => grouped[cat]).map((cat) => {
            const { done, total } = getCategoryProgress(cat);
            const isExpanded = expandedCategories[cat];
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <div key={cat} className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(cat)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className={`w-4 h-4 text-gray-400 dark:text-zinc-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="font-semibold text-gray-900 dark:text-zinc-100 text-sm">{cat}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-gray-200 dark:bg-zinc-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-zinc-400 w-12 text-right">
                      {done}/{total}
                    </span>
                  </div>
                </button>

                {/* Problem Rows */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-zinc-700">
                    {grouped[cat].map((p) => {
                      const status = getStatusInfo(p.id);
                      const isCompleted = !!userProblems[p.id];

                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 dark:border-zinc-700/50 last:border-b-0 hover:bg-gray-50 dark:hover:bg-zinc-700/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isCompleted
                                ? 'bg-emerald-500 text-white'
                                : 'border-2 border-gray-300 dark:border-zinc-600'
                            }`}>
                              {isCompleted && (
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>

                            <span className="text-xs text-gray-400 dark:text-zinc-500 w-8 flex-shrink-0">
                              {p.leetcodeNumber}
                            </span>

                            <Link
                              to={`/problems/${p.id}`}
                              className="text-sm text-gray-900 dark:text-zinc-100 hover:text-amber-600 dark:hover:text-amber-400 truncate font-medium"
                            >
                              {p.title}
                            </Link>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                            {status.label && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.className}`}>
                                {status.label}
                              </span>
                            )}
                            <span className={`text-xs font-medium w-14 text-right capitalize ${
                              p.difficulty === 'easy' ? 'text-emerald-500' :
                              p.difficulty === 'medium' ? 'text-amber-500' : 'text-red-500'
                            }`}>
                              {p.difficulty}
                            </span>
                            {!isCompleted && (
                              <button
                                onClick={() => handleComplete(p.id)}
                                className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-lg hover:bg-amber-500/20 transition-colors font-medium"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {reviewProblem && (
        <ReviewModal
          userProblem={reviewProblem}
          onClose={() => setReviewProblem(null)}
          onComplete={handleReviewComplete}
        />
      )}
    </div>
  );
}
