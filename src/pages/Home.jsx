import { useState, useEffect } from "react";
import { getRestaurants } from "../services/api";
import RestaurantCard from "../components/RestaurantCard";
import {
  FiSearch,
  FiSliders,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const heroSlides = [
  {
    title: "Fresh Food, Fast Delivery",
    subtitle: "Discover amazing restaurants near you",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=500&fit=crop",
  },
  {
    title: "Quality You Can Taste",
    subtitle: "Premium ingredients, exceptional flavors",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=500&fit=crop",
  },
  {
    title: "Dine Without Limits",
    subtitle: "Explore cuisines from around the world",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=500&fit=crop",
  },
];

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    cuisine: "",
    rating: "",
    priceRange: "",
  });

  useEffect(() => {
    fetchRestaurants();
  }, [filters]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const { data } = await getRestaurants(filters);
      setRestaurants(data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: "", cuisine: "", rating: "", priceRange: "" });
  };

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );

  const activeFiltersCount = Object.values(filters).filter((v) => v).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Slider */}
      <div className="relative h-[60vh] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-black/30 z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="container text-center text-white">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in text-balance">
                  {slide.title}
                </h1>
                <p className="text-lg sm:text-xl text-white/90 animate-fade-in text-balance max-w-2xl mx-auto">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all border border-white/20"
        >
          <FiChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all border border-white/20"
        >
          <FiChevronRight size={24} />
        </button>

        {/* Slider Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? "bg-white w-8" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
      {/* Search Bar - Sticky */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200">
        <div className="container py-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex items-center bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 focus-within:border-primary transition-colors shadow-sm">
              <FiSearch className="text-slate-400 mr-3" size={20} />
              <input
                type="text"
                placeholder="Search restaurants, cuisines, or dishes..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="flex-1 bg-transparent focus:outline-none text-base placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative px-6 py-3 bg-white border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-2 shadow-sm ${
                showFilters ? "border-primary bg-primary/5" : ""
              }`}
            >
              <FiSliders size={20} />
              <span className="hidden sm:inline font-medium">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter Chips */}
          {showFilters && (
            <div className="mt-6 p-6 bg-slate-50 rounded-xl animate-slide-up border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-800 text-lg">
                  Filter Options
                </h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-accent font-medium hover:text-accent/80 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
              {/* Cuisine Filter */}
              <div className="mb-6">
                <p className="text-sm text-slate-600 mb-4 font-medium uppercase tracking-wide">
                  Cuisine Type
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    "Italian",
                    "Chinese",
                    "Indian",
                    "Mexican",
                    "American",
                    "Japanese",
                  ].map((cuisine) => (
                    <button
                      key={cuisine}
                      onClick={() =>
                        handleFilterChange(
                          "cuisine",
                          filters.cuisine === cuisine ? "" : cuisine,
                        )
                      }
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${
                        filters.cuisine === cuisine
                          ? "bg-primary text-white shadow-md"
                          : "bg-white border border-slate-200 text-slate-700 hover:border-primary hover:shadow-md"
                      }`}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <p className="text-sm text-slate-600 mb-4 font-medium uppercase tracking-wide">
                  Minimum Rating
                </p>
                <div className="flex gap-3">
                  {["4+", "3+"].map((rating) => (
                    <button
                      key={rating}
                      onClick={() =>
                        handleFilterChange(
                          "rating",
                          filters.rating === rating[0] ? "" : rating[0],
                        )
                      }
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${
                        filters.rating === rating[0]
                          ? "bg-primary text-white shadow-md"
                          : "bg-white border border-slate-200 text-slate-700 hover:border-primary hover:shadow-md"
                      }`}
                    >
                      ⭐ {rating}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <p className="text-sm text-slate-600 mb-4 font-medium uppercase tracking-wide">
                  Price Range
                </p>
                <div className="flex gap-3">
                  {["$", "$$", "$$$", "$$$$"].map((price) => (
                    <button
                      key={price}
                      onClick={() =>
                        handleFilterChange(
                          "priceRange",
                          filters.priceRange === price ? "" : price,
                        )
                      }
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${
                        filters.priceRange === price
                          ? "bg-primary text-white shadow-md"
                          : "bg-white border border-slate-200 text-slate-700 hover:border-primary hover:shadow-md"
                      }`}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Restaurant Grid */}
      <div className="container py-12">
        <div className="mb-8">
          <h2 className="section-title">Featured Restaurants</h2>
          <p className="section-subtitle">
            Discover the best dining experiences in your area
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="text-6xl mb-6">🍽️</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No restaurants found
            </h3>
            <p className="text-slate-600">Try adjusting your search filters</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-slate-600 font-medium">
                {restaurants.length} restaurant
                {restaurants.length !== 1 ? "s" : ""} available
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.isArray(restaurants) &&
                restaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant._id}
                    restaurant={restaurant}
                  />
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
