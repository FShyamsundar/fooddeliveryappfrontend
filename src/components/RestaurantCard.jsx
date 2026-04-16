import { Link } from "react-router-dom";
import { FiStar, FiMapPin, FiClock } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getPrimaryImage } from "../utils/constants";

const RestaurantCard = ({ restaurant }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate("/login", { state: { from: `/restaurant/${restaurant._id}` } });
    }
  };

  return (
    <Link
      to={`/restaurant/${restaurant._id}`}
      onClick={handleClick}
      className="card group hover:scale-[1.02] transition-transform"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100 rounded-t-2xl">
        <img
          src={getPrimaryImage(restaurant.images)}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {restaurant.images && restaurant.images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium">
            +{restaurant.images.length - 1} more
          </div>
        )}
        {restaurant.rating >= 4 && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1 shadow-sm">
            <FiStar size={14} className="fill-white" />
            {restaurant.rating.toFixed(1)}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 rounded-b-2xl">
          <p className="text-white text-sm font-medium flex items-center gap-2">
            <FiClock size={14} /> 25-35 mins
          </p>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg text-slate-800 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {restaurant.name}
        </h3>

        <div className="flex items-center gap-3 text-sm text-slate-600 mb-3">
          <span className="flex items-center gap-1">
            <FiStar size={14} className="text-accent" />
            {restaurant.rating?.toFixed(1) || "New"}
          </span>
          <span>•</span>
          <span>{restaurant.priceRange}</span>
          <span>•</span>
          <span className="truncate">{restaurant.cuisineType?.[0]}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <FiMapPin size={14} />
          <span className="truncate">{restaurant.location?.city}</span>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
