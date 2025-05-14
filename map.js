// Import Mapbox as an ESM module
// import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
// Check that Mapbox GL JS is loaded
console.log('Mapbox GL JS Loaded:', mapboxgl);

// Set your Mapbox access token here
mapboxgl.accessToken = 'pk.eyJ1IjoiaGFlY2hyaXN0aW5lIiwiYSI6ImNtYW85aW03OTAydTQyam9mOHgzaWtzd2wifQ.wQ6RfBIh4Rv0G3igCNuugQ';

// Initialize the map
const map = new mapboxgl.Map({
  container: 'map', // ID of the div where the map will render
  style: 'mapbox://styles/mapbox/streets-v12', // Map style
  center: [-71.09415, 42.36027], // [longitude, latitude]
  zoom: 12, // Initial zoom level
  minZoom: 5, // Minimum allowed zoom
  maxZoom: 18, // Maximum allowed zoom
});

// ✅ Wait for the map to fully load before adding data
map.on('load', async () => {
    // Shared paint style for both Boston and Cambridge bike lanes
  const bikeLaneStyle = {
    'line-color': '#32D400',  // Bright green
    'line-width': 5,          // Thicker lines
    'line-opacity': 0.6       // Slight transparency
  };
    // Step 1: Add the GeoJSON source for Boston bike lanes
    map.addSource('boston_route', {
      type: 'geojson',
      data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson',
    });
  
    // Step 2: Add a layer to visualize the bike lanes
    map.addLayer({
      id: 'bike-lanes-boston',
      type: 'line',
      source: 'boston_route',
      paint: bikeLaneStyle,
    });
  
    // Cambridge bike lane source and layer
    map.addSource('cambridge_route', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson',
    });

    map.addLayer({
        id: 'bike-lanes-cambridge',
        type: 'line',
        source: 'cambridge_route',
        paint: bikeLaneStyle,
      });

      console.log("Boston and Cambridge bike lanes loaded successfully.");
  });