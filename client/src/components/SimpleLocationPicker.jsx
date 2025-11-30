import { useState } from "react";

const SimpleLocationPicker = ({ onLocationSelect, initialLocation = null }) => {
  const [address, setAddress] = useState(initialLocation?.address || "");
  const [coordinates, setCoordinates] = useState({
    latitude: initialLocation?.latitude || "",
    longitude: initialLocation?.longitude || ""
  });

  const handleAddressChange = (e) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    
    // Send location data to parent
    onLocationSelect({
      latitude: coordinates.latitude || null,
      longitude: coordinates.longitude || null,
      address: newAddress
    });
  };

  const handleCoordinateChange = (field, value) => {
    const newCoordinates = { ...coordinates, [field]: value };
    setCoordinates(newCoordinates);
    
    // Send location data to parent
    onLocationSelect({
      latitude: parseFloat(newCoordinates.latitude) || null,
      longitude: parseFloat(newCoordinates.longitude) || null,
      address: address
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setCoordinates({
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6)
          });
          
          // Try to get address using reverse geocoding (if available)
          // For now, just set coordinates
          onLocationSelect({
            latitude: lat,
            longitude: lng,
            address: address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          });
        },
        (error) => {
          console.error("Error getting current location:", error);
          alert("Unable to get your current location. Please enter manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Location Information
        </label>
        <button
          type="button"
          onClick={getCurrentLocation}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Use Current Location
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Address *
          </label>
          <textarea
            value={address}
            onChange={handleAddressChange}
            placeholder="Enter your complete address..."
            className="w-full p-3 border rounded-lg resize-none"
            rows="3"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Latitude (optional)
            </label>
            <input
              type="number"
              step="any"
              value={coordinates.latitude}
              onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
              placeholder="28.6139"
              className="w-full p-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Longitude (optional)
            </label>
            <input
              type="number"
              step="any"
              value={coordinates.longitude}
              onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
              placeholder="77.2090"
              className="w-full p-2 border rounded text-sm"
            />
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
        <strong>Note:</strong> Enter your complete address above. You can optionally provide coordinates for more precise location, or click "Use Current Location" to auto-fill coordinates.
      </div>
    </div>
  );
};

export default SimpleLocationPicker;