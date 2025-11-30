import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../api";

const DonationHistory = ({ userType }) => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchHistory();
  }, [userType]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const endpoint = userType === "restaurant" 
        ? "/donations/history/restaurant" 
        : "/donations/history/ngo";
      
      const response = await api.get(endpoint);
      setHistory(response.data.donations || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to load donation history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Accepted":
        return "bg-blue-100 text-blue-800";
      case "Requested":
        return "bg-yellow-100 text-yellow-800";
      case "Available":
        return "bg-gray-100 text-gray-800";
      case "Expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return "✅";
      case "Accepted":
        return "🤝";
      case "Requested":
        return "⏳";
      case "Available":
        return "📦";
      case "Expired":
        return "⏰";
      default:
        return "📋";
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-yellow-400 text-lg">
            {star <= rating ? "★" : "☆"}
          </span>
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">
          {rating}.0
        </span>
      </div>
    );
  };

  const filteredHistory = history.filter(donation => {
    if (filter === "all") return true;
    return donation.status.toLowerCase() === filter.toLowerCase();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading history...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
          <div className="text-lg sm:text-2xl font-bold text-blue-600">
            {userType === "restaurant" ? stats.totalDonations : stats.totalRequests}
          </div>
          <div className="text-xs sm:text-sm text-blue-800">
            Total {userType === "restaurant" ? "Donations" : "Requests"}
          </div>
        </div>

        <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
          <div className="text-lg sm:text-2xl font-bold text-green-600">
            {userType === "restaurant" ? stats.completedDonations : stats.completedRequests}
          </div>
          <div className="text-xs sm:text-sm text-green-800">Completed</div>
        </div>

        <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border border-yellow-200">
          <div className="text-lg sm:text-2xl font-bold text-yellow-600">
            {userType === "restaurant" ? stats.pendingDonations : stats.pendingRequests}
          </div>
          <div className="text-xs sm:text-sm text-yellow-800">Pending</div>
        </div>

        <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-200">
          <div className="text-lg sm:text-2xl font-bold text-purple-600">
            {userType === "restaurant" ? stats.totalQuantityDonated : stats.totalQuantityReceived}
          </div>
          <div className="text-xs sm:text-sm text-purple-800">
            Units {userType === "restaurant" ? "Donated" : "Received"}
          </div>
        </div>

        <div className="bg-red-50 p-3 sm:p-4 rounded-lg border border-red-200">
          <div className="text-lg sm:text-2xl font-bold text-red-600">
            {userType === "restaurant" ? stats.expiredDonations : stats.expiredRequests}
          </div>
          <div className="text-xs sm:text-sm text-red-800">Expired</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {["all", "completed", "accepted", "requested", "available", "expired"].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
              filter === filterOption
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      {/* History List */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-medium">No donation history found</p>
            <p className="text-sm mt-1">
              {filter === "all" 
                ? `Start ${userType === "restaurant" ? "donating" : "requesting"} to see your history here`
                : `No ${filter} donations found`
              }
            </p>
          </div>
        ) : (
          filteredHistory.map((donation) => (
            <div key={donation._id} className="bg-white border rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getStatusIcon(donation.status)}</span>
                    <h3 className="font-semibold text-base sm:text-lg">{donation.foodType}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                      {donation.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Quantity:</span> {donation.quantity}
                    </div>
                    <div>
                      <span className="font-medium">
                        {userType === "restaurant" ? "Requested by:" : "From:"}
                      </span>{" "}
                      {userType === "restaurant" 
                        ? (donation.requestedBy?.name || "No requests yet")
                        : (donation.restaurant?.name || "Unknown Restaurant")
                      }
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>{" "}
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Expires:</span>{" "}
                      {new Date(donation.expiryTime).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>Created: {new Date(donation.createdAt).toLocaleString()}</span>
                    </div>
                    
                    {donation.requestedAt && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Requested: {new Date(donation.requestedAt).toLocaleString()}</span>
                      </div>
                    )}
                    
                    {donation.acceptedAt && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>Accepted: {new Date(donation.acceptedAt).toLocaleString()}</span>
                      </div>
                    )}
                    
                    {donation.completedAt && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Completed: {new Date(donation.completedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Rating and Review Section - Only for Completed Donations */}
                  {donation.status === "Completed" && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {donation.rating ? (
                        <div className="space-y-2">
                          {/* Rating Stars */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">Rating:</span>
                            {renderStars(donation.rating)}
                            {donation.ratedAt && (
                              <span className="text-xs text-gray-500">
                                • {new Date(donation.ratedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          
                          {/* Review Text */}
                          {donation.review && (
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <p className="text-sm font-semibold text-gray-700 mb-1">Review:</p>
                              <p className="text-sm text-gray-600 italic">"{donation.review}"</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>⭐</span>
                          <span>No rating provided for this donation</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {/* {filteredHistory.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Summary</h4>
          <p className="text-sm text-gray-600">
            Showing {filteredHistory.length} of {history.length} total donations.
            {userType === "restaurant" 
              ? ` You have successfully donated ${stats.totalQuantityDonated} units of food.`
              : ` You have received ${stats.totalQuantityReceived} units of food donations.`
            }
          </p>
        </div>
      )} */}
    </div>
  );
};

export default DonationHistory;