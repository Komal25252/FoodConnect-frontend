import { useState, useEffect, useRef } from "react";

const LocationPicker = ({ onLocationSelect, initialLocation = null }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => {
        setError("Failed to load Google Maps");
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      try {
        if (!window.google || !window.google.maps) {
          setError("Google Maps not available");
          setIsLoading(false);
          return;
        }

        // Default to Delhi, India
        const defaultLocation = { lat: 28.6139, lng: 77.2090 };
        const center = selectedLocation || defaultLocation;

        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: center,
          zoom: 13,
        });

        const markerInstance = new window.google.maps.Marker({
          position: center,
          map: mapInstance,
          draggable: true,
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

        // If there's an initial location, get its address
        if (selectedLocation) {
          getAddressFromCoords(selectedLocation);
        }

      } catch (error) {
        console.error("Error initializing Google Maps:", error);
        setError("Error initializing map");
        setIsLoading(false);
      }
    };

    loadGoogleMaps();
  }, []);

  const updateLocation = async (location, markerInstance, mapInstance) => {
    markerInstance.setPosition(location);
    mapInstance.setCenter(location);
    setSelectedLocation(location);

    const addressText = await getAddressFromCoords(location);

    const locationData = {
      latitude: location.lat,
      longitude: location.lng,
      address: addressText
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
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
        <div className="text-red-600 text-center">
          <div className="font-medium">Map Error</div>
          <div className="text-sm">{error}</div>
          <div className="text-xs mt-2">Please check your Google Maps API key</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Select Location
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
      />

      {address && (
        <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
          <strong>Selected Address:</strong> {address}
        </div>
      )}

      <div className="text-xs text-gray-500">
        Click on the map or drag the marker to select a location
      </div>
    </div>
  );
};

export default LocationPicker;