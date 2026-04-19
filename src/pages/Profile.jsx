import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../services/api";
import {
  validateEmail,
  validatePhone,
  validateName,
  validateAddress,
  validateCity,
  validateState,
  validatePinCode,
  validateRequired,
} from "../utils/formValidation";
import { FiUser, FiMapPin, FiCreditCard, FiHome } from "react-icons/fi";

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [newAddress, setNewAddress] = useState({
    label: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    isDefault: false,
  });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await getProfile();
      setProfile(data);
      setFormData({
        name: data.name,
        email: data.email,
        phone: data.phone || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const validateField = (name, value) => {
    let error = null;
    switch (name) {
      case "name":
        error = validateName(value, "Name");
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "phone":
        error = validatePhone(value);
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateAddressField = (name, value) => {
    let error = null;
    switch (name) {
      case "label":
        error = validateRequired(value, "Address label");
        break;
      case "street":
        error = validateAddress(value);
        break;
      case "city":
        error = validateCity(value);
        break;
      case "state":
        error = validateState(value);
        break;
      case "zipCode":
        error = validatePinCode(value);
        break;
      default:
        break;
    }
    return error;
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setNewAddress(prev => ({ ...prev, [name]: newValue }));

    // Validate the field
    const error = validateAddressField(name, newValue);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });
      setMessage("Profile updated successfully");
      fetchProfile();
    } catch (error) {
      setErrors({
        general: error.response?.data?.message || "Error updating profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setNewAddress({
      label: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      isDefault: false,
    });
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();

    // Validate all address fields
    const addressErrors = {};
    const addressFields = ['label', 'street', 'city', 'state', 'zipCode'];

    addressFields.forEach(field => {
      const error = validateAddressField(field, newAddress[field]);
      if (error) addressErrors[field] = error;
    });

    if (Object.keys(addressErrors).length > 0) {
      setErrors(addressErrors);
      setMessage("Please fix the errors below.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, {
          ...newAddress,
          label: newAddress.label.trim(),
          street: newAddress.street.trim(),
          city: newAddress.city.trim(),
          state: newAddress.state.trim(),
          zipCode: newAddress.zipCode.trim(),
        });
        setMessage("Address updated successfully");
      } else {
        await addAddress({
          ...newAddress,
          label: newAddress.label.trim(),
          street: newAddress.street.trim(),
          city: newAddress.city.trim(),
          state: newAddress.state.trim(),
          zipCode: newAddress.zipCode.trim(),
        });
        setMessage("Address added successfully");
      }
      resetAddressForm();
      fetchProfile();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          (editingAddressId
            ? "Error updating address"
            : "Error adding address"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address._id);
    setNewAddress({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      isDefault: address.isDefault,
    });
    setActiveTab("addresses");
    setMessage("");
  };

  const handleDeleteAddress = async (addressId, isDefaultAddress) => {
    if (!window.confirm("Delete this address?")) return;
    setLoading(true);
    setMessage("");
    try {
      await deleteAddress(addressId);
      setMessage("Address deleted successfully");
      fetchProfile();
      if (isDefaultAddress && profile.addresses?.length > 1) {
        const nextDefault = profile.addresses.find(
          (addr) => addr._id !== addressId,
        );
        if (nextDefault) {
          await updateAddress(nextDefault._id, { isDefault: true });
          fetchProfile();
        }
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error deleting address");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <Link
            to="/"
            className="text-gray-600 font-medium text-sm flex items-center gap-2 hover:text-orange-500"
          >
            <FiHome size={18} />
            Home
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-2 px-4 flex items-center gap-2 ${
              activeTab === "profile"
                ? "border-b-2 border-primary text-primary font-semibold"
                : "text-gray-600"
            }`}
          >
            <FiUser /> Profile
          </button>
          <button
            onClick={() => setActiveTab("addresses")}
            className={`pb-2 px-4 flex items-center gap-2 ${
              activeTab === "addresses"
                ? "border-b-2 border-primary text-primary font-semibold"
                : "text-gray-600"
            }`}
          >
            <FiMapPin /> Addresses
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            className={`pb-2 px-4 flex items-center gap-2 ${
              activeTab === "payment"
                ? "border-b-2 border-primary text-primary font-semibold"
                : "text-gray-600"
            }`}
          >
            <FiCreditCard /> Payment Methods
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 p-4 rounded ${
              message.includes("success")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Personal Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {errors.general}
                </div>
              )}
              <div>
                <label className="block font-semibold mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-field ${errors.name ? "border-red-500" : ""}`}
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block font-semibold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field ${errors.email ? "border-red-500" : ""}`}
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block font-semibold mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input-field ${errors.phone ? "border-red-500" : ""}`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === "addresses" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Saved Addresses</h2>
              <div className="space-y-3">
                {profile.addresses?.map((address) => (
                  <div key={address._id} className="border rounded p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{address.label}</p>
                          {address.isDefault && (
                            <span className="bg-primary text-white text-xs px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">
                          {address.street}, {address.city}, {address.state}{" "}
                          {address.zipCode}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditAddress(address)}
                          className="text-primary underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteAddress(address._id, address.isDefault)
                          }
                          className="text-red-500 underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingAddressId ? "Edit Address" : "Add New Address"}
              </h2>
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">
                    Label (e.g., Home, Work)
                  </label>
                  <input
                    type="text"
                    name="label"
                    value={newAddress.label}
                    onChange={handleAddressChange}
                    className={`input-field ${errors.label ? "border-red-500" : ""}`}
                    required
                  />
                  {errors.label && (
                    <p className="text-red-500 text-sm mt-1">{errors.label}</p>
                  )}
                </div>
                <div>
                  <label className="block font-semibold mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={newAddress.street}
                    onChange={handleAddressChange}
                    className={`input-field ${errors.street ? "border-red-500" : ""}`}
                    required
                  />
                  {errors.street && (
                    <p className="text-red-500 text-sm mt-1">{errors.street}</p>
                  )}
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={newAddress.city}
                      onChange={handleAddressChange}
                      className={`input-field ${errors.city ? "border-red-500" : ""}`}
                      required
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-semibold mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={newAddress.state}
                      onChange={handleAddressChange}
                      className={`input-field ${errors.state ? "border-red-500" : ""}`}
                      required
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-semibold mb-2">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={newAddress.zipCode}
                      onChange={handleAddressChange}
                      className={`input-field ${errors.zipCode ? "border-red-500" : ""}`}
                      required
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                    )}
                  </div>
                </div>
                        })
                      }
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={newAddress.isDefault}
                    onChange={handleAddressChange}
                  />
                  <span>Set as default address</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading
                      ? editingAddressId
                        ? "Updating..."
                        : "Saving..."
                      : editingAddressId
                        ? "Update Address"
                        : "Add Address"}
                  </button>
                  {editingAddressId && (
                    <button
                      type="button"
                      onClick={resetAddressForm}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === "payment" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Payment Methods</h2>
            <p className="text-gray-600">
              Payment methods will be saved during checkout
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
