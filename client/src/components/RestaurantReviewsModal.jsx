import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const RestaurantReviewsModal = ({ restaurant, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, [restaurant]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/donations/restaurant/${restaurant._id}/reviews`);
      setReviews(response.data.reviews || []);
      setStats(response.data.stats || null);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-yellow-400 text-base">
            {star <= rating ? "★" : "☆"}
          </span>
        ))}
      </div>
    );
  };

  const handleViewAll = () => {
    navigate(`/restaurant-reviews/${restaurant._id}`, {
      state: { restaurant }
    });
    onClose();
  };

  // Show only first 4 reviews
  const displayedReviews = reviews.slice(0, 4);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
          <h2 className="text-2xl font-bold text-white mb-2">
            {restaurant.name || "Restaurant"} Reviews
          </h2>
          {stats && (
            <div className="flex items-center gap-4 text-white text-sm">
              <div className="flex items-center gap-2">
                <span className="text-yellow-300 text-xl">★</span>
                <span className="font-semibold text-lg">{stats.averageRating.toFixed(1)}</span>
                <span className="opacity-90">({stats.totalReviews} reviews)</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading reviews...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">⭐</div>
              <p className="text-gray-600 font-medium">No reviews yet</p>
              <p className="text-sm text-gray-500 mt-1">
                This restaurant hasn't received any reviews yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedReviews.map((review, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {/* Rating and Date */}
                  <div className="flex items-center justify-between mb-2">
                    {renderStars(review.rating)}
                    <span className="text-xs text-gray-500">
                      {new Date(review.ratedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Donation Info */}
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">{review.foodType}</span>
                    <span className="mx-2">•</span>
                    <span>{review.quantity}</span>
                  </div>

                  {/* Review Text */}
                  {review.review && (
                    <p className="text-sm text-gray-700 italic">
                      "{review.review}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && reviews.length > 0 && (
          <div className="border-t p-4 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              {reviews.length > 4 && (
                <button
                  onClick={handleViewAll}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Load More ({reviews.length - 4} more reviews)
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantReviewsModal;