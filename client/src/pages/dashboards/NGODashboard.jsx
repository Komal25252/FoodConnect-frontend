import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";
import SimpleLocationsMap from "../../components/SimpleLocationsMap";
import RestaurantLocationModal from "../../components/RestaurantLocationModal";
import ChatWidget from "../../components/ChatWidget";
import DonationHistory from "../../components/DonationHistory";
import RatingReviewModal from "../../components/RatingReviewModal";
import RestaurantReviewsModal from "../../components/RestaurantReviewsModal";

const NGODashboard = () => {
  const navigate = useNavigate();
  const [ngo, setNgo] = useState(null);
  const [availableDonations, setAvailableDonations] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("available");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [reviewsRestaurant, setReviewsRestaurant] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("Please login first!");
      navigate("/ngo-login");
    } else {
      setNgo(JSON.parse(storedUser));
      initializeNGO();
    }
  }, [navigate]);

  const initializeNGO = async () => {
    try {
      // Ensure NGO profile exists
      await api.post("/donations/migrate-user");
      fetchAvailableDonations();
      fetchMyRequests();
    } catch (error) {
      console.error("Error initializing NGO:", error);
      fetchAvailableDonations(); // Try to fetch anyway
      fetchMyRequests();
    }
  };
  
  const fetchAvailableDonations = async () => {
    setLoading(true);
    try {
      const response = await api.get("/donations/available");
      setAvailableDonations(response.data.donations || []);
    } catch (error) {
      console.error("Error fetching available donations:", error);
      toast.error("Failed to load available donations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get("/donations/my-requests");
      setMyRequests(response.data.donations || []);
    } catch (error) {
      console.error("Error fetching my requests:", error);
      toast.error("Failed to load your requests");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast.success("Logged out successfully!");
    navigate("/");
  };

  if (!ngo) return null;

  const handleRequestDonation = async (donationId) => {
    try {
      await api.post(`/donations/request/${donationId}`);
      toast.success("Request sent successfully!");
      fetchAvailableDonations();
      fetchMyRequests();
    } catch (error) {
      console.error("Error requesting donation:", error);
      toast.error("Failed to send request");
    }
  };

  const handleCompleteDonation = async (donation) => {
    // Show rating modal before completing
    setSelectedDonation(donation);
    setShowRatingModal(true);
  };

  const handleSubmitRating = async ({ rating, review }) => {
    try {
      // First, submit the rating and review
      await api.post(`/donations/${selectedDonation._id}/rate`, {
        rating,
        review
      });

      // Then mark the donation as complete
      await api.post(`/donations/complete/${selectedDonation._id}`);
      
      toast.success("Thank you for your feedback! Donation marked as completed!");
      setShowRatingModal(false);
      setSelectedDonation(null);
      fetchMyRequests();
    } catch (error) {
      console.error("Error completing donation:", error);
      toast.error("Failed to complete the process");
    }
  };

  const handleSkipRating = async () => {
    try {
      // Mark donation as complete without rating
      await api.post(`/donations/complete/${selectedDonation._id}`);
      toast.success("Donation marked as completed!");
      setShowRatingModal(false);
      setSelectedDonation(null);
      fetchMyRequests();
    } catch (error) {
      console.error("Error completing donation:", error);
      toast.error("Failed to mark donation as completed");
    }
  };

  const handleCloseRatingModal = () => {
    setShowRatingModal(false);
    setSelectedDonation(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
      <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          {ngo.avatar && (
            <img 
              src={ngo.avatar} 
              alt={ngo.name}
              className="w-12 h-12 rounded-full border-2 border-blue-200"
            />
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">
            Welcome, {ngo.name} 👋
          </h1>
        </div>
        <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
          This is your NGO dashboard. From here, you can manage food requests,
          track donations, and collaborate with restaurants.
        </p>

        {/* Contact Details Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-2">Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">📧</span>
              <span className="text-gray-700">Email: {ngo.email}</span>
            </div>
            {ngo.phone && (
              <div className="flex items-center gap-2">
                <span className="text-blue-600">📱</span>
                <span className="text-gray-700">Phone: {ngo.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b mb-4 sm:mb-6 -mx-4 sm:mx-0 px-4 sm:px-0">
          <button
            className={`py-2 px-3 sm:px-4 font-medium text-sm sm:text-base whitespace-nowrap ${
              activeTab === "available"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
            onClick={() => {
              setActiveTab("available");
              fetchAvailableDonations();
            }}
          >
            Available
          </button>
          <button
            className={`py-2 px-3 sm:px-4 font-medium text-sm sm:text-base whitespace-nowrap ${
              activeTab === "myRequests"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
            onClick={() => {
              setActiveTab("myRequests");
              fetchMyRequests();
            }}
          >
            My Requests
          </button>
          <button
            className={`py-2 px-3 sm:px-4 font-medium text-sm sm:text-base whitespace-nowrap ${
              activeTab === "history"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
          <button
            className={`py-2 px-3 sm:px-4 font-medium text-sm sm:text-base whitespace-nowrap ${
              activeTab === "map"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
            onClick={() => setActiveTab("map")}
          >
            Map
          </button>
        </div>

        {/* Available Donations */}
        {activeTab === "available" && (
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-600 mb-3 sm:mb-4">Available Donations</h2>
            
            {loading ? (
              <p className="text-gray-500">Loading donations...</p>
            ) : availableDonations.length === 0 ? (
              <p className="text-gray-500">No available donations at the moment.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {availableDonations.map((donation) => (
                  <div key={donation._id} className="border rounded-lg p-3 sm:p-4 shadow-sm">
                    <h3 className="font-semibold text-base sm:text-lg">{donation.foodType}</h3>
                    <p className="text-sm sm:text-base text-gray-600">Quantity: {donation.quantity}</p>
                    <p className="text-sm sm:text-base text-gray-600">
                      Expiry: {new Date(donation.expiryTime).toLocaleString()}
                    </p>
                    <p className="text-sm sm:text-base text-gray-600">
                      Donor: {donation.restaurant?.name || "Anonymous Restaurant"}
                    </p>
                    <p className="text-sm sm:text-base text-gray-600 truncate">
                      Pickup: {donation.pickupLocation}
                    </p>
                    <p className="text-sm sm:text-base text-gray-600">
                      Option: {donation.preferredOption}
                    </p>
                    <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleRequestDonation(donation._id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded text-sm sm:text-base"
                      >
                        Request
                      </button>
                      {donation.restaurant && (
                        <>
                          <button
                            onClick={() => setSelectedRestaurant(donation.restaurant)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded flex items-center justify-center gap-1 text-sm sm:text-base"
                          >
                            📍 Location
                          </button>
                          <button
                            onClick={() => {
                              setReviewsRestaurant(donation.restaurant);
                              setShowReviewsModal(true);
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 sm:px-4 py-2 rounded flex items-center justify-center gap-1 text-sm sm:text-base"
                          >
                            ⭐ View Reviews
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Requests */}
        {activeTab === "myRequests" && (
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-600 mb-3 sm:mb-4">My Requests</h2>
            
            {loading ? (
              <p className="text-gray-500">Loading your requests...</p>
            ) : myRequests.length === 0 ? (
              <p className="text-gray-500">You haven't made any requests yet.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {myRequests.map((donation) => (
                  <div key={donation._id} className="border rounded-lg p-3 sm:p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{donation.foodType}</h3>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        donation.status === "Requested" ? "bg-yellow-100 text-yellow-800" :
                        donation.status === "Accepted" ? "bg-green-100 text-green-800" :
                        donation.status === "Completed" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {donation.status}
                      </span>
                    </div>
                    <p className="text-gray-600">Quantity: {donation.quantity}</p>
                    <p className="text-gray-600">
                      Expiry: {new Date(donation.expiryTime).toLocaleString()}
                    </p>
                    <p className="text-gray-600">
                      Restaurant: {donation.restaurant?.name || "Unknown Restaurant"}
                    </p>
                    <p className="text-gray-600">
                      Pickup Location: {donation.pickupLocation}
                    </p>
                    <p className="text-gray-600">
                      Preferred Option: {donation.preferredOption}
                    </p>
                    {donation.requestedAt && (
                      <p className="text-gray-500 text-sm mt-2">
                        Requested: {new Date(donation.requestedAt).toLocaleString()}
                      </p>
                    )}
                    {donation.acceptedAt && (
                      <p className="text-green-600 text-sm">
                        Accepted: {new Date(donation.acceptedAt).toLocaleString()}
                      </p>
                    )}
                    {donation.completedAt && (
                      <p className="text-blue-600 text-sm">
                        Completed: {new Date(donation.completedAt).toLocaleString()}
                      </p>
                    )}
                    
                    {donation.status === "Accepted" && (
                      <div className="mt-4">
                        <button
                          onClick={() => handleCompleteDonation(donation)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                        >
                          Mark as Completed
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Donation History */}
        {activeTab === "history" && (
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-600 mb-3 sm:mb-4">Donation History</h2>
            <DonationHistory userType="ngo" />
          </div>
        )}

        {/* Locations Map */}
        {activeTab === "map" && (
          <SimpleLocationsMap userType="restaurant" />
        )}

        <button
          onClick={handleLogout}
          className="mt-6 sm:mt-8 bg-red-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-600 text-sm sm:text-base w-full sm:w-auto"
        >
          Logout
        </button>
      </div>

      {/* Restaurant Location Modal */}
      {selectedRestaurant && (
        <RestaurantLocationModal
          restaurant={selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
        />
      )}

      {/* Rating and Review Modal */}
      {showRatingModal && selectedDonation && (
        <RatingReviewModal
          donation={selectedDonation}
          onSubmit={handleSubmitRating}
          onSkip={handleSkipRating}
          onClose={handleCloseRatingModal}
        />
      )}

      {/* Restaurant Reviews Modal */}
      {showReviewsModal && reviewsRestaurant && (
        <RestaurantReviewsModal
          restaurant={reviewsRestaurant}
          onClose={() => {
            setShowReviewsModal(false);
            setReviewsRestaurant(null);
          }}
        />
      )}

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default NGODashboard;
