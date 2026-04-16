import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FiPlus } from "react-icons/fi";
import { DEFAULT_RESTAURANT_IMAGE } from "../utils/constants";

const MenuItem = ({ item, isOwner, onEdit, onDelete }) => {
  const { addToCart, user } = useAuth();
  const [showExtras, setShowExtras] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState("");

  const handleAddToCart = () => {
    const cartItem = {
      ...item,
      extras: selectedExtras,
      specialInstructions,
    };
    addToCart(cartItem);
    setShowExtras(false);
    setSelectedExtras([]);
    setSpecialInstructions("");
  };

  const toggleExtra = (extra) => {
    setSelectedExtras((prev) =>
      prev.find((e) => e.name === extra.name)
        ? prev.filter((e) => e.name !== extra.name)
        : [...prev, extra],
    );
  };

  const showAddToCart = user?.role === "customer";

  return (
    <>
      <div className="card p-4 flex gap-4">
        <img
          src={item.image || DEFAULT_RESTAURANT_IMAGE}
          alt={item.name}
          className="w-24 h-24 object-cover rounded-lg"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-lg">{item.name}</h4>
              <p className="text-gray-600 text-sm mt-1">{item.description}</p>
              <div className="flex gap-2 mt-2">
                {item.isVegetarian && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Veg
                  </span>
                )}
                {item.isVegan && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Vegan
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary">₹{item.price}</p>
              {showAddToCart && (
                <button
                  onClick={() =>
                    item.extras?.length > 0
                      ? setShowExtras(true)
                      : handleAddToCart()
                  }
                  className="mt-2 bg-primary text-white p-2 rounded-full hover:bg-orange-600"
                >
                  <FiPlus />
                </button>
              )}
              {isOwner && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item._id)}
                    className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showExtras && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Customize Your Order</h3>

            {item.extras?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Add Extras:</h4>
                {item.extras.map((extra, idx) => (
                  <label key={idx} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedExtras.find(
                        (e) => e.name === extra.name,
                      )}
                      onChange={() => toggleExtra(extra)}
                      className="w-4 h-4"
                    />
                    <span>
                      {extra.name} (+₹{extra.price})
                    </span>
                  </label>
                ))}
              </div>
            )}

            <div className="mb-4">
              <label className="block font-semibold mb-2">
                Special Instructions:
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="input-field"
                rows="3"
                placeholder="Any special requests?"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowExtras(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button onClick={handleAddToCart} className="btn-primary flex-1">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuItem;
