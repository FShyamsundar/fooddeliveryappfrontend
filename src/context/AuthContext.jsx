import { createContext, useState, useEffect, useContext } from "react";
import {
  login as loginAPI,
  register as registerAPI,
  getProfile,
} from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }

    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCart(Array.isArray(parsed) ? parsed : []);
      } catch {
        setCart([]);
      }
    }
  }, []);

  const loadUser = async () => {
    try {
      const { data } = await getProfile();
      setUser(data);
    } catch (error) {
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const { data } = await loginAPI(credentials);
    localStorage.setItem("token", data.token);
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const { data } = await registerAPI(userData);
    localStorage.setItem("token", data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setCart([]);
    localStorage.removeItem("cart");
  };

  const addToCart = (item) => {
    const currentCart = Array.isArray(cart) ? cart : [];
    const existingItem = currentCart.find((i) => i._id === item._id);
    let newCart;

    if (existingItem) {
      newCart = currentCart.map((i) =>
        i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i,
      );
    } else {
      newCart = [...currentCart, { ...item, quantity: 1 }];
    }

    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const removeFromCart = (itemId) => {
    const currentCart = Array.isArray(cart) ? cart : [];
    const newCart = currentCart.filter((i) => i._id !== itemId);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    const currentCart = Array.isArray(cart) ? cart : [];
    const newCart = currentCart.map((i) =>
      i._id === itemId ? { ...i, quantity } : i,
    );
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
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
    clearCart,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
