import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";
import WorkingLocationPicker from "../../components/WorkingLocationPicker";
import GoogleLoginButton from "../../components/GoogleLoginButton";

const RegisterRestaurant = () => {
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    phone: "",
    password: "",
    location: null
  });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLocationSelect = (locationData) => {
    setFormData({ ...formData, location: locationData });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.location) {
      toast.error("Please select a location for your restaurant");
      return;
    }

    console.log("Submitting restaurant registration with data:", formData);

    try {
      const response = await api.post("/auth/register-restaurant", formData);
      console.log("Registration response:", response.data);
      toast.success("Restaurant registered successfully! Please login.");
      navigate("/login-restaurant");
    } catch (error) {
      console.error("Registration error:", error.response?.data);
      toast.error(error.response?.data?.message || "Registration failed!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-lg w-full max-w-2xl">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-green-600 mb-4 sm:mb-6">Restaurant Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <input 
              type="text" 
              name="name" 
              placeholder="Restaurant Name" 
              className="w-full p-2.5 sm:p-3 border rounded-lg text-sm sm:text-base" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              className="w-full p-2.5 sm:p-3 border rounded-lg text-sm sm:text-base" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <input 
            type="tel" 
            name="phone" 
            placeholder="Phone Number (Optional)" 
            className="w-full p-2.5 sm:p-3 border rounded-lg text-sm sm:text-base" 
            value={formData.phone} 
            onChange={handleChange} 
          />
          
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            className="w-full p-2.5 sm:p-3 border rounded-lg text-sm sm:text-base" 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />
          
          <WorkingLocationPicker onLocationSelect={handleLocationSelect} />
          
          <button 
            type="submit" 
            className="w-full bg-green-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            Register Restaurant
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google Login */}
        <div className="space-y-3">
          <p className="text-center text-sm text-gray-600 mb-3">
            Register with Google
          </p>
          <GoogleLoginButton role="restaurant" isRegister={true} />
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login-restaurant')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterRestaurant;
