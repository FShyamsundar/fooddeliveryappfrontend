import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, addAddress } from '../services/api';
import { FiUser, FiMapPin, FiCreditCard, FiHome } from 'react-icons/fi';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [newAddress, setNewAddress] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
        phone: data.phone || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await updateProfile(formData);
      setMessage('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await addAddress(newAddress);
      setMessage('Address added successfully');
      setNewAddress({
        label: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        isDefault: false
      });
      fetchProfile();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error adding address');
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
            onClick={() => setActiveTab('profile')}
            className={`pb-2 px-4 flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-b-2 border-primary text-primary font-semibold'
                : 'text-gray-600'
            }`}
          >
            <FiUser /> Profile
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-2 px-4 flex items-center gap-2 ${
              activeTab === 'addresses'
                ? 'border-b-2 border-primary text-primary font-semibold'
                : 'text-gray-600'
            }`}
          >
            <FiMapPin /> Addresses
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`pb-2 px-4 flex items-center gap-2 ${
              activeTab === 'payment'
                ? 'border-b-2 border-primary text-primary font-semibold'
                : 'text-gray-600'
            }`}
          >
            <FiCreditCard /> Payment Methods
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded ${
            message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Personal Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Saved Addresses</h2>
              <div className="space-y-3">
                {profile.addresses?.map((address, idx) => (
                  <div key={idx} className="border rounded p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{address.label}</p>
                        <p className="text-gray-600">
                          {address.street}, {address.city}, {address.state} {address.zipCode}
                        </p>
                      </div>
                      {address.isDefault && (
                        <span className="bg-primary text-white text-xs px-2 py-1 rounded">Default</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Add New Address</h2>
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">Label (e.g., Home, Work)</label>
                  <input
                    type="text"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Street Address</label>
                  <input
                    type="text"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold mb-2">City</label>
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2">State</label>
                    <input
                      type="text"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={newAddress.zipCode}
                      onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  />
                  <span>Set as default address</span>
                </label>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Adding...' : 'Add Address'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'payment' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Payment Methods</h2>
            <p className="text-gray-600">Payment methods will be saved during checkout</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
