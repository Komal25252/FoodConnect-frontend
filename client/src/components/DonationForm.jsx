import { useState } from "react";
import { toast } from "react-toastify";
import api from "../api";

const DonationForm = ({ onDonationAdded }) => {
  const [formData, setFormData] = useState({
    foodType: "",
    quantity: "",
    expiryTime: "",
    pickupLocation: "",
    preferredOption: "NGO Pickup"
  });

  const [errors, setErrors] = useState({
    foodType: "",
    quantity: "",
    pickupLocation: "",
    expiryTime: ""
  });

  const [loading, setLoading] = useState(false);

  const restaurant = JSON.parse(localStorage.getItem("user") || "{}");

  useState(() => {
    if (restaurant && restaurant.address) {
      setFormData(prev => ({
        ...prev,
        pickupLocation: restaurant.address
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field-specific error when user types
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const { foodType, quantity, pickupLocation, expiryTime } = formData;
    let newErrors = {};

    const foodTypePattern = /^[a-zA-Z\s]+$/;
    const quantityPattern = /^[0-9]+(\s?(kg|g|plate|plates|serving|servings|ltr|litre|litres)?)$/i;
    const pickupPattern = /^[a-zA-Z0-9\s,.-]{5,}$/;

    if (!foodTypePattern.test(foodType)) {
      newErrors.foodType = "Only alphabets allowed (e.g., Rice, Bread, Curry)";
    }

    if (!quantityPattern.test(quantity)) {
      newErrors.quantity = "Use proper format (e.g., 5kg, 2 plates, 10 servings)";
    }

    if (!pickupPattern.test(pickupLocation)) {
      newErrors.pickupLocation = "Enter a valid pickup address";
    }

    if (!expiryTime) {
      newErrors.expiryTime = "Expiry time is required";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please correct the highlighted errors");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post("/donations/create", formData);
      toast.success("Donation added successfully!");
      setFormData({
        foodType: "",
        quantity: "",
        expiryTime: "",
        pickupLocation: restaurant.address || "",
        preferredOption: "NGO Pickup"
      });
      setErrors({});
      if (onDonationAdded) {
        onDonationAdded(response.data.donation);
      }
    } catch (error) {
      console.error("Error adding donation:", error);
      toast.error(error.response?.data?.message || "Failed to add donation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-semibold text-green-600 mb-3 sm:mb-4">
        Add New Donation
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Food Type */}
        <div className="mb-3 sm:mb-4">
          <label
            htmlFor="foodType"
            className="block text-gray-700 text-xs sm:text-sm font-bold mb-1.5 sm:mb-2"
          >
            Food Type
          </label>
          <input
            type="text"
            id="foodType"
            name="foodType"
            value={formData.foodType}
            onChange={handleChange}
            placeholder="e.g., Rice, Bread, Curry"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-sm sm:text-base text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.foodType ? "border-red-500" : ""
              }`}
            required
          />
          {errors.foodType && (
            <p className="text-red-500 text-xs italic mt-1">{errors.foodType}</p>
          )}
        </div>

        {/* Quantity */}
        <div className="mb-3 sm:mb-4">
          <label
            htmlFor="quantity"
            className="block text-gray-700 text-xs sm:text-sm font-bold mb-1.5 sm:mb-2"
          >
            Quantity
          </label>
          <input
            type="text"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="e.g., 5 servings, 2kg"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-sm sm:text-base text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.quantity ? "border-red-500" : ""
              }`}
            required
          />
          {errors.quantity && (
            <p className="text-red-500 text-xs italic mt-1">{errors.quantity}</p>
          )}
        </div>

        {/* Expiry Time */}
        <div className="mb-3 sm:mb-4">
          <label
            htmlFor="expiryTime"
            className="block text-gray-700 text-xs sm:text-sm font-bold mb-1.5 sm:mb-2"
          >
            Expiry Time
          </label>
          <input
            type="datetime-local"
            id="expiryTime"
            name="expiryTime"
            value={formData.expiryTime}
            onChange={handleChange}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-sm sm:text-base text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.expiryTime ? "border-red-500" : ""
              }`}
            required
          />
          {errors.expiryTime && (
            <p className="text-red-500 text-xs italic mt-1">{errors.expiryTime}</p>
          )}
        </div>

        {/* Pickup Location */}
        <div className="mb-3 sm:mb-4">
          <label
            htmlFor="pickupLocation"
            className="block text-gray-700 text-xs sm:text-sm font-bold mb-1.5 sm:mb-2"
          >
            Pickup Location
          </label>
          <input
            type="text"
            id="pickupLocation"
            name="pickupLocation"
            value={formData.pickupLocation}
            onChange={handleChange}
            placeholder="Full address"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-sm sm:text-base text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.pickupLocation ? "border-red-500" : ""
              }`}
            required
          />
          {errors.pickupLocation && (
            <p className="text-red-500 text-xs italic mt-1">
              {errors.pickupLocation}
            </p>
          )}
        </div>

        {/* Preferred Option */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1.5 sm:mb-2">
            Preferred Option
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="preferredOption"
                value="NGO Pickup"
                checked={formData.preferredOption === "NGO Pickup"}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-green-600"
              />
              <span className="ml-2 text-sm sm:text-base text-gray-700">NGO Pickup</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="preferredOption"
                value="Restaurant Delivery"
                checked={formData.preferredOption === "Restaurant Delivery"}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-green-600"
              />
              <span className="ml-2 text-sm sm:text-base text-gray-700">Restaurant Delivery</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 sm:px-6 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out text-sm sm:text-base"
          >
            {loading ? "Adding..." : "Add Donation"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DonationForm;
