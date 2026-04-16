import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Cart from '../components/Cart';

const CartPage = () => {
  const { cart, user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Cart />
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{cart.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    ${cart.reduce((sum, item) => {
                      const extrasTotal = item.extras?.reduce((s, e) => s + e.price, 0) || 0;
                      return sum + (item.price + extrasTotal) * item.quantity;
                    }, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>$5.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>
                    ${(cart.reduce((sum, item) => {
                      const extrasTotal = item.extras?.reduce((s, e) => s + e.price, 0) || 0;
                      return sum + (item.price + extrasTotal) * item.quantity;
                    }, 0) * 0.08).toFixed(2)}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-primary">
                    ${(() => {
                      const subtotal = cart.reduce((sum, item) => {
                        const extrasTotal = item.extras?.reduce((s, e) => s + e.price, 0) || 0;
                        return sum + (item.price + extrasTotal) * item.quantity;
                      }, 0);
                      return (subtotal + 5 + subtotal * 0.08).toFixed(2);
                    })()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
