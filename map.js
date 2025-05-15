// Import Mapbox as an ESM module
// import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
// Check that Mapbox GL JS is loaded
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

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

// Select the SVG element inside the map container
const svg = d3.select('#map').select('svg');

// Helper function to convert station lon/lat to map coordinates
function getCoords(station) {
  const point = new mapboxgl.LngLat(+station.lon, +station.lat);
  const { x, y } = map.project(point);
  return { cx: x, cy: y };
}

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

      let jsonData;
      try {
        const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';
    
        // Await JSON fetch
        jsonData = await d3.json(jsonurl);
    
        console.log('Loaded JSON Data:', jsonData); // Log to verify structure
      } catch (error) {
        console.error('Error loading JSON:', error); // Handle errors
      } 

      let stations = jsonData.data.stations;
    // Load Bluebikes traffic data
    let trips;
    try {
    const csvUrl = 'https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv';
    trips = await d3.csv(csvUrl);

    console.log('Loaded Traffic Data:', trips); // Verify structure
    } catch (error) {
    console.error('Error loading CSV:', error); // Handle errors
    }

    const departures = d3.rollup(
        trips,
        v => v.length,
        d => d.start_station_id
      );
      
      const arrivals = d3.rollup(
        trips,
        v => v.length,
        d => d.end_station_id
      );
      
      stations = stations.map((station) => {
        let id = station.short_name;
      
        station.arrivals = arrivals.get(id) ?? 0;
        station.departures = departures.get(id) ?? 0;
        station.totalTraffic = station.arrivals + station.departures;

        return station;
      });

      const radiusScale = d3
      .scaleSqrt()
      .domain([0, d3.max(stations, (d) => d.totalTraffic)])
      .range([0, 25]); // You can tweak [min, max] radius size

  // Append circles for each station
  const circles = svg
    .selectAll('circle')
    .data(stations)
    .enter()
    .append('circle')
    .attr('r', d => radiusScale(d.totalTraffic))
    .each(function (d) {
    // Add <title> for browser tooltips
    d3.select(this)
      .append('title')
      .text(
        `${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`,
      );
  });

    // Function to update circle positions when the map moves/zooms
    function updatePositions() {
        circles
        .attr('cx', (d) => getCoords(d).cx) // Set the x-position using projected coordinates
        .attr('cy', (d) => getCoords(d).cy); // Set the y-position using projected coordinates
    }
  
    // Initial position update when map loads
    updatePositions();

    // Reposition markers on map interactions
    map.on('move', updatePositions); // Update during map movement
    map.on('zoom', updatePositions); // Update during zooming
    map.on('resize', updatePositions); // Update on window resize
    map.on('moveend', updatePositions); // Final adjustment after movement ends
  });