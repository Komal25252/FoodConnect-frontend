import { useEffect, useState } from "react";

const GoogleMapsTest = () => {
  const [status, setStatus] = useState("Testing Google Maps API...");
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    testGoogleMaps();
  }, []);

  const testGoogleMaps = async () => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    addLog(`API Key: ${apiKey}`);
    
    if (!apiKey) {
      setStatus("❌ No API key found");
      return;
    }

    // Test 1: Try to load the script directly
    addLog("Testing direct script load...");
    
    try {
      // Remove existing scripts
      const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      existingScripts.forEach(script => {
        addLog(`Removing existing script: ${script.src}`);
        script.remove();
      });

      // Test the API key with a simple request
      const testUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      addLog(`Testing URL: ${testUrl}`);

      const script = document.createElement('script');
      script.src = testUrl;
      
      script.onload = () => {
        addLog("✅ Google Maps script loaded successfully!");
        if (window.google && window.google.maps) {
          addLog("✅ Google Maps API is available");
          setStatus("✅ Google Maps API is working!");
        } else {
          addLog("❌ Google Maps API not available after script load");
          setStatus("❌ Google Maps API not available");
        }
      };

      script.onerror = (error) => {
        addLog(`❌ Script loading failed: ${error}`);
        setStatus("❌ Failed to load Google Maps script");
      };

      document.head.appendChild(script);

      // Set a timeout
      setTimeout(() => {
        if (!window.google || !window.google.maps) {
          addLog("❌ Timeout: Google Maps didn't load in 10 seconds");
          setStatus("❌ Google Maps loading timeout");
        }
      }, 10000);

    } catch (error) {
      addLog(`❌ Error: ${error.message}`);
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Google Maps API Test</h2>
      
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <strong>Status:</strong> {status}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Debug Log:</h3>
        <div className="bg-black text-green-400 p-3 rounded text-sm font-mono max-h-64 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>

      <button 
        onClick={() => {
          setLogs([]);
          setStatus("Retesting...");
          testGoogleMaps();
        }}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test Again
      </button>
    </div>
  );
};

export default GoogleMapsTest;