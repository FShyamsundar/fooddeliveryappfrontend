import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiHome,
  FiUsers,
  FiShoppingBag,
  FiStar,
  FiTrash2,
  FiBell,
} from "react-icons/fi";
import API from "../services/api";
import { getPrimaryImage } from "../utils/constants";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({});
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promotionData, setPromotionData] = useState({
    title: "",
    message: "",
  });
  const [sendingPromotion, setSendingPromotion] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    try {
      const [restaurantsRes, ordersRes] = await Promise.all([
        API.get("/restaurants"),
        API.get("/orders/restaurant"),
      ]);

      setRestaurants(restaurantsRes.data);
      setOrders(ordersRes.data);

      setStats({
        totalRestaurants: restaurantsRes.data.length,
        totalOrders: ordersRes.data.length,
        totalRevenue: ordersRes.data.reduce((sum, o) => sum + o.total, 0),
        activeOrders: ordersRes.data.filter(
          (o) => o.status !== "delivered" && o.status !== "cancelled",
        ).length,
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRestaurant = async (id) => {
    if (!window.confirm("Are you sure you want to delete this restaurant?"))
      return;
    try {
      await API.delete(`/restaurants/${id}`);
      fetchAdminData();
      alert("Restaurant deleted successfully");
    } catch (error) {
      alert("Failed to delete restaurant");
    }
  };

  const handleSendPromotion = async (e) => {
    e.preventDefault();
    if (!promotionData.title.trim() || !promotionData.message.trim()) {
      alert("Please fill in both title and message");
      return;
    }

    setSendingPromotion(true);
    try {
      await API.post("/notifications/send-promotion", promotionData);
      alert("Promotion notification sent successfully!");
      setPromotionData({ title: "", message: "" });
    } catch (error) {
      alert("Failed to send promotion notification");
    } finally {
      setSendingPromotion(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Link
              to="/"
              className="text-gray-600 hover:text-orange-500 flex items-center gap-2"
            >
              <FiHome size={20} />
              Home
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Restaurants</p>
                <p className="text-3xl font-bold mt-1">
                  {stats.totalRestaurants}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <FiShoppingBag className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Orders</p>
                <p className="text-3xl font-bold mt-1">{stats.totalOrders}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <FiShoppingBag className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold mt-1">
                  ₹{stats.totalRevenue?.toFixed(2)}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <FiStar className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Orders</p>
                <p className="text-3xl font-bold mt-1">{stats.activeOrders}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <FiShoppingBag className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab("restaurants")}
              className={`px-6 py-4 font-medium whitespace-nowrap ${
                activeTab === "restaurants"
                  ? "border-b-2 border-orange-500 text-orange-500"
                  : "text-gray-600"
              }`}
            >
              Restaurants
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-4 font-medium whitespace-nowrap ${
                activeTab === "orders"
                  ? "border-b-2 border-orange-500 text-orange-500"
                  : "text-gray-600"
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`px-6 py-4 font-medium whitespace-nowrap ${
                activeTab === "notifications"
                  ? "border-b-2 border-orange-500 text-orange-500"
                  : "text-gray-600"
              }`}
            >
              Notifications
            </button>
          </div>

          <div className="p-6">
            {/* Restaurants Tab */}
            {activeTab === "restaurants" && (
              <div className="space-y-3">
                <h3 className="font-bold text-lg mb-4">All Restaurants</h3>
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant._id}
                    className="border rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={getPrimaryImage(restaurant.images)}
                        alt={restaurant.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-bold">{restaurant.name}</h4>
                        <p className="text-sm text-gray-600">
                          {restaurant.location?.city}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {restaurant.cuisineType
                            ?.slice(0, 2)
                            .map((cuisine, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-gray-100 px-2 py-1 rounded"
                              >
                                {cuisine}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/restaurant/${restaurant._id}`}
                        className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteRestaurant(restaurant._id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-3">
                <h3 className="font-bold text-lg mb-4">All Orders</h3>
                {orders.slice(0, 20).map((order) => (
                  <div key={order._id} className="border rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">
                          Order #{order._id.slice(-8)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Restaurant: {order.restaurant?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.items.length} items • ₹{order.total.toFixed(2)}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {order.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h3 className="font-bold text-lg mb-4">Send Notifications</h3>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-4">
                    Send Promotion Notification
                  </h4>
                  <form onSubmit={handleSendPromotion} className="space-y-4">
                    <div>
                      <label className="block font-medium mb-2">Title</label>
                      <input
                        type="text"
                        value={promotionData.title}
                        onChange={(e) =>
                          setPromotionData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="input-field"
                        placeholder="e.g., Special 50% Off Today!"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-2">Message</label>
                      <textarea
                        value={promotionData.message}
                        onChange={(e) =>
                          setPromotionData((prev) => ({
                            ...prev,
                            message: e.target.value,
                          }))
                        }
                        className="input-field"
                        rows="3"
                        placeholder="Describe the promotion or offer..."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={sendingPromotion}
                      className="btn-primary disabled:opacity-50"
                    >
                      {sendingPromotion ? "Sending..." : "Send to All Users"}
                    </button>
                  </form>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-2 text-blue-900">
                    Notification Types
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • <strong>Order Updates:</strong> Automatically sent when
                      order status changes
                    </li>
                    <li>
                      • <strong>New Restaurants:</strong> Automatically sent
                      when restaurants join
                    </li>
                    <li>
                      • <strong>Promotions:</strong> Manually sent by admins
                      like above
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
