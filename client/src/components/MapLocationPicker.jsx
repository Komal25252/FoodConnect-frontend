import { useState, useEffect, useRef } from "react";

const MapLocationPicker = ({ onLocationSelect, initialLocation = null }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [manualAddress, setManualAddress] = useState("");

  useEffect(() => {
    loadGoogleMaps();
  }, []);

  const loadGoogleMaps = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    console.log("Loading Google Maps with API Key:", apiKey?.substring(0, 10) + "...");
    
    if (!apiKey) {
      setError("Google Maps API key not found");
      setIsLoading(false);
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      console.log("Google Maps already loaded, initializing...");
      setTimeout(initMap, 100);
      return;
    }

    // Use the same simple approach as the working test
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    
    script.onload = () => {
      console.log("Google Maps script loaded successfully!");
      // Wait a bit for the API to be fully ready
      setTimeout(initMap, 300);
    };
    
    script.onerror = (e) => {
      console.error("Failed to load Google Maps script:", e);
      setError("Failed to load Google Maps. Please check your internet connection.");
      setIsLoading(false);
    };
    
    document.head.appendChild(script);
  };

  const initMap = () => {
    try {
      console.log("Initializing Google Maps...");
      
      if (!window.google || !window.google.maps) {
        console.error("Google Maps API not available");
        setError("Google Maps API not loaded properly");
        setIsLoading(false);
        return;
      }

      if (!mapRef.current) {
        console.log("Map container not ready, waiting...");
        setTimeout(initMap, 100);
        return;
      }

      console.log("Creating map instance...");
      
      // Default location (Delhi, India)
      const defaultLocation = { lat: 28.6139, lng: 77.2090 };
      const center = selectedLocation || defaultLocation;
      
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
      });

      const markerInstance = new window.google.maps.Marker({
        position: center,
        map: mapInstance,
        draggable: true,
        title: "Click and drag to select location"
      });

      // Add click listener to map
      mapInstance.addListener("click", (event) => {
        const location = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
        updateLocation(location, markerInstance, mapInstance);
      });

      // Add drag listener to marker
      markerInstance.addListener("dragend", (event) => {
        const location = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
        updateLocation(location, markerInstance, mapInstance);
      });

      setMap(mapInstance);
      setMarker(markerInstance);
      setIsLoading(false);
      
      console.log("Google Maps initialized successfully!");

      // Get initial address if location is set
      if (selectedLocation) {
        getAddressFromCoords(selectedLocation);
      }

    } catch (error) {
      console.error("Error initializing Google Maps:", error);
      setError(`Map initialization failed: ${error.message}`);
      setIsLoading(false);
    }
  };

  const updateLocation = async (location, markerInstance, mapInstance) => {
    markerInstance.setPosition(location);
    mapInstance.setCenter(location);
    setSelectedLocation(location);
    
    const addressText = await getAddressFromCoords(location);
    
    const locationData = {
      latitude: location.lat,
      longitude: location.lng,
      address: addressText || manualAddress
    };
    
    onLocationSelect(locationData);
  };

  const getAddressFromCoords = async (location) => {
    try {
      if (!window.google || !window.google.maps) return "";
      
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({
        location: { lat: location.lat, lng: location.lng }
      });
      
      if (response.results[0]) {
        const addressText = response.results[0].formatted_address;
        setAddress(addressText);
        setManualAddress(addressText);
        return addressText;
      }
    } catch (error) {
      console.error("Error getting address:", error);
    }
    return "";
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          if (map && marker) {
            updateLocation(location, marker, map);
          }
        },
        (error) => {
          console.error("Error getting current location:", error);
          alert("Unable to get your current location. Please click on the map to select.");
        }
      );
    }
  };

  const handleManualAddressChange = (e) => {
    const newAddress = e.target.value;
    setManualAddress(newAddress);
    
    // Update location data with manual address
    onLocationSelect({
      latitude: selectedLocation?.lat || null,
      longitude: selectedLocation?.lng || null,
      address: newAddress
    });
  };

  const skipMap = () => {
    setError("Map skipped - using manual entry");
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">
            Select Location
          </label>
          <button
            type="button"
            onClick={skipMap}
            className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
          >
            Skip Map
          </button>
        </div>
        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 mb-2">Loading Google Maps...</div>
            <div className="text-xs text-gray-400">This may take a few seconds</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
        
        <div className="w-full h-64 bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
          <div className="text-red-600 text-center p-4">
            <div className="font-medium">Map Unavailable</div>
            <div className="text-sm mt-1">{error}</div>
            <div className="text-xs mt-2">Please enter address manually below</div>
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Address *
          </label>
          <textarea
            value={manualAddress}
            onChange={handleManualAddressChange}
            placeholder="Enter your complete address..."
            className="w-full p-3 border rounded-lg resize-none"
            rows="3"
            required
          />
        </div>
        
        <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded">
          <strong>Note:</strong> To enable the interactive map, please configure a valid Google Maps API key.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Select Location on Map
        </label>
        <button
          type="button"
          onClick={getCurrentLocation}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Use Current Location
        </button>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-lg border border-gray-300 shadow-sm"
        style={{ minHeight: '256px', width: '100%' }}
      />
      
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Address
        </label>
        <textarea
          value={manualAddress}
          onChange={handleManualAddressChange}
          placeholder="Address will appear here when you select a location on the map..."
          className="w-full p-3 border rounded-lg resize-none"
          rows="2"
        />
      </div>
      
      {selectedLocation && (
        <div className="text-xs text-gray-500 bg-green-50 p-2 rounded">
          <strong>Coordinates:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        Click on the map or drag the red marker to select your location
      </div>
    </div>
  );
};

export default MapLocationPicker;