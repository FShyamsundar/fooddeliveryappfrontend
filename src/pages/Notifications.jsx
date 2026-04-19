import { useState, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../services/api";
import { FiBell, FiSettings, FiCheck, FiX } from "react-icons/fi";

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loading,
    fetchNotifications,
  } = useNotifications();
  const [activeTab, setActiveTab] = useState("notifications");
  const [preferences, setPreferences] = useState({
    promotions: true,
    newRestaurants: true,
    orderUpdates: true,
    emailNotifications: true,
    pushNotifications: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await getNotificationPreferences();
        setPreferences(response.data);
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    };

    loadPreferences();
  }, []);

  const handlePreferenceChange = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      await updateNotificationPreferences(preferences);
      alert("Preferences saved successfully!");
    } catch (error) {
      alert("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "promotion":
        return "🎉";
      case "new_restaurant":
        return "🏪";
      case "order_update":
        return "📦";
      default:
        return "🔔";
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm">
            {/* Header */}
            <div className="border-b border-slate-200">
              <div className="flex items-center gap-6 px-6 py-4">
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex items-center gap-2 pb-2 px-1 ${
                    activeTab === "notifications"
                      ? "border-b-2 border-orange-500 text-orange-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FiBell size={18} />
                  <span className="font-medium">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex items-center gap-2 pb-2 px-1 ${
                    activeTab === "settings"
                      ? "border-b-2 border-orange-500 text-orange-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FiSettings size={18} />
                  <span className="font-medium">Settings</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === "notifications" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Your Notifications</h2>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-2"
                      >
                        <FiCheck size={14} />
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
                      <p className="text-slate-600">Loading notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <FiBell
                        size={48}
                        className="mx-auto text-slate-300 mb-4"
                      />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        No notifications yet
                      </h3>
                      <p className="text-slate-600">
                        We'll notify you when there are updates about your
                        orders, promotions, and new restaurants.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-4 rounded-lg border transition-colors ${
                            !notification.isRead
                              ? "bg-blue-50 border-blue-200"
                              : "bg-white border-slate-200"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="text-2xl flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-slate-900">
                                    {notification.title}
                                  </h4>
                                  <p className="text-slate-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-slate-400 text-sm mt-2">
                                    {formatTimeAgo(notification.createdAt)}
                                  </p>
                                </div>
                                {!notification.isRead && (
                                  <button
                                    onClick={() => markAsRead(notification._id)}
                                    className="flex-shrink-0 ml-4 p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                    title="Mark as read"
                                  >
                                    <FiCheck size={16} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <div>
                  <h2 className="text-xl font-bold mb-6">
                    Notification Preferences
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Choose what notifications you'd like to receive. You can
                    change these settings at any time.
                  </p>

                  <div className="space-y-6">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="font-medium text-slate-900 mb-4">
                        Notification Types
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="font-medium text-slate-900">
                              Promotions & Offers
                            </label>
                            <p className="text-sm text-slate-600">
                              Special deals, discounts, and promotional offers
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={preferences.promotions}
                              onChange={(e) =>
                                handlePreferenceChange(
                                  "promotions",
                                  e.target.checked,
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="font-medium text-slate-900">
                              New Restaurants
                            </label>
                            <p className="text-sm text-slate-600">
                              Notifications when new restaurants join the
                              platform
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={preferences.newRestaurants}
                              onChange={(e) =>
                                handlePreferenceChange(
                                  "newRestaurants",
                                  e.target.checked,
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="font-medium text-slate-900">
                              Order Updates
                            </label>
                            <p className="text-sm text-slate-600">
                              Status updates for your orders
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={preferences.orderUpdates}
                              onChange={(e) =>
                                handlePreferenceChange(
                                  "orderUpdates",
                                  e.target.checked,
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="font-medium text-slate-900 mb-4">
                        Delivery Methods
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="font-medium text-slate-900">
                              Email Notifications
                            </label>
                            <p className="text-sm text-slate-600">
                              Receive notifications via email
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={preferences.emailNotifications}
                              onChange={(e) =>
                                handlePreferenceChange(
                                  "emailNotifications",
                                  e.target.checked,
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="font-medium text-slate-900">
                              Push Notifications
                            </label>
                            <p className="text-sm text-slate-600">
                              Receive push notifications in your browser
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={preferences.pushNotifications}
                              onChange={(e) =>
                                handlePreferenceChange(
                                  "pushNotifications",
                                  e.target.checked,
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={savePreferences}
                        disabled={saving}
                        className="btn-primary disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save Preferences"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
