import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api';
import WorkingLocationPicker from '../../components/WorkingLocationPicker';

const AddLocation = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user || JSON.parse(localStorage.getItem('user'));
  
  const [locationData, setLocationData] = useState(null);
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleLocationSelect = (location) => {
    setLocationData(location);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!locationData) {
      toast.error('Please select your location on the map');
      return;
    }

    setLoading(true);
    try {
      // Update user profile with location
      const response = await api.post('/auth/update-location', {
        userId: user.id,
        location: locationData,
        phone: phone
      });

      // Update local storage with response from backend
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success('Location added successfully!');
      
      // Navigate to appropriate dashboard
      if (role === 'ngo') {
        navigate('/ngo-dashboard');
      } else {
        navigate('/restaurant-dashboard');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error(error.response?.data?.message || 'Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Welcome, {user?.name}! Please add your location to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phone Number (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Location Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Location <span className="text-red-500">*</span>
            </label>
            <WorkingLocationPicker onLocationSelect={handleLocationSelect} />
            {!locationData && (
              <p className="text-xs text-red-500 mt-1">
                Location is required to complete registration
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !locationData}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              loading || !locationData
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Saving...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddLocation;