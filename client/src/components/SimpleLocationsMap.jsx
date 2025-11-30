import { useState, useEffect, useRef } from "react";
import api from "../api";

const SimpleLocationsMap = ({ userType = "both" }) => {
  const mapRef = useRef(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  // Load map after locations are fetched
  useEffect(() => {
    if (!loading && locations.length >= 0) {
      loadMap();
    }
  }, [loading, locations]);

  const fetchLocations = async () => {
    try {
      console.log("Fetching locations...");

      const [ngoResponse, restaurantResponse] = await Promise.all([
        api.get("/auth/ngos").catch(() => ({ data: [] })),
        api.get("/auth/restaurants").catch(() => ({ data: [] }))
      ]);

      console.log("NGO data:", ngoResponse.data);
      console.log("Restaurant data:", restaurantResponse.data);

      const ngos = (ngoResponse.data || []).map(ngo => ({
        ...ngo,
        type: 'ngo',
        icon: '🏢'
      }));

      const restaurants = (restaurantResponse.data || []).map(restaurant => ({
        ...restaurant,
        type: 'restaurant',
        icon: '🍴'
      }));

      let allLocations = [];
      
      if (userType === "both") {
        allLocations = [...ngos, ...restaurants];
      } else if (userType === "ngo") {
        allLocations = [...ngos];
      } else if (userType === "restaurant") {
        allLocations = [...restaurants];
      }

      // Filter valid locations
      const validLocations = allLocations.filter(loc => {
        const isValid = loc.location &&
          loc.location.latitude &&
          loc.location.longitude &&
          !isNaN(parseFloat(loc.location.latitude)) &&
          !isNaN(parseFloat(loc.location.longitude));

        console.log(`Location ${loc.name}:`, isValid ? "✅ Valid" : "❌ Invalid", loc.location);
        return isValid;
      });

      console.log("Valid locations:", validLocations);
      setLocations(validLocations);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setError("Failed to load locations");
      setLoading(false);
    }
  };

  const loadMap = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setError("Google Maps API key not configured");
      return;
    }

    // Remove existing scripts
    const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
    existingScripts.forEach(script => script.remove());

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;

    script.onload = () => {
      setTimeout(initMap, 500);
    };

    script.onerror = () => {
      setError("Failed to load Google Maps");
    };

    document.head.appendChild(script);
  };

  const initMap = () => {
    try {
      if (!window.google || !window.google.maps || !mapRef.current) {
        setTimeout(initMap, 100);
        return;
      }

      console.log("Initializing map with", locations.length, "locations");

      // Default center
      let center = { lat: 28.6139, lng: 77.2090 };

      // Calculate center from locations
      if (locations.length > 0) {
        const avgLat = locations.reduce((sum, loc) => sum + parseFloat(loc.location.latitude), 0) / locations.length;
        const avgLng = locations.reduce((sum, loc) => sum + parseFloat(loc.location.longitude), 0) / locations.length;
        center = { lat: avgLat, lng: avgLng };
      }

      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: locations.length > 1 ? 10 : 13,
      });

      // Add markers for real locations
      console.log(`Adding ${locations.length} location markers`);
      locations.forEach((location, index) => {
        try {
          console.log(`Creating marker ${index + 1} for: ${location.name}`, {
            lat: location.location.latitude,
            lng: location.location.longitude,
            type: location.type
          });

          const marker = new window.google.maps.Marker({
            position: {
              lat: parseFloat(location.location.latitude),
              lng: parseFloat(location.location.longitude)
            },
            map: map,
            title: location.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: location.type === 'restaurant' ? '#10B981' : '#3B82F6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2
            }
          });

          // Simple info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 10px;">
                <h3 style="margin: 0; color: ${location.type === 'restaurant' ? '#10B981' : '#3B82F6'};">
                  ${location.icon} ${location.name}
                </h3>
                <p style="margin: 5px 0; text-transform: capitalize;">${location.type}</p>
                <p style="margin: 5px 0; font-size: 12px;">${location.location.address || 'Address not available'}</p>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          console.log(`✅ Marker created successfully for: ${location.name}`);
        } catch (error) {
          console.error(`❌ Failed to create marker for ${location.name}:`, error);
        }
      });

      console.log("Map initialization complete");
    } catch (error) {
      console.error("Map initialization error:", error);
      setError(`Map initialization failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">📍 Locations Map</h2>
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
          <div className="text-gray-500">Loading locations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">📍 Locations Map</h2>
      </div>

      {/* Map Container */}
      <div>
        <div
          ref={mapRef}
          className="w-full h-96 rounded-lg border border-gray-300"
        />
        <div className="mt-3 text-sm text-gray-600">
          <div className="flex items-center gap-4">
            {(userType === "both" || userType === "restaurant") && (
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span>Restaurants ({locations.filter(l => l.type === 'restaurant').length})</span>
              </div>
            )}
            {(userType === "both" || userType === "ngo") && (
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span>NGOs ({locations.filter(l => l.type === 'ngo').length})</span>
              </div>
            )}
          </div>
          <p className="mt-1">Click on markers to see details</p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}
    </div>
  );
};

export default SimpleLocationsMap;