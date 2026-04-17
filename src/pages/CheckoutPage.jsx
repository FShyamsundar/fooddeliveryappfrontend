import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createOrder,
  createPaymentIntent,
  confirmPayment,
  addAddress,
} from "../services/api";
import { CURRENCY_SYMBOL } from "../utils/constants";

const CheckoutPage = () => {
  const { cart, user, clearCart } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deliveryType, setDeliveryType] = useState("instant");
  const [scheduledTime, setScheduledTime] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const subtotal = cart.reduce((sum, item) => {
    const extrasTotal = item.extras?.reduce((s, e) => s + e.price, 0) || 0;
    return sum + (item.price + extrasTotal) * item.quantity;
  }, 0);
  const deliveryFee = 100; // INR
  const tax = Math.round(subtotal * 0.18); // 18% GST

  // Calculate discount
  const discount = appliedCoupon
    ? appliedCoupon.code === "WELCOME10"
      ? Math.round(subtotal * 0.1)
      : appliedCoupon.code === "FLAT50"
        ? 50
        : appliedCoupon.code === "FREEDEL"
          ? deliveryFee
          : 0
    : 0;

  const total = subtotal + deliveryFee + tax - discount;

  const handleAddAddress = async () => {
    if (
      !newAddress.label.trim() ||
      !newAddress.street.trim() ||
      !newAddress.city.trim() ||
      !newAddress.state.trim() ||
      !newAddress.zipCode.trim()
    ) {
      setError("Complete all address fields before adding.");
      return;
    }

    try {
      setLoading(true);
      await addAddress({
        ...newAddress,
        label: newAddress.label.trim(),
        street: newAddress.street.trim(),
        city: newAddress.city.trim(),
        state: newAddress.state.trim(),
        zipCode: newAddress.zipCode.trim(),
        isDefault: true,
      });
      setSelectedAddress(newAddress);
      setShowAddressForm(false);
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    // Simple coupon validation
    if (couponCode === "WELCOME10") {
      setAppliedCoupon({
        code: "WELCOME10",
        description: "10% off on total order",
      });
      setError("");
    } else if (couponCode === "FLAT50") {
      setAppliedCoupon({ code: "FLAT50", description: "Flat ₹50 off" });
      setError("");
    } else if (couponCode === "FREEDEL") {
      setAppliedCoupon({ code: "FREEDEL", description: "Free delivery" });
      setError("");
    } else {
      setError("Invalid coupon code");
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setError("");
  };

  const handlePayment = async () => {
    if (!selectedAddress) {
      setError("Please add a delivery address.");
      return;
    }
    if (deliveryType === "scheduled" && !scheduledTime.trim()) {
      setError("Please choose a scheduled delivery time.");
      return;
    }
    if (!Array.isArray(cart) || cart.length === 0) {
      setError("Your cart is empty. Add items before checking out.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderData = {
        restaurant:
          Array.isArray(cart) && cart.length > 0 ? cart[0].restaurant : null,
        items: Array.isArray(cart)
          ? cart.map((item) => ({
              menuItem: item._id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              extras: item.extras,
              specialInstructions: item.specialInstructions,
            }))
          : [],
        deliveryAddress: selectedAddress,
        deliveryType,
        scheduledTime: deliveryType === "scheduled" ? scheduledTime : null,
        paymentMethod,
        couponCode: appliedCoupon?.code,
      };

      if (paymentMethod === "cash_on_delivery") {
        // For cash on delivery, create order and navigate directly
        const { data: order } = await createOrder(orderData);
        clearCart();
        navigate(`/orders/${order._id}`);
        return;
      }

      // For online payment, continue with Razorpay flow
      const { data: order } = await createOrder(orderData);
      const { data: paymentData } = await createPaymentIntent(order._id);

      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        order_id: paymentData.orderId,
        name: "Food Delivery App",
        description: "Order Payment",
        handler: async function (response) {
          try {
            await confirmPayment({
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clearCart();
            navigate(`/orders/${order._id}`);
          } catch (err) {
            setError("Payment verification failed");
            setLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone,
        },
        theme: {
          color: "#f97316",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed");
      setLoading(false);
    }
  };

  if (showAddressForm) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-xl font-bold mb-4">Add Delivery Address</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Label (Home/Work)"
              value={newAddress.label}
              onChange={(e) =>
                setNewAddress({ ...newAddress, label: e.target.value })
              }
              className="input-field"
            />
            <input
              type="text"
              placeholder="Street Address"
              value={newAddress.street}
              onChange={(e) =>
                setNewAddress({ ...newAddress, street: e.target.value })
              }
              className="input-field"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="City"
                value={newAddress.city}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, city: e.target.value })
                }
                className="input-field"
              />
              <input
                type="text"
                placeholder="State"
                value={newAddress.state}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, state: e.target.value })
                }
                className="input-field"
              />
              <input
                type="text"
                placeholder="ZIP"
                value={newAddress.zipCode}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, zipCode: e.target.value })
                }
                className="input-field"
              />
            </div>
            <button
              onClick={handleAddAddress}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Adding..." : "Add Address"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
            {selectedAddress ? (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedAddress.label}</p>
                <p>{selectedAddress.street}</p>
                <p>
                  {selectedAddress.city}, {selectedAddress.state}{" "}
                  {selectedAddress.zipCode}
                </p>
                <button
                  onClick={() => setSelectedAddress(null)}
                  className="text-orange-600 hover:text-orange-700 mt-2"
                >
                  Change Address
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {user?.addresses?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Select Address</h3>
                    <div className="space-y-2">
                      {user.addresses.map((address, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedAddress(address)}
                          className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 hover:bg-orange-50"
                        >
                          <p className="font-medium">{address.label}</p>
                          <p className="text-sm text-gray-600">
                            {address.street}, {address.city}, {address.state}{" "}
                            {address.zipCode}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="text-center my-4 text-gray-500">or</div>
                  </div>
                )}
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="btn-secondary w-full"
                >
                  Add New Address
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Delivery Options</h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="instant"
                  checked={deliveryType === "instant"}
                  onChange={(e) => setDeliveryType(e.target.value)}
                  className="mr-3"
                />
                Instant Delivery (30-45 mins)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="scheduled"
                  checked={deliveryType === "scheduled"}
                  onChange={(e) => setDeliveryType(e.target.value)}
                  className="mr-3"
                />
                Schedule for later
              </label>
              {deliveryType === "scheduled" && (
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="input-field mt-2"
                />
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="online"
                  checked={paymentMethod === "online"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                Online Payment (Razorpay)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="cash_on_delivery"
                  checked={paymentMethod === "cash_on_delivery"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                Cash on Delivery
              </label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Coupon Code</h2>
            {!appliedCoupon ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    className="flex-1 input-field"
                  />
                  <button onClick={applyCoupon} className="btn-secondary px-4">
                    Apply
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  <p>
                    Available coupons: WELCOME10 (10% off), FLAT50 (₹50 off),
                    FREEDEL (Free delivery)
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-green-800">
                      {appliedCoupon.code}
                    </p>
                    <p className="text-sm text-green-600">
                      {appliedCoupon.description}
                    </p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow h-fit">
          <h2 className="text-xl font-bold mb-4">Payment Summary</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>₹{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (GST 18%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({appliedCoupon?.code})</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}
            <hr className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading || !selectedAddress}
            className="btn-primary w-full"
          >
            {loading
              ? "Processing..."
              : paymentMethod === "cash_on_delivery"
                ? `Place Order (Cash on Delivery)`
                : `Pay ₹${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
