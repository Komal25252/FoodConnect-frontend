import { useState } from "react";

const RatingReviewModal = ({ donation, onSubmit, onSkip, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");

  const handleSubmit = () => {
    onSubmit({ rating, review });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
          <h2 className="text-2xl font-bold text-white mb-2">Rate Your Experience</h2>
          <p className="text-blue-100 text-sm">
            Help us improve by sharing your feedback
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Donation Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Donation Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Food:</span> {donation.foodType}</p>
              <p><span className="font-medium">Quantity:</span> {donation.quantity}</p>
              <p><span className="font-medium">Restaurant:</span> {donation.restaurant?.name || "Unknown"}</p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3">
              How would you rate this donation?
            </label>
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                >
                  {star <= (hoveredRating || rating) ? (
                    <span className="text-yellow-400">★</span>
                  ) : (
                    <span className="text-gray-300">☆</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500">
              {rating === 0 && "Click to rate"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Review Text Area */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Share your experience (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tell us about your experience with this donation..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="4"
              maxLength="500"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {review.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSubmit}
              disabled={rating === 0}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                rating === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Submit Review
            </button>
            <button
              onClick={onSkip}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Skip for Now
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Your feedback helps restaurants improve their service
          </p>
        </div>
      </div>
    </div>
  );
};

export default RatingReviewModal;