import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../api";

const RestaurantReviewsPage = () => {
  const { restaurantId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const restaurant = location.state?.restaurant;

  useEffect(() => {
    fetchReviews();
  }, [restaurantId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/donations/restaurant/${restaurantId}/reviews`);
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
          <span key={star} className="text-yellow-400 text-lg">
            {star <= rating ? "★" : "☆"}
          </span>
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === "all") return true;
    return review.rating === parseInt(filter);
  });

  const getRatingCount = (rating) => {
    return reviews.filter(r => r.rating === rating).length;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
          >
            <span className="text-xl">←</span>
            <span>Back</span>
          </button>
          
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            {restaurant?.name || "Restaurant"} Reviews
          </h1>
          
          {stats && (
            <div className="flex flex-wrap items-center gap-6 mt-4">
              <div className="flex items-center gap-3">
                <span className="text-yellow-300 text-3xl">★</span>
                <div>
                  <div className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</div>
                  <div className="text-sm opacity-90">{stats.totalReviews} reviews</div>
                </div>
              </div>
              
              {/* Rating Distribution */}
              <div className="flex-1 min-w-[200px]">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = getRatingCount(rating);
                  const percentage = stats.totalReviews > 0 
                    ? (count / stats.totalReviews) * 100 
                    : 0;
                  
                  return (
                    <div key={rating} className="flex items-center gap-2 text-sm mb-1">
                      <span className="w-8">{rating}★</span>
                      <div className="flex-1 bg-white bg-opacity-30 rounded-full h-2">
                        <div 
                          className="bg-yellow-300 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            All Reviews ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = getRatingCount(rating);
            if (count === 0) return null;
            
            return (
              <button
                key={rating}
                onClick={() => setFilter(rating.toString())}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === rating.toString()
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {rating}★ ({count})
              </button>
            );
          })}
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading reviews...</span>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-5xl mb-4">⭐</div>
            <p className="text-gray-600 font-medium text-lg">No reviews found</p>
            <p className="text-sm text-gray-500 mt-2">
              {filter === "all" 
                ? "This restaurant hasn't received any reviews yet."
                : `No ${filter}-star reviews found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    {renderStars(review.rating)}
                    <p className="text-xs font-medium text-gray-500 mt-1">
                      Anonymous Reviewer
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.ratedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                {/* Donation Info */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 bg-gray-50 rounded px-3 py-2">
                  <span className="font-medium">{review.foodType}</span>
                  <span>•</span>
                  <span>{review.quantity}</span>
                </div>

                {/* Review Text */}
                {review.review ? (
                  <p className="text-gray-700 leading-relaxed">
                    "{review.review}"
                  </p>
                ) : (
                  <p className="text-gray-500 italic text-sm">
                    No written review provided
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {!loading && filteredReviews.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-600">
            Showing {filteredReviews.length} of {reviews.length} reviews
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantReviewsPage;