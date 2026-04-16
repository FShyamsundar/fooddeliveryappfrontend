import { createContext, useState, useEffect, useContext } from 'react';
import { login as loginAPI, register as registerAPI, getProfile } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
    
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const loadUser = async () => {
    try {
      const { data } = await getProfile();
      setUser(data);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const { data } = await loginAPI(credentials);
    localStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const { data } = await registerAPI(userData);
    localStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCart([]);
    localStorage.removeItem('cart');
  };

  const addToCart = (item) => {
    const existingItem = cart.find(i => i._id === item._id);
    let newCart;
    
    if (existingItem) {
      newCart = cart.map(i => 
        i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      newCart = [...cart, { ...item, quantity: 1 }];
    }
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeFromCart = (itemId) => {
    const newCart = cart.filter(i => i._id !== itemId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    const newCart = cart.map(i => 
      i._id === itemId ? { ...i, quantity } : i
    );
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
