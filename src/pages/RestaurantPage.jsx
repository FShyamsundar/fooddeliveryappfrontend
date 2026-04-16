import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getRestaurantById,
  getRestaurantMenu,
  getRestaurantReviews,
  replyToReview,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import MenuItem from "../components/MenuItem";
import { FiStar, FiMapPin, FiClock, FiEdit } from "react-icons/fi";
import { getPrimaryImage } from "../utils/constants";

const RestaurantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const isOwner = user && restaurant && restaurant.owner === user._id;

  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: `/restaurant/${id}` } });
      return;
    }
    fetchData();
  }, [id, user]);

  const fetchData = async () => {
    try {
      const [restaurantRes, menuRes, reviewsRes] = await Promise.all([
        getRestaurantById(id),
        getRestaurantMenu(id),
        getRestaurantReviews(id),
      ]);
      setRestaurant(restaurantRes.data);
      setMenu(menuRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (reviewId) => {
    try {
      await replyToReview(reviewId, replyText);
      setReplyingTo(null);
      setReplyText("");
      fetchData();
    } catch (error) {
      alert("Failed to post reply");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!restaurant) return <div>Restaurant not found</div>;

  const categories = [
    "All",
    ...new Set(Array.isArray(menu) ? menu.map((item) => item.category) : []),
  ];
  const filteredMenu =
    selectedCategory === "All"
      ? menu
      : menu.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-6">
            <div className="flex gap-4">
              {/* Main Image */}
              <img
                src={getPrimaryImage(restaurant.images)}
                alt={restaurant.name}
                className="w-64 h-64 object-cover rounded-lg"
              />
              {/* Additional Images */}
              {restaurant.images && restaurant.images.length > 1 && (
                <div className="flex flex-col gap-2">
                  {restaurant.images.slice(1, 4).map((image, index) => (
                    <img
                      key={index}
                      src={image || getPrimaryImage(restaurant.images)}
                      alt={`${restaurant.name} ${index + 2}`}
                      className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
                {isOwner && (
                  <button
                    onClick={() => navigate("/menu-management")}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FiEdit /> Manage Menu
                  </button>
                )}
              </div>
              <p className="text-gray-600 mb-4">{restaurant.description}</p>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <FiStar className="text-yellow-500" />
                  <span className="font-semibold">
                    {restaurant.rating?.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ({restaurant.totalReviews} reviews)
                  </span>
                </div>
                <span className="text-primary font-semibold">
                  {restaurant.priceRange}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <FiMapPin />
                <span>
                  {restaurant.location?.street}, {restaurant.location?.city}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <FiClock />
                <span>Open today: 9:00 AM - 10:00 PM</span>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {restaurant.cuisineType?.map((cuisine, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Menu</h2>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                selectedCategory === category
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="grid gap-4">
          {Array.isArray(filteredMenu) &&
            filteredMenu.map((item) => (
              <MenuItem key={item._id} item={item} isOwner={false} />
            ))}
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Reviews</h2>
          <div className="space-y-4">
            {Array.isArray(reviews) &&
              reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white p-6 rounded-lg shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{review.user?.name}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={
                            i < review.rating
                              ? "text-yellow-500 fill-current"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                  {review.reply && (
                    <div className="mt-4 ml-6 p-4 bg-gray-50 rounded">
                      <p className="font-semibold text-sm mb-1">
                        Restaurant Reply:
                      </p>
                      <p className="text-gray-700">{review.reply.text}</p>
                    </div>
                  )}
                  {isOwner && !review.reply && (
                    <div className="mt-4">
                      {replyingTo === review._id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your reply..."
                            className="input-field flex-1"
                          />
                          <button
                            onClick={() => handleReplySubmit(review._id)}
                            className="btn-primary"
                          >
                            Send
                          </button>
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingTo(review._id)}
                          className="text-orange-500 text-sm font-medium"
                        >
                          Reply to review
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantPage;
