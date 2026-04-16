import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createOrder, createPaymentIntent, confirmPayment, addAddress } from '../services/api';

const CheckoutPage = () => {
  const { cart, user, clearCart } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deliveryType, setDeliveryType] = useState('instant');
  const [scheduledTime, setScheduledTime] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(user?.addresses?.[0] || null);
  const [showAddressForm, setShowAddressForm] = useState(!user?.addresses?.length);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const subtotal = cart.reduce((sum, item) => {
    const extrasTotal = item.extras?.reduce((s, e) => s + e.price, 0) || 0;
    return sum + (item.price + extrasTotal) * item.quantity;
  }, 0);
  const deliveryFee = 5;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  const handleAddAddress = async () => {
    try {
      setLoading(true);
      await addAddress({ ...newAddress, isDefault: true });
      setSelectedAddress(newAddress);
      setShowAddressForm(false);
      window.location.reload();
    } catch (err) {
      setError('Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedAddress) {
      setError('Please add a delivery address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        restaurant: cart[0].restaurant,
        items: cart.map(item => ({
          menuItem: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          extras: item.extras,
          specialInstructions: item.specialInstructions
        })),
        deliveryAddress: selectedAddress,
        deliveryType,
        scheduledTime: deliveryType === 'scheduled' ? scheduledTime : null
      };

      const { data: order } = await createOrder(orderData);
      const { data: paymentData } = await createPaymentIntent(order._id);

      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        order_id: paymentData.orderId,
        name: 'Food Delivery App',
        description: 'Order Payment',
        handler: async function (response) {
          try {
            await confirmPayment({
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            clearCart();
            navigate(`/orders/${order._id}`);
          } catch (err) {
            setError('Payment verification failed');
            setLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        },
        theme: {
          color: '#f97316'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
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
              onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Street Address"
              value={newAddress.street}
              onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
              className="input-field"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="input-field"
              />
              <input
                type="text"
                placeholder="State"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="input-field"
              />
              <input
                type="text"
                placeholder="ZIP"
                value={newAddress.zipCode}
                onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                className="input-field"
              />
            </div>
            <button
              onClick={handleAddAddress}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Adding...' : 'Add Address'}
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
                <p>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}</p>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-orange-600 hover:text-orange-700 mt-2"
                >
                  Change Address
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddressForm(true)}
                className="btn-secondary"
              >
                Add Delivery Address
              </button>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Delivery Options</h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="instant"
                  checked={deliveryType === 'instant'}
                  onChange={(e) => setDeliveryType(e.target.value)}
                  className="mr-3"
                />
                Instant Delivery (30-45 mins)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="scheduled"
                  checked={deliveryType === 'scheduled'}
                  onChange={(e) => setDeliveryType(e.target.value)}
                  className="mr-3"
                />
                Schedule for later
              </label>
              {deliveryType === 'scheduled' && (
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
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
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
              <span>Tax</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
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
            {loading ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
    
    if (!selectedAddress) {
      setError('Please add a delivery address');
      return;
    }
    
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      const orderData = {
        restaurant: cart[0].restaurant,
        items: cart.map(item => ({
          menuItem: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          extras: item.extras,
          specialInstructions: item.specialInstructions
        })),
        deliveryAddress: selectedAddress,
        deliveryType,
        scheduledTime: deliveryType === 'scheduled' ? scheduledTime : null
      };

      const { data: order } = await createOrder(orderData);
      const { data: paymentData } = await createPaymentIntent(order._id);

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        paymentData.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      await confirmPayment({
        orderId: order._id,
        paymentIntentId: paymentIntent.id
      });

      clearCart();
      navigate(`/orders/${order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
      setLoading(false);
    }
  };

  if (showAddressForm) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="text-xl font-bold mb-4">Add Delivery Address</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Label (Home/Work)"
            value={newAddress.label}
            onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Street Address"
            value={newAddress.street}
            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
            className="input-field"
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="City"
              value={newAddress.city}
              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
              className="input-field"
            />
            <input
              type="text"
              placeholder="State"
              value={newAddress.state}
              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
              className="input-field"
            />
            <input
              type="text"
              placeholder="ZIP"
              value={newAddress.zipCode}
              onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
              className="input-field"
            />
          </div>
          <button
            onClick={handleAddAddress}
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Adding...' : 'Continue to Payment'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Delivery Address */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Delivery Address</h3>
        {user?.addresses?.map((address, idx) => (
          <label key={idx} className="flex items-start gap-3 p-3 border rounded mb-2 cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="address"
              checked={selectedAddress === address}
              onChange={() => setSelectedAddress(address)}
              className="mt-1"
            />
            <div>
              <p className="font-semibold">{address.label}</p>
              <p className="text-sm text-gray-600">
                {address.street}, {address.city}, {address.state} {address.zipCode}
              </p>
            </div>
          </label>
        ))}
      </div>

      {/* Delivery Options */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Delivery Options</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              value="instant"
              checked={deliveryType === 'instant'}
              onChange={(e) => setDeliveryType(e.target.value)}
            />
            <span>Instant Delivery (45 mins)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              value="scheduled"
              checked={deliveryType === 'scheduled'}
              onChange={(e) => setDeliveryType(e.target.value)}
            />
            <span>Schedule Delivery</span>
          </label>
          {deliveryType === 'scheduled' && (
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="input-field ml-6"
              required
            />
          )}
        </div>
      </div>

      {/* Payment */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Payment Information</h3>
        <div className="border rounded p-4">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
            },
          }} />
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee:</span>
            <span>$5.00</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>${(subtotal * 0.08).toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span className="text-primary">${(subtotal + 5 + subtotal * 0.08).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full btn-primary disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </form>
  );
};

const CheckoutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
};

export default CheckoutPage;
