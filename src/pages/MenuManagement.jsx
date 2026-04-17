import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getRestaurants,
  getRestaurantMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../services/api";
import { FiPlus, FiX, FiEdit2, FiTrash2 } from "react-icons/fi";

const MenuManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Main Course",
    price: "",
    isVegetarian: false,
    isVegan: false,
    extras: [],
  });
  const [extraInput, setExtraInput] = useState({ name: "", price: "" });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "restaurant") {
      navigate("/");
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const restaurantRes = await getRestaurants();
      const myRestaurant = restaurantRes.data.find((r) => r.owner === user._id);

      if (myRestaurant) {
        setRestaurant(myRestaurant);
        const menuRes = await getRestaurantMenu(myRestaurant._id);
        setMenu(menuRes.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Item name is required.");
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setFormError("Please enter a valid price greater than zero.");
      return;
    }
    if (!formData.category.trim()) {
      setFormError("Please choose a category.");
      return;
    }

    try {
      setFormError("");
      if (editingItem) {
        await updateMenuItem(restaurant._id, editingItem._id, {
          ...formData,
          price: Number(formData.price),
        });
      } else {
        await addMenuItem(restaurant._id, {
          ...formData,
          price: Number(formData.price),
        });
      }
      fetchData();
      closeModal();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save menu item");
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm("Delete this item?")) return;
    try {
      await deleteMenuItem(restaurant._id, itemId);
      fetchData();
    } catch (error) {
      alert("Failed to delete item");
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price,
        isVegetarian: item.isVegetarian,
        isVegan: item.isVegan,
        extras: item.extras || [],
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        category: "Main Course",
        price: "",
        isVegetarian: false,
        isVegan: false,
        extras: [],
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setExtraInput({ name: "", price: "" });
  };

  const addExtra = () => {
    if (!extraInput.name.trim() || !extraInput.price) {
      setFormError("Please enter both extra name and price.");
      return;
    }
    const parsedPrice = Number(extraInput.price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError("Please enter a valid extra price greater than zero.");
      return;
    }

    setFormError("");
    setFormData((prev) => ({
      ...prev,
      extras: [
        ...prev.extras,
        { name: extraInput.name.trim(), price: parsedPrice },
      ],
    }));
    setExtraInput({ name: "", price: "" });
  };

  const removeExtra = (index) => {
    setFormData((prev) => ({
      ...prev,
      extras: prev.extras.filter((_, i) => i !== index),
    }));
  };

  const categories = ["Starters", "Main Course", "Desserts", "Drinks", "Other"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Menu Management</h1>
            <button
              onClick={() => openModal()}
              className="btn-primary flex items-center gap-2"
            >
              <FiPlus /> Add Item
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {categories.map((category) => {
          const items = menu.filter((item) => item.category === category);
          if (items.length === 0) return null;

          return (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-bold mb-4">{category}</h2>
              <div className="grid gap-4">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-start"
                  >
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-gray-600 text-sm">
                        {item.description}
                      </p>
                      <p className="text-orange-500 font-bold mt-2">
                        ₹{item.price}
                      </p>
                      {item.extras?.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {item.extras.length} extras available
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(item)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingItem ? "Edit" : "Add"} Menu Item
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {formError}
                </div>
              )}
              <div>
                <label className="block font-semibold mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="input-field"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="input-field"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isVegetarian}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isVegetarian: e.target.checked,
                      })
                    }
                  />
                  Vegetarian
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isVegan}
                    onChange={(e) =>
                      setFormData({ ...formData, isVegan: e.target.checked })
                    }
                  />
                  Vegan
                </label>
              </div>

              <div>
                <label className="block font-semibold mb-2">Extras</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Extra name"
                    value={extraInput.name}
                    onChange={(e) =>
                      setExtraInput({ ...extraInput, name: e.target.value })
                    }
                    className="input-field flex-1"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={extraInput.price}
                    onChange={(e) =>
                      setExtraInput({ ...extraInput, price: e.target.value })
                    }
                    className="input-field w-24"
                  />
                  <button
                    type="button"
                    onClick={addExtra}
                    className="btn-primary"
                  >
                    <FiPlus />
                  </button>
                </div>
                <div className="space-y-1">
                  {formData.extras.map((extra, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-gray-50 p-2 rounded"
                    >
                      <span>
                        {extra.name} - ₹{extra.price}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExtra(idx)}
                        className="text-red-500"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingItem ? "Update" : "Add"} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
