import { useState, useEffect, useRef } from "react";
import api from "../api";

const LocationsMap = ({ userType = "both" }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetchLocations();
    // Auto-load the map when component mounts
    loadGoogleMap();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      
      // Fetch both NGOs and restaurants
      const [ngoResponse, restaurantResponse] = await Promise.all([
        api.get("/auth/ngos").catch(() => ({ data: [] })),
        api.get("/auth/restaurants").catch(() => ({ data: [] }))
      ]);

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
      
      if (userType === "both" || userType === "ngo") {
        allLocations = [...allLocations, ...ngos];
      }
      
      if (userType === "both" || userType === "restaurant") {
        allLocations = [...allLocations, ...restaurants];
      }

      // Filter locations that have valid coordinates
      console.log("All locations before filtering:", allLocations);
      
      const validLocations = allLocations.filter(loc => {
        console.log("Checking location for:", loc.name, "Location data:", loc.location);
        
        const hasValidLocation = loc.location && 
          loc.location.latitude && 
          loc.location.longitude &&
          !isNaN(loc.location.latitude) &&
          !isNaN(loc.location.longitude);
        
        console.log("Is valid location?", hasValidLocation, "for", loc.name);
        
        return hasValidLocation;
      });
      
      console.log("Valid locations after filtering:", validLocations);

      setLocations(validLocations);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setError("Failed to load locations");
      setLoading(false);
    }
  };

  const loadGoogleMap = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setError("Google Maps API key not configured");
      return;
    }

    setShowMap(true);

    // Clean up existing scripts
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
      setShowMap(false);
    };
    
    document.head.appendChild(script);
  };

  const initMap = () => {
    try {
      if (!window.google || !window.google.maps || !mapRef.current) {
        setTimeout(initMap, 100);
        return;
      }

      // Default center (Delhi, India)
      let center = { lat: 28.6139, lng: 77.2090 };
      
      // If we have locations, center on the first one or calculate center
      if (locations.length > 0) {
        if (locations.length === 1) {
          center = {
            lat: locations[0].location.latitude,
            lng: locations[0].location.longitude
          };
        } else {
          // Calculate center of all locations
          const avgLat = locations.reduce((sum, loc) => sum + loc.location.latitude, 0) / locations.length;
          const avgLng = locations.reduce((sum, loc) => sum + loc.location.longitude, 0) / locations.length;
          center = { lat: avgLat, lng: avgLng };
        }
      }

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: locations.length > 1 ? 10 : 13,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });

      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));
      const newMarkers = [];

      // Add markers for each location
      console.log("Creating markers for", locations.length, "locations");
      
      locations.forEach((location, index) => {
        console.log(`Creating marker ${index + 1}:`, {
          name: location.name, 
          type: location.type,
          lat: location.location.latitude,
          lng: location.location.longitude,
          location: location.location
        });
        
        try {
          const marker = new window.google.maps.Marker({
            position: {
              lat: parseFloat(location.location.latitude),
              lng: parseFloat(location.location.longitude)
            },
            map: mapInstance,
            title: location.name,
            // Use simple default markers first to test
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 15,
              fillColor: location.type === 'restaurant' ? '#10B981' : '#3B82F6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3
            }
          });
          
          console.log("✅ Marker created successfully for:", location.name);
          
          newMarkers.push(marker);
        } catch (error) {
          console.error("❌ Failed to create marker for:", location.name, error);
        }

        // Info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-3">
              <h3 class="font-bold text-lg ${location.type === 'restaurant' ? 'text-green-600' : 'text-blue-600'}">${location.icon} ${location.name}</h3>
              <p class="text-gray-600 capitalize">${location.type}</p>
              <p class="text-gray-600 text-sm mt-1">${location.location.address || 'Address not available'}</p>
              <p class="text-gray-500 text-xs mt-2">📧 ${location.email}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          // Close all other info windows
          newMarkers.forEach(m => m.infoWindow && m.infoWindow.close());
          infoWindow.open(mapInstance, marker);
        });

          // Info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="p-3">
                <h3 class="font-bold text-lg ${location.type === 'restaurant' ? 'text-green-600' : 'text-blue-600'}">${location.icon} ${location.name}</h3>
                <p class="text-gray-600 capitalize">${location.type}</p>
                <p class="text-gray-600 text-sm mt-1">${location.location.address || 'Address not available'}</p>
                <p class="text-gray-500 text-xs mt-2">📧 ${location.email}</p>
              </div>
            `
          });

          marker.addListener('click', () => {
            // Close all other info windows
            newMarkers.forEach(m => m.infoWindow && m.infoWindow.close());
            infoWindow.open(mapInstance, marker);
          });

          marker.infoWindow = infoWindow;
        } catch (error) {
          console.error("❌ Failed to create info window for:", location.name, error);
        }
      });





      setMarkers(newMarkers);
      setMap(mapInstance);
      
      console.log("Map initialized with", newMarkers.length, "total markers");

    } catch (error) {
      console.error("Map initialization error:", error);
      setError(`Map initialization failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">📍 Locations Map</h2>
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
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
      {showMap ? (
        <div>
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-lg border border-gray-300"
          />
          <div className="mt-3 text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span>Restaurants</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span>NGOs</span>
              </div>
            </div>
            <p className="mt-1">Click on markers to see details</p>
          </div>
        </div>
      ) : (
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-lg mb-2">🗺️</div>
            <div>Loading map...</div>
            <div className="text-sm mt-1">
              {locations.length} locations available
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}


    </div>
  );
};

export default LocationsMap;