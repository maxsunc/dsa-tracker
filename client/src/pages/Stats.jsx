import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#4f46e5', '#4338ca', '#3730a3'];

export default function Stats() {
  const [overview, setOverview] = useState(null);
  const [history, setHistory] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [overviewRes, historyRes, catRes, heatRes] = await Promise.all([
          api.get('/stats/overview'),
          api.get('/stats/history'),
          api.get('/stats/categories'),
          api.get('/stats/heatmap'),
        ]);
        setOverview(overviewRes.data);
        setHistory(historyRes.data);
        setCategoryData(catRes.data);
        setHeatmap(heatRes.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Solved', value: overview.totalSolved || 0, color: 'bg-indigo-50 text-indigo-700' },
            { label: 'Total Reviews', value: overview.totalReviews || 0, color: 'bg-purple-50 text-purple-700' },
            { label: 'Current Streak', value: `${overview.streak || 0}d`, color: 'bg-amber-50 text-amber-700' },
            { label: 'Mastered', value: overview.mastered || 0, color: 'bg-green-50 text-green-700' },
          ].map((card) => (
            <div key={card.label} className={`rounded-xl p-4 ${card.color}`}>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-sm opacity-75">{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Review History Chart */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Daily Reviews (Last 30 Days)</h2>
        {history.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                labelFormatter={(d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center py-8 text-gray-400">No review history yet</p>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Problems by Category</h2>
        {categoryData.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2">
              {categoryData.map((cat, i) => (
                <div key={cat.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-gray-700">{cat.category}</span>
                  </div>
                  <span className="font-medium text-gray-900">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-gray-400">No category data yet</p>
        )}
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Activity Heatmap</h2>
        {heatmap.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {heatmap.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} reviews`}
                className={`w-3 h-3 rounded-sm ${
                  day.count === 0 ? 'bg-gray-100' :
                  day.count <= 2 ? 'bg-indigo-200' :
                  day.count <= 5 ? 'bg-indigo-400' : 'bg-indigo-600'
                }`}
              />
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-gray-400">Start reviewing to see your activity</p>
        )}
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-gray-100" />
          <div className="w-3 h-3 rounded-sm bg-indigo-200" />
          <div className="w-3 h-3 rounded-sm bg-indigo-400" />
          <div className="w-3 h-3 rounded-sm bg-indigo-600" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
