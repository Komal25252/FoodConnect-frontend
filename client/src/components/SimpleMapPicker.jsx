import { useState, useEffect, useRef } from "react";

const SimpleMapPicker = ({ onLocationSelect, initialLocation = null }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Try to load Google Maps with a simpler approach
    loadMap();
  }, []);

  const loadMap = async () => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setError("No API key configured");
      setIsLoading(false);
      return;
    }

    try {
      // Clean up any existing scripts first
      const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      existingScripts.forEach(script => script.remove());
      
      // Check if already loaded
      if (window.google && window.google.maps) {
        console.log("Google Maps already available, initializing...");
        initializeMap();
        return;
      }

      console.log("Loading Google Maps script...");
      
      // Load script without callback - same as working test
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      
      let loaded = false;
      
      script.onload = () => {
        if (!loaded) {
          loaded = true;
          console.log("Google Maps script loaded successfully!");
          // Wait a bit for the API to be fully ready
          setTimeout(initializeMap, 300);
        }
      };

      script.onerror = () => {
        setError("Failed to load Google Maps. Check your API key and internet connection.");
        setIsLoading(false);
      };

      document.head.appendChild(script);

      // Fallback timeout
      setTimeout(() => {
        if (!loaded && isLoading) {
          setError("Google Maps loading timeout. Please try refreshing the page.");
          setIsLoading(false);
        }
      }, 8000);

    } catch (error) {
      setError(`Error loading map: ${error.message}`);
      setIsLoading(false);
    }
  };

  const initializeMap = () => {
    try {
      if (!window.google || !window.google.maps) {
        throw new Error("Google Maps API not available");
      }

      if (!mapRef.current) {
        setTimeout(initializeMap, 100);
        return;
      }

      const defaultLocation = { lat: 28.6139, lng: 77.2090 }; // Delhi
      const center = selectedLocation || defaultLocation;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 13,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      const markerInstance = new window.google.maps.Marker({
        position: center,
        map: mapInstance,
        draggable: true,
        title: "Drag to select location",
      });

      // Map click handler
      mapInstance.addListener("click", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        updateLocation({ lat, lng }, markerInstance, mapInstance);
      });

      // Marker drag handler
      markerInstance.addListener("dragend", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        updateLocation({ lat, lng }, markerInstance, mapInstance);
      });

      setMap(mapInstance);
      setMarker(markerInstance);
      setIsLoading(false);

      // Initial location callback
      if (selectedLocation) {
        onLocationSelect({
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          address: address || `${selectedLocation.lat}, ${selectedLocation.lng}`
        });
      }

    } catch (error) {
      console.error("Map initialization error:", error);
      setError(`Map initialization failed: ${error.message}`);
      setIsLoading(false);
    }
  };

  const updateLocation = (location, markerInstance, mapInstance) => {
    markerInstance.setPosition(location);
    mapInstance.setCenter(location);
    setSelectedLocation(location);

    // Try to get address
    getAddress(location);

    // Always call the callback with coordinates
    onLocationSelect({
      latitude: location.lat,
      longitude: location.lng,
      address: address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
    });
  };

  const getAddress = async (location) => {
    try {
      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        const result = await geocoder.geocode({ location });
        
        if (result.results && result.results[0]) {
          const addressText = result.results[0].formatted_address;
          setAddress(addressText);
          
          // Update with the real address
          onLocationSelect({
            latitude: location.lat,
            longitude: location.lng,
            address: addressText
          });
        }
      }
    } catch (error) {
      console.log("Geocoding failed:", error);
      // Not critical, we still have coordinates
    }
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
          alert("Could not get your location. Please click on the map to select.");
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">
            Loading Map...
          </label>
        </div>
        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">Loading Google Maps...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">
            Location (Map Unavailable)
          </label>
          <button
            type="button"
            onClick={getCurrentLocation}
            className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Get Current Location
          </button>
        </div>
        
        <div className="w-full h-32 bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
          <div className="text-red-600 text-center text-sm">
            <div>Map Error: {error}</div>
            <div className="text-xs mt-1">Please enter address manually below</div>
          </div>
        </div>
        
        <textarea
          placeholder="Enter your complete address..."
          className="w-full p-3 border rounded-lg resize-none"
          rows="3"
          onChange={(e) => {
            onLocationSelect({
              latitude: null,
              longitude: null,
              address: e.target.value
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
        className="w-full h-64 rounded-lg border border-gray-300"
        style={{ minHeight: '256px' }}
      />
      
      {selectedLocation && (
        <div className="text-xs text-gray-500 bg-green-50 p-2 rounded">
          <strong>Selected:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          {address && <div><strong>Address:</strong> {address}</div>}
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        Click on the map or drag the marker to select your location
      </div>
    </div>
  );
};

export default SimpleMapPicker;