import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Profile */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Profile</h2>
        <div className="flex items-center gap-4">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-16 h-16 rounded-full" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
            </div>
          )}
          <div>
            {user?.displayName && <div className="font-medium text-gray-900">{user.displayName}</div>}
            <div className="text-sm text-gray-500">{user?.email}</div>
            <div className="text-xs text-gray-400 mt-1">
              {user?.googleId ? 'Signed in with Google' : 'Email & password account'}
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-2">About DSA Tracker</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          DSA Tracker uses spaced repetition to help you retain solutions to algorithm problems.
          After solving a problem, you'll be prompted to review it at expanding intervals —
          1, 3, 7, 14, 30, 90, 180, and 365 days — adjusted by how well you remember each time.
        </p>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h2 className="font-semibold text-red-700 mb-2">Account</h2>
        <p className="text-sm text-gray-500 mb-4">
          Sign out of your current session.
        </p>
        <button
          onClick={logout}
          className="border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
