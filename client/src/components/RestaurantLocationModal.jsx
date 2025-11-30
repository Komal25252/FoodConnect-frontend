import { useEffect, useRef, useState } from "react";

const RestaurantLocationModal = ({ restaurant, onClose }) => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (restaurant && restaurant.location) {
      loadGoogleMaps();
    }
  }, [restaurant]);

  const loadGoogleMaps = () => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setTimeout(initMap, 100);
      return;
    }

    // Load Google Maps script
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error("Google Maps API key not configured");
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        setTimeout(initMap, 100);
      });
      return;
    }

    // Load the script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    
    script.onload = () => {
      setTimeout(initMap, 200);
    };
    
    script.onerror = () => {
      console.error("Failed to load Google Maps");
    };
    
    document.head.appendChild(script);
  };

  const initMap = () => {
    if (!window.google || !window.google.maps || !mapRef.current) {
      setTimeout(initMap, 100);
      return;
    }

    if (!restaurant.location || !restaurant.location.latitude || !restaurant.location.longitude) {
      console.error("Restaurant location data is missing");
      return;
    }

    const location = {
      lat: parseFloat(restaurant.location.latitude),
      lng: parseFloat(restaurant.location.longitude)
    };

    const map = new window.google.maps.Map(mapRef.current, {
      center: location,
      zoom: 15,
    });

    const marker = new window.google.maps.Marker({
      position: location,
      map: map,
      title: restaurant.name,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 15,
        fillColor: '#10B981',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      }
    });

    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 10px;">
          <h3 style="margin: 0; color: #10B981;">🍴 ${restaurant.name}</h3>
          <p style="margin: 5px 0; font-size: 12px;">${restaurant.location.address || 'Address not available'}</p>
        </div>
      `
    });

    infoWindow.open(map, marker);
    setMapLoaded(true);
    console.log("Map loaded successfully for restaurant:", restaurant.name);
  };

  if (!restaurant) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-green-600">📍 Restaurant Location</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-3">
            <h3 className="font-semibold text-lg">{restaurant.name}</h3>
            {restaurant.location && restaurant.location.address && (
              <p className="text-gray-600 text-sm mt-1">{restaurant.location.address}</p>
            )}
          </div>
          
          {!mapLoaded && (
            <div className="w-full h-96 rounded-lg border border-gray-300 bg-gray-100 flex items-center justify-center">
              <div className="text-gray-500">Loading map...</div>
            </div>
          )}
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-lg border border-gray-300"
            style={{ display: mapLoaded ? 'block' : 'none' }}
          />
          
          <div className="mt-3 text-sm text-gray-600">
            <p>📍 Click on the marker for more details</p>
            {restaurant.location && (
              <p className="text-xs mt-1">
                Coordinates: {restaurant.location.latitude}, {restaurant.location.longitude}
              </p>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantLocationModal;