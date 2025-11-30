import { useState, useEffect, useRef } from "react";

const WorkingLocationPicker = ({ onLocationSelect, initialLocation = null }) => {
  const mapRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [address, setAddress] = useState(initialLocation?.address || "");
  const [coordinates, setCoordinates] = useState({
    latitude: initialLocation?.latitude || "",
    longitude: initialLocation?.longitude || ""
  });
  const [showMap, setShowMap] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Always call the callback when data changes
  useEffect(() => {
    const locationData = {
      latitude: coordinates.latitude ? parseFloat(coordinates.latitude) : null,
      longitude: coordinates.longitude ? parseFloat(coordinates.longitude) : null,
      address: address
    };
    console.log("WorkingLocationPicker sending location data:", locationData);
    onLocationSelect(locationData);
  }, [address, coordinates.latitude, coordinates.longitude]);

  // Auto-load map when component mounts
  useEffect(() => {
    loadGoogleMap();
  }, []);

  const loadGoogleMap = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("Google Maps API key not configured");
      return;
    }

    // Clean up existing scripts
    const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
    existingScripts.forEach(script => script.remove());

    // Load Google Maps
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;

    script.onload = () => {
      setTimeout(() => {
        if (window.google && window.google.maps && mapRef.current) {
          initMap();
        }
      }, 500);
    };

    script.onerror = () => {
      console.error("Failed to load Google Maps");
      setMapLoaded(false);
    };

    document.head.appendChild(script);
  };

  const initMap = () => {
    try {
      const defaultLocation = { lat: 28.6139, lng: 77.2090 };
      const center = selectedLocation ?
        { lat: selectedLocation.latitude, lng: selectedLocation.longitude } :
        defaultLocation;

      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
      });

      const marker = new window.google.maps.Marker({
        position: center,
        map: map,
        draggable: true,
        title: "Drag me or click on map to set your location",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#EF4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      // Map click - allow user to click anywhere to set location
      map.addListener("click", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        marker.setPosition({ lat, lng });
        updateLocationFromMap(lat, lng);
      });

      // Marker drag
      marker.addListener("dragend", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        updateLocationFromMap(lat, lng);
      });

      setMapLoaded(true);
    } catch (error) {
      console.error("Map init error:", error);
      alert("Map initialization failed");
      setShowMap(false);
    }
  };

  const updateLocationFromMap = async (lat, lng) => {
    setCoordinates({
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    });

    // Try to get address
    try {
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        const result = await geocoder.geocode({ location: { lat, lng } });
        if (result.results && result.results[0]) {
          const detectedAddress = result.results[0].formatted_address;
          // Only update address if it's empty, otherwise let user keep their custom address
          if (!address.trim()) {
            setAddress(detectedAddress);
          }
        }
      }
    } catch (error) {
      console.log("Geocoding failed");
      // Don't overwrite user's address on geocoding failure
    }
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

          // Update map marker if map is loaded
          if (window.google && window.google.maps && mapRef.current) {
            // Try to update existing marker or create new one
            updateLocationFromMap(lat, lng);
          }
        },
        (error) => {
          console.error("Could not get your location:", error);
        }
      );
    }
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
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
          📍 Use My Current Location
        </button>
      </div>

      {/* Address Input */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Address * {coordinates.latitude && coordinates.longitude && (
            <span className="text-green-600 text-xs">
              (📍 Location set: {coordinates.latitude}, {coordinates.longitude})
            </span>
          )}
        </label>
        <textarea
          value={address}
          onChange={handleAddressChange}
          placeholder="Enter your complete address... You can also click on the map below to set your precise location."
          className="w-full p-3 border rounded-lg resize-none"
          rows="3"
          required
        />
        <div className="text-xs text-gray-500 mt-1">
          💡 Tip: Enter your address above, then use the map below to pinpoint your exact location for better accuracy.
        </div>
      </div>



      {/* Map Container */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          📍 Pinpoint Your Location on Map {mapLoaded && "✅"}
        </label>
        {showMap ? (
          <div>
            <div
              ref={mapRef}
              className="w-full h-64 rounded-lg border border-gray-300 shadow-sm"
              style={{ minHeight: '256px' }}
            />
            <div className="text-xs text-gray-500 mt-2 bg-blue-50 p-2 rounded">
              <strong>How to use:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Click anywhere on the map to set your location</li>
                <li>• Drag the red marker to adjust your position</li>
                <li>• Your coordinates will be automatically saved</li>
                <li>• Make sure your address above matches your map location</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="w-full h-64 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <div className="text-lg mb-2">🗺️</div>
              <div>Loading interactive map...</div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
};

export default WorkingLocationPicker;