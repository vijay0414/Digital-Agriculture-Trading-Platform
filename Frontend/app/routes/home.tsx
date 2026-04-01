import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "~/context/AuthContext";
import AuthGuard from "~/components/AuthGuard";
import { getFarmerProducts, getRetailerProducts } from "~/services/products";
import { getFarmerOrders, getRetailerOrders } from "~/services/orders";
import { useNotifications } from "~/context/NotificationContext";

export function meta() {
  return [
    { title: "Farmer Dashboard | SmartX AgriTrade" },
    { name: "description", content: "Your agriculture trading dashboard" },
  ];
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, loading: notifsLoading } = useNotifications();
  const isFarmer = user?.role === "FARMER";
  const isRetailer = user?.role === "RETAILER";

  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    money: 0,
    notifications: 0
  });
  const [loading, setLoading] = useState(true);

  async function fetchStats() {
    if (!user) return;
    setLoading(true);
    try {
      if (isFarmer) {
        const [products, orders] = await Promise.all([
          getFarmerProducts(Number(user.id)),
          getFarmerOrders()
        ]);
        const revenue = orders
          .filter((o: any) => o.status === "CONFIRMED")
          .reduce((acc: number, curr: any) => acc + Number(curr.totalAmount), 0);

        setStats(prev => ({
          ...prev,
          products: products.length,
          orders: orders.length,
          money: revenue,
          notifications: unreadCount
        }));
      } else if (isRetailer) {
        const [products, orders] = await Promise.all([
          getRetailerProducts(),
          getRetailerOrders()
        ]);
        const spent = orders
          .filter((o: any) => o.status !== "CANCELLED")
          .reduce((acc: number, curr: any) => acc + Number(curr.totalAmount), 0);

        setStats(prev => ({
          ...prev,
          products: products.length,
          orders: orders.length,
          money: spent,
          notifications: unreadCount
        }));
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, [user]);

  useEffect(() => {
    setStats(prev => ({ ...prev, notifications: unreadCount }));
  }, [unreadCount]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">SmartX AgriTrade</span>
              
              <div className="ml-6 flex items-center gap-4 border-l border-gray-200 dark:border-gray-800 pl-6">
                {isFarmer && (
                  <Link to="/farmers/orders" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    Orders Received
                  </Link>
                )}
                {isRetailer && (
                  <Link to="/retailers/orders" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    My Orders
                  </Link>
                )}
                <Link to="/retailers/products" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  Marketplace
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <span className="text-purple-700 dark:text-purple-400 font-semibold text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-medium">{user?.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium uppercase">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {isFarmer 
              ? "Manage your crops, orders received, and growth stats here." 
              : "Browse products, place orders, and manage your wholesale trades."}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {isFarmer ? "My Products" : "Market Products"}
              </span>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? "..." : stats.products}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {isFarmer ? "Orders Received" : "My Orders"}
              </span>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-100 dark:bg-amber-900/30">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? "..." : stats.orders}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {isFarmer ? "Total Revenue" : "Total Spent"}
              </span>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? "..." : `$${stats.money.toFixed(0)}`}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Notifications</span>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? "..." : stats.notifications}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Quick Actions</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Manage your agricultural business operations.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {isFarmer ? (
              <>
                <Link to="/products" className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 text-center hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Create / Update Product</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">List or edit your crops for sale</div>
                  </div>
                </Link>

                <Link to="/farmers/orders" className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 text-center hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Confirm Orders</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and confirm received orders</div>
                  </div>
                </Link>

                <Link to="/notifications" className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 text-center hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">View Notifications</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Check alerts for orders and payments</div>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link to="/retailers/products" className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 text-center hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Browse / Place Order</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Search products and buy wholesale</div>
                  </div>
                </Link>

                <Link to="/retailers/orders" className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 text-center hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Modify / Cancel Orders</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your active order requests</div>
                  </div>
                </Link>

                <Link to="/notifications" className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 text-center hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">View Notifications</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get updates on order status</div>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Account & Notifications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          {/* Account Info */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isFarmer ? "Farmer Profile" : "Retailer Profile"}
              </h2>
              <Link to="/profile" className="text-sm font-medium text-purple-700 hover:text-purple-600 transition-colors">
                Update {isFarmer ? "Farmer" : "Retailer"} Profile
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Full Name</div>
                <div className="text-gray-900 dark:text-white font-medium">{user?.name || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email Address</div>
                <div className="text-gray-900 dark:text-white font-medium">{user?.email || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Account Role</div>
                <div className="text-gray-900 dark:text-white font-medium uppercase tracking-wider text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block">
                  {user?.role}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">User Identifier</div>
                <div className="text-gray-900 dark:text-white font-medium text-sm font-mono">{user?.id || "—"}</div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
               <Link to="/profile" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-purple-600 transition-colors">
                  View Full Profile Details &rarr;
               </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount} New
              </span>
            </div>
            
            <div className="flex-1 space-y-4">
              {notifsLoading ? (
                <div className="py-12 text-center text-gray-400 text-sm italic">Synchronizing alerts...</div>
              ) : notifications.length > 0 ? (
                notifications.slice(0, 3).map((n: any) => (
                  <div key={n.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-purple-200 dark:hover:border-purple-900/50 transition-all">
                    <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                      {n.type} ALERT
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{n.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{n.message}</div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 text-gray-300">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your trade activity is all caught up. New updates will appear here instantly.
                  </p>
                </div>
              )}
            </div>
            
            <Link 
              to="/notifications" 
              className="w-full mt-6 py-2.5 text-center text-sm font-medium text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all shadow-sm"
            >
              View All Notifications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
