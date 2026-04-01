import { Link } from "react-router";
import AuthGuard from "~/components/AuthGuard";
import { useNotifications } from "~/context/NotificationContext";
import type { AppNotification } from "~/services/notifications";

export function meta() {
  return [
    { title: "Notifications | SmartX AgriTrade" },
  ];
}

function NotificationsContent() {
  const { notifications, loading, markRead } = useNotifications();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
            <span className="text-gray-900 dark:text-white font-semibold flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Notifications
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Recent Alerts</h1>
            <span className="text-xs text-gray-500 uppercase font-semibold">
              {notifications.filter(n => !n.seen).length} Unread
            </span>
          </div>

          {loading ? (
            <div className="p-20 text-center text-gray-500">Loading alerts...</div>
          ) : notifications.length === 0 ? (
            <div className="p-20 text-center text-gray-500">No new notifications</div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-6 flex gap-4 transition-colors ${n.seen ? "bg-white dark:bg-gray-900" : "bg-purple-50/30 dark:bg-purple-900/10"}`}
                >
                  <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${n.type === "ORDER" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600" : "bg-purple-100 dark:bg-purple-900/30 text-purple-600"}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d={n.type === "ORDER" ? "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" : "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"} />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold ${n.seen ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"}`}>
                        {n.title}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{n.message}</p>
                    {!n.seen && (
                      <button 
                        onClick={() => markRead(n.id)}
                        className="mt-2 text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <NotificationsContent />
    </AuthGuard>
  );
}
