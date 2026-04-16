import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiShoppingCart,
  FiUser,
  FiLogOut,
  FiHome,
  FiPackage,
  FiEdit,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { useState } from "react";

const Navbar = () => {
  const { user, logout, cart } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200">
      <div className="container">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-xl group-hover:scale-105 transition-transform shadow-sm">
              <FiHome className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FoodHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                {user.role === "restaurant" && (
                  <>
                    <Link to="/restaurant-dashboard" className="btn-ghost">
                      <FiPackage size={18} />
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/menu-management" className="btn-ghost">
                      <FiEdit size={18} />
                      <span>Menu</span>
                    </Link>
                  </>
                )}

                {user.role === "admin" && (
                  <Link to="/admin-dashboard" className="btn-ghost">
                    <FiPackage size={18} />
                    <span>Admin</span>
                  </Link>
                )}

                {user.role === "customer" && (
                  <>
                    <Link
                      to="/cart"
                      className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <FiShoppingCart className="text-slate-600" size={20} />
                      {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                          {cart.length}
                        </span>
                      )}
                    </Link>
                    <Link to="/orders" className="btn-ghost">
                      <FiPackage size={18} />
                      <span>Orders</span>
                    </Link>
                  </>
                )}

                <Link
                  to="/profile"
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <FiUser className="text-slate-600" size={20} />
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors text-slate-600 hover:text-red-600"
                >
                  <FiLogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4 animate-slide-up">
            <div className="flex flex-col gap-4">
              {user ? (
                <>
                  {user.role === "restaurant" && (
                    <>
                      <Link
                        to="/restaurant-dashboard"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiPackage size={20} />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/menu-management"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiEdit size={20} />
                        <span>Menu</span>
                      </Link>
                    </>
                  )}

                  {user.role === "admin" && (
                    <Link
                      to="/admin-dashboard"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FiPackage size={20} />
                      <span>Admin</span>
                    </Link>
                  )}

                  {user.role === "customer" && (
                    <>
                      <Link
                        to="/cart"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiShoppingCart size={20} />
                        <span>Cart</span>
                        {cart.length > 0 && (
                          <span className="bg-accent text-white text-xs font-semibold rounded-full px-2 py-1 ml-auto">
                            {cart.length}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiPackage size={20} />
                        <span>Orders</span>
                      </Link>
                    </>
                  )}

                  <Link
                    to="/profile"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiUser size={20} />
                    <span>Profile</span>
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-left text-red-600"
                  >
                    <FiLogOut size={20} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary mx-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
