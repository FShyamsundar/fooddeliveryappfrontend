import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { FiUpload, FiX, FiClock, FiMapPin, FiEdit2 } from "react-icons/fi";

const RestaurantProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cuisineType: [],
    priceRange: "$$",
    location: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    openingHours: [
      { day: "Monday", open: "09:00", close: "22:00", isClosed: false },
      { day: "Tuesday", open: "09:00", close: "22:00", isClosed: false },
      { day: "Wednesday", open: "09:00", close: "22:00", isClosed: false },
      { day: "Thursday", open: "09:00", close: "22:00", isClosed: false },
      { day: "Friday", open: "09:00", close: "22:00", isClosed: false },
      { day: "Saturday", open: "09:00", close: "22:00", isClosed: false },
      { day: "Sunday", open: "09:00", close: "22:00", isClosed: false },
    ],
  });
  const [cuisineInput, setCuisineInput] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "restaurant") {
      navigate("/");
      return;
    }
    fetchRestaurant();
  }, [user]);

  const fetchRestaurant = async () => {
    try {
      const response = await API.get("/restaurants/my");
      if (response.data.length > 0) {
        const rest = response.data[0];
        setRestaurant(rest);
        setFormData({
          name: rest.name || "",
          description: rest.description || "",
          cuisineType: rest.cuisineType || [],
          priceRange: rest.priceRange || "$$",
          location: {
            street: rest.location?.street || "",
            city: rest.location?.city || "",
            state: rest.location?.state || "",
            zipCode: rest.location?.zipCode || "",
          },
          openingHours:
            rest.openingHours?.length > 0
              ? rest.openingHours
              : formData.openingHours,
        });
      }
    } catch (error) {
      console.error("Error fetching restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put(`/restaurants/${restaurant._id}`, formData);
      alert("Profile updated successfully!");
      fetchRestaurant();
    } catch (error) {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    setUploading(true);
    try {
      const response = await API.post(
        `/restaurants/${restaurant._id}/upload`,
        formDataUpload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setRestaurant((prev) => ({
        ...prev,
        images: [...prev.images, response.data.imageUrl],
      }));
    } catch (error) {
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageUrl) => {
    if (!confirm("Delete this image?")) return;

    try {
      await API.delete(`/restaurants/${restaurant._id}/image`, {
        data: { imageUrl },
      });
      setRestaurant((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img !== imageUrl),
      }));
    } catch (error) {
      alert("Failed to delete image");
    }
  };

  const addCuisine = () => {
    if (
      cuisineInput.trim() &&
      !formData.cuisineType.includes(cuisineInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        cuisineType: [...prev.cuisineType, cuisineInput.trim()],
      }));
      setCuisineInput("");
    }
  };

  const removeCuisine = (cuisine) => {
    setFormData((prev) => ({
      ...prev,
      cuisineType: prev.cuisineType.filter((c) => c !== cuisine),
    }));
  };

  const updateHours = (index, field, value) => {
    const updatedHours = [...formData.openingHours];
    updatedHours[index][field] = value;
    setFormData((prev) => ({ ...prev, openingHours: updatedHours }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Restaurant Found</h2>
          <p className="text-gray-600 mb-6">
            You haven't created a restaurant profile yet.
          </p>
          <button
            onClick={() => navigate("/restaurant-dashboard")}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold mb-6">Restaurant Profile</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiEdit2 />
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-2">
                      Restaurant Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">
                      Price Range
                    </label>
                    <select
                      value={formData.priceRange}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          priceRange: e.target.value,
                        }))
                      }
                      className="input-field"
                    >
                      <option value="$">$ - Budget friendly</option>
                      <option value="$$">$$ - Moderate</option>
                      <option value="$$$">$$$ - Expensive</option>
                      <option value="$$$$">$$$$ - Very Expensive</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="input-field"
                    rows="4"
                    placeholder="Describe your restaurant, services, and what makes you special..."
                  />
                </div>
              </div>

              {/* Cuisine Types */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Cuisine Types</h2>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={cuisineInput}
                    onChange={(e) => setCuisineInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addCuisine())
                    }
                    placeholder="Add cuisine type..."
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={addCuisine}
                    className="btn-secondary"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.cuisineType.map((cuisine, index) => (
                    <span
                      key={index}
                      className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {cuisine}
                      <button
                        type="button"
                        onClick={() => removeCuisine(cuisine)}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        <FiX size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiMapPin />
                  Location
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-medium mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.location.street}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: {
                            ...prev.location,
                            street: e.target.value,
                          },
                        }))
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">City</label>
                    <input
                      type="text"
                      value={formData.location.city}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: { ...prev.location, city: e.target.value },
                        }))
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">State</label>
                    <input
                      type="text"
                      value={formData.location.state}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: { ...prev.location, state: e.target.value },
                        }))
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={formData.location.zipCode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: {
                            ...prev.location,
                            zipCode: e.target.value,
                          },
                        }))
                      }
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Opening Hours */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiClock />
                  Opening Hours
                </h2>
                <div className="space-y-3">
                  {formData.openingHours.map((hours, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 border rounded-lg"
                    >
                      <div className="w-24 font-medium">{hours.day}</div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={hours.isClosed}
                          onChange={(e) =>
                            updateHours(index, "isClosed", e.target.checked)
                          }
                        />
                        Closed
                      </label>
                      {!hours.isClosed && (
                        <>
                          <div className="flex items-center gap-2">
                            <label className="text-sm">Open:</label>
                            <input
                              type="time"
                              value={hours.open}
                              onChange={(e) =>
                                updateHours(index, "open", e.target.value)
                              }
                              className="input-field w-32"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm">Close:</label>
                            <input
                              type="time"
                              value={hours.close}
                              onChange={(e) =>
                                updateHours(index, "close", e.target.value)
                              }
                              className="input-field w-32"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Restaurant Images
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {restaurant.images?.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={
                          image.startsWith("http")
                            ? image
                            : `${API.defaults.baseURL.replace("/api", "")}${image}`
                        }
                        alt={`Restaurant ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(image)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex items-center justify-center">
                    <label className="cursor-pointer flex flex-col items-center">
                      <FiUpload className="text-gray-400 mb-1" size={20} />
                      <span className="text-sm text-gray-500">
                        {uploading ? "Uploading..." : "Add Image"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfile;
