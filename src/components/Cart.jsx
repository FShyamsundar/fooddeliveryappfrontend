import { useAuth } from "../context/AuthContext";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { DEFAULT_RESTAURANT_IMAGE } from "../utils/constants";

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart } = useAuth();

  const subtotal = Array.isArray(cart)
    ? cart.reduce((sum, item) => {
        const extrasTotal = item.extras?.reduce((s, e) => s + e.price, 0) || 0;
        return sum + (item.price + extrasTotal) * item.quantity;
      }, 0)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-xl font-bold mb-4">Your Cart ({cart.length})</h3>

      {cart.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Your cart is empty</p>
      ) : (
        <>
          <div className="space-y-4 mb-4">
            {Array.isArray(cart) &&
              cart.map((item) => (
                <div key={item._id} className="flex gap-4 border-b pb-4">
                  <img
                    src={item.image || DEFAULT_RESTAURANT_IMAGE}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    {item.extras?.length > 0 && (
                      <p className="text-sm text-gray-600">
                        Extras:{" "}
                        {Array.isArray(item.extras)
                          ? item.extras.map((e) => e.name).join(", ")
                          : ""}
                      </p>
                    )}
                    {item.specialInstructions && (
                      <p className="text-sm text-gray-600">
                        Note: {item.specialInstructions}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateCartQuantity(item._id, item.quantity - 1)
                        }
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <FiMinus />
                      </button>
                      <span className="font-semibold">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateCartQuantity(item._id, item.quantity + 1)
                        }
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <FiPlus />
                      </button>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="ml-auto text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      $
                      {(
                        (item.price +
                          (item.extras?.reduce((s, e) => s + e.price, 0) ||
                            0)) *
                        item.quantity
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Delivery Fee:</span>
              <span className="font-semibold">$5.00</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Tax (8%):</span>
              <span className="font-semibold">
                ${(subtotal * 0.08).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span className="text-primary">
                ${(subtotal + 5 + subtotal * 0.08).toFixed(2)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
