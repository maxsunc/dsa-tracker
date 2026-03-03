import { useState, useEffect } from 'react';
import api from '../services/api';
import SummaryCards from '../components/dashboard/SummaryCards';
import OverdueList from '../components/dashboard/OverdueList';
import DueTodayList from '../components/dashboard/DueTodayList';
import UpcomingPreview from '../components/dashboard/UpcomingPreview';
import ReviewModal from '../components/review/ReviewModal';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [dueData, setDueData] = useState({ overdue: [], dueToday: [] });
  const [upcoming, setUpcoming] = useState([]);
  const [reviewProblem, setReviewProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, dueRes, upcomingRes] = await Promise.all([
        api.get('/stats/overview'),
        api.get('/reviews/due'),
        api.get('/reviews/upcoming?days=7'),
      ]);
      setStats(statsRes.data);
      setDueData(dueRes.data);
      setUpcoming(upcomingRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReviewComplete = () => {
    setReviewProblem(null);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <SummaryCards stats={stats} />

      {dueData.overdue.length > 0 && (
        <OverdueList problems={dueData.overdue} onReview={setReviewProblem} />
      )}

      {dueData.dueToday.length > 0 && (
        <DueTodayList problems={dueData.dueToday} onReview={setReviewProblem} />
      )}

      {dueData.overdue.length === 0 && dueData.dueToday.length === 0 && (
        <div className="bg-white rounded-xl border p-8 text-center">
          <p className="text-gray-500 text-lg">No problems due today! 🎉</p>
          <p className="text-gray-400 mt-2">Check back tomorrow or add more problems to your queue.</p>
        </div>
      )}

      {upcoming.length > 0 && <UpcomingPreview problems={upcoming} />}

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
