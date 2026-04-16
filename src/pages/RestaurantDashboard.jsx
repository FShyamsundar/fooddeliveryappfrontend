import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiHome,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiEdit,
  FiPlus,
} from "react-icons/fi";
import API from "../services/api";
import { getPrimaryImage } from "../utils/constants";

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    todayOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "restaurant") {
      navigate("/");
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [restaurantRes, ordersRes] = await Promise.all([
        API.get("/restaurants"),
        API.get("/orders/restaurant"),
      ]);

      const myRestaurant = restaurantRes.data.find((r) => r.owner === user._id);
      setRestaurant(myRestaurant);
      setOrders(ordersRes.data);

      // Calculate stats
      const totalRevenue = ordersRes.data.reduce(
        (sum, order) => sum + order.total,
        0,
      );
      const today = new Date().toDateString();
      const todayOrders = ordersRes.data.filter(
        (o) => new Date(o.createdAt).toDateString() === today,
      ).length;

      setStats({
        totalOrders: ordersRes.data.length,
        totalRevenue,
        todayOrders,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchDashboardData();
    } catch (error) {
      alert("Failed to update order status");
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
            <h1 className="text-2xl font-bold">Restaurant Dashboard</h1>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Orders</p>
                <p className="text-3xl font-bold mt-1">{stats.totalOrders}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <FiPackage className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold mt-1">
                  ₹{stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <FiDollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Today's Orders</p>
                <p className="text-3xl font-bold mt-1">{stats.todayOrders}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <FiTrendingUp className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant Info */}
        {restaurant && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">My Restaurant</h2>
              <Link
                to={`/restaurant/${restaurant._id}`}
                className="text-orange-500 hover:text-orange-600 flex items-center gap-2"
              >
                <FiEdit size={18} />
                View/Edit
              </Link>
            </div>
            <div className="flex gap-4">
              <img
                src={getPrimaryImage(restaurant.images)}
                alt={restaurant.name}
                className="w-24 h-24 rounded-xl object-cover"
              />
              <div>
                <h3 className="font-bold text-lg">{restaurant.name}</h3>
                <p className="text-gray-600 text-sm">
                  {restaurant.description}
                </p>
                <div className="flex gap-2 mt-2">
                  {restaurant.cuisineType?.map((cuisine, idx) => (
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
          </div>
        )}

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 10).map((order) => (
                <div key={order._id} className="border rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">
                        Order #{order._id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.items.length} items • ₹{order.total.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusUpdate(order._id, e.target.value)
                        }
                        className="px-3 py-1 border-2 border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-orange-500"
                      >
                        <option value="placed">Placed</option>
                        <option value="preparing">Preparing</option>
                        <option value="out_for_delivery">
                          Out for Delivery
                        </option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Customer:</strong> {order.user?.name}
                    </p>
                    <p>
                      <strong>Address:</strong> {order.deliveryAddress?.street},{" "}
                      {order.deliveryAddress?.city}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
