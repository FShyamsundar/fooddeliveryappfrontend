import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  getUserOrders,
  getOrderById,
  createReview,
  cancelOrder,
} from "../services/api";
import OrderTracker from "../components/OrderTracker";
import {
  FiClock,
  FiMapPin,
  FiStar,
  FiChevronRight,
  FiArrowLeft,
  FiHome,
  FiX,
} from "react-icons/fi";

const Orders = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    setLoading(true);
    setSelectedOrder(null);
    if (id) {
      fetchOrderById(id);
    } else {
      fetchOrders();
    }
  }, [id]);

  const fetchOrders = async () => {
    try {
      const { data } = await getUserOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderById = async (orderId) => {
    try {
      const { data } = await getOrderById(orderId);
      setSelectedOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!review.comment.trim() || review.comment.trim().length < 10) {
      setReviewError("Please enter at least 10 characters for your review.");
      return;
    }
    try {
      setReviewError("");
      await createReview({
        restaurant: selectedOrder.restaurant._id,
        order: selectedOrder._id,
        rating: review.rating,
        comment: review.comment.trim(),
      });
      setShowReviewModal(false);
      alert("Review submitted successfully!");
    } catch (error) {
      setReviewError(
        error.response?.data?.message || "Error submitting review",
      );
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await cancelOrder(selectedOrder._id);
      alert("Order cancelled successfully");
      fetchOrderById(selectedOrder._id);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel order");
    }
  };

  const canCancelOrder = (orderTime) => {
    const orderDate = new Date(orderTime);
    const now = new Date();
    const diffMinutes = (now - orderDate) / (1000 * 60);
    return diffMinutes <= 5;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "text-green-600 bg-green-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      case "out_for_delivery":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-orange-600 bg-orange-50";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className="bg-white border-b sticky top-16 sm:top-20 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/orders")}
                className="text-orange-500 font-medium text-sm flex items-center gap-2 hover:text-orange-600"
              >
                <FiArrowLeft size={18} />
                Back to Orders
              </button>
              <Link
                to="/"
                className="text-gray-600 font-medium text-sm flex items-center gap-2 hover:text-orange-500"
              >
                <FiHome size={18} />
                Home
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-3xl">
          {/* Order Status */}
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-xl font-bold mb-1">
                  Order #{selectedOrder._id.slice(-8)}
                </h1>
                <p className="text-sm text-gray-500">
                  {new Date(selectedOrder.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">
                  ₹{selectedOrder.total.toFixed(2)}
                </p>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(selectedOrder.status)}`}
                >
                  {selectedOrder.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
            </div>

            <OrderTracker status={selectedOrder.status} />
          </div>

          {/* Restaurant Info */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <h3 className="font-bold text-lg mb-3">
              {selectedOrder.restaurant?.name}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-gray-600">
                <FiMapPin className="mt-0.5 flex-shrink-0" size={16} />
                <p>
                  {selectedOrder.deliveryAddress?.street || "N/A"},{" "}
                  {selectedOrder.deliveryAddress?.city || ""},{" "}
                  {selectedOrder.deliveryAddress?.state || ""}{" "}
                  {selectedOrder.deliveryAddress?.zipCode || ""}
                </p>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FiClock size={16} />
                <p>
                  {selectedOrder.estimatedDeliveryTime
                    ? new Date(
                        selectedOrder.estimatedDeliveryTime,
                      ).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <h3 className="font-bold mb-3">Order Items</h3>
            <div className="space-y-3">
              {selectedOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start pb-3 border-b last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {item.name} x {item.quantity}
                    </p>
                    {item.extras?.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Add-ons: {item.extras.map((e) => e.name).join(", ")}
                      </p>
                    )}
                    {item.specialInstructions && (
                      <p className="text-xs text-gray-500 mt-1">
                        Note: {item.specialInstructions}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold text-sm">
                    ₹
                    {(
                      (item.price +
                        (item.extras?.reduce((s, e) => s + e.price, 0) || 0)) *
                      item.quantity
                    ).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Bill Details */}
            <div className="mt-4 pt-4 border-t space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Item Total</span>
                <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>₹{selectedOrder.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Taxes</span>
                <span>₹{selectedOrder.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>TO PAY</span>
                <span>₹{selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Rate Order */}
          {selectedOrder.status === "delivered" && (
            <button
              onClick={() => {
                setReviewError("");
                setShowReviewModal(true);
              }}
              className="w-full bg-white rounded-2xl p-4 shadow-sm font-medium text-orange-500 hover:bg-orange-50 transition-colors"
            >
              Rate this order
            </button>
          )}

          {/* Cancel Order */}
          {selectedOrder.status === "placed" &&
            canCancelOrder(selectedOrder.createdAt) && (
              <button
                onClick={handleCancelOrder}
                className="w-full bg-white rounded-2xl p-4 shadow-sm font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <FiX size={20} />
                Cancel Order (Available for 5 mins)
              </button>
            )}
        </div>

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-fade-in">
              <h3 className="text-xl font-bold mb-4">Rate your experience</h3>

              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReview({ ...review, rating: star })}
                    className="transition-transform hover:scale-110"
                  >
                    <FiStar
                      size={32}
                      className={
                        star <= review.rating
                          ? "fill-orange-500 text-orange-500"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={review.comment}
                onChange={(e) =>
                  setReview({ ...review, comment: e.target.value })
                }
                placeholder="Share your experience..."
                className="w-full border-2 border-gray-200 rounded-xl p-3 mb-4 focus:outline-none focus:border-orange-500 resize-none"
                rows="4"
              />
              {reviewError && (
                <p className="text-sm text-red-600 mb-3">{reviewError}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Past Orders</h1>
            <Link
              to="/"
              className="text-gray-600 font-medium text-sm flex items-center gap-2 hover:text-orange-500"
            >
              <FiHome size={18} />
              Home
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-600 font-medium mb-2">No orders yet</p>
            <p className="text-gray-400 text-sm mb-6">
              Start ordering delicious food!
            </p>
            <Link
              to="/"
              className="inline-block bg-orange-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-orange-600"
            >
              Explore Restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-base mb-1">
                      {order.restaurant?.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-base">
                      ₹{order.total.toFixed(2)}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""}
                  </p>
                  <div className="flex items-center gap-1 text-orange-500 text-sm font-medium">
                    <span>View Details</span>
                    <FiChevronRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
