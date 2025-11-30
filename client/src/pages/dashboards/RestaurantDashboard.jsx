import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DonationForm from "../../components/DonationForm";
import SimpleLocationsMap from "../../components/SimpleLocationsMap";
import NGOLocationModal from "../../components/NGOLocationModal";
import ChatWidget from "../../components/ChatWidget";
import DonationHistory from "../../components/DonationHistory";
import api from "../../api";

const RestaurantDashboard = () => {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("addDonation");
  const [selectedNGO, setSelectedNGO] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("Please login first!");
      navigate("/restaurant-login");
    } else {
      setRestaurant(JSON.parse(storedUser));
      initializeRestaurant();
    }
  }, [navigate]);

  const initializeRestaurant = async () => {
    try {
      // Ensure restaurant profile exists
      await api.post("/donations/migrate-user");
      fetchDonations();
    } catch (error) {
      console.error("Error initializing restaurant:", error);
      fetchDonations(); // Try to fetch anyway
    }
  };

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const response = await api.get("/donations/requests");
      setDonations(response.data.donations || []);
    } catch (error) {
      console.error("Error fetching donations:", error);
      toast.error("Failed to load donations");
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

  if (!restaurant) return null;

  const handleDonationAdded = (newDonation) => {
    fetchDonations();
    setActiveTab("requests");
  };

  const handleAcceptRequest = async (donationId) => {
    try {
      await api.post(`/donations/accept/${donationId}`);
      toast.success("Request accepted successfully!");
      fetchDonations();
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept request");
    }
  };

  const handleRejectRequest = async (donationId) => {
    try {
      await api.post(`/donations/reject/${donationId}`);
      toast.success("Request rejected successfully!");
      fetchDonations();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
      <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          {restaurant.avatar && (
            <img 
              src={restaurant.avatar} 
              alt={restaurant.name}
              className="w-12 h-12 rounded-full border-2 border-green-200"
            />
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-green-600">
            Welcome, {restaurant.name} 🍴
          </h1>
        </div>
        <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
          This is your Restaurant dashboard. From here, you can manage food
          donations, view NGO requests, and track your impact.
        </p>

        {/* Contact Details Card */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2">Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <span className="text-green-600">📧</span>
              <span className="text-gray-700">Email: {restaurant.email}</span>
            </div>
            {restaurant.phone && (
              <div className="flex items-center gap-2">
                <span className="text-green-600">📱</span>
                <span className="text-gray-700">Phone: {restaurant.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b mb-4 sm:mb-6 -mx-4 sm:mx-0 px-4 sm:px-0">
          <button
            className={`py-2 px-3 sm:px-4 font-medium text-sm sm:text-base whitespace-nowrap ${activeTab === "addDonation"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-500 hover:text-green-500"
              }`}
            onClick={() => setActiveTab("addDonation")}
          >
            Add Donation
          </button>
          <button
            className={`py-2 px-3 sm:px-4 font-medium text-sm sm:text-base whitespace-nowrap ${activeTab === "requests"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-500 hover:text-green-500"
              }`}
            onClick={() => setActiveTab("requests")}
          >
            Requests {donations.length > 0 && `(${donations.length})`}
          </button>
          <button
            className={`py-2 px-3 sm:px-4 font-medium text-sm sm:text-base whitespace-nowrap ${activeTab === "history"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-500 hover:text-green-500"
              }`}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
          <button
            className={`py-2 px-3 sm:px-4 font-medium text-sm sm:text-base whitespace-nowrap ${activeTab === "map"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-500 hover:text-green-500"
              }`}
            onClick={() => setActiveTab("map")}
          >
            Map
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "addDonation" && (
          <DonationForm onDonationAdded={handleDonationAdded} />
        )}

        {activeTab === "requests" && (
          <div className="bg-white rounded-lg">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-600 mb-3 sm:mb-4">NGO Requests</h2>

            {loading ? (
              <p className="text-gray-500 text-sm sm:text-base">Loading requests...</p>
            ) : donations.length === 0 ? (
              <p className="text-gray-500 text-sm sm:text-base">No pending requests at the moment.</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {donations.map((donation) => (
                  <div key={donation._id} className="border rounded-lg p-3 sm:p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base sm:text-lg">{donation.foodType}</h3>
                        <p className="text-sm sm:text-base text-gray-600">Quantity: {donation.quantity}</p>
                        <p className="text-sm sm:text-base text-gray-600">
                          Expiry: {new Date(donation.expiryTime).toLocaleString()}
                        </p>
                        <p className="text-sm sm:text-base text-gray-600">
                          Requested by: {donation.requestedBy?.name || "Unknown NGO"}
                        </p>
                        <p className="text-sm sm:text-base text-gray-600">
                          Requested at: {new Date(donation.requestedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex sm:flex-col gap-2">
                        <button
                          onClick={() => handleAcceptRequest(donation._id)}
                          className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded text-sm sm:text-base"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(donation._id)}
                          className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded text-sm sm:text-base"
                        >
                          Reject
                        </button>
                        {donation.requestedBy && (
                          <button
                            onClick={() => setSelectedNGO(donation.requestedBy)}
                            className="flex-1 sm:flex-none bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded flex items-center justify-center gap-1 text-sm sm:text-base"
                          >
                            📍 Location
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Donation History */}
        {activeTab === "history" && (
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-green-600 mb-3 sm:mb-4">Donation History</h2>
            <DonationHistory userType="restaurant" />
          </div>
        )}

        {/* Locations Map */}
        {activeTab === "map" && (
          <SimpleLocationsMap userType="ngo" />
        )}

        <button
          onClick={handleLogout}
          className="mt-6 sm:mt-8 bg-red-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-600 text-sm sm:text-base w-full sm:w-auto"
        >
          Logout
        </button>
      </div>

      {/* NGO Location Modal */}
      {selectedNGO && (
        <NGOLocationModal
          ngo={selectedNGO}
          onClose={() => setSelectedNGO(null)}
        />
      )}

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default RestaurantDashboard;
