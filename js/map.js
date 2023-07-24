// Link to tile sources for basemaps
const Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});
const Esri_TerrainMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

// Inititate map
let map = L.map('map', {
    minZoom: 7,
    layers: Esri_TerrainMap
}).setView([34.9, -117.17647059146096], 9);

// Initiate and add marker layers to map
let poiLayer = L.layerGroup().addTo(map);
let markers = L.markerClusterGroup().addTo(map);

// Define custom icon
const mwaIcon = L.icon({
    iconUrl: 'https://www.mojavewater.org/wp-content/uploads/2021/07/logo.svg',
    iconSize: [40],
    iconAnchor: [20, 60],
    className: "custom-icon"
});

// Create POI marker and add to layer
const poiMarker = L.marker([34.50329429387652, -117.17647059146096], {
    title: 'MWA',
    icon: mwaIcon,
    interactive: false
}).addTo(poiLayer);

// Create basemap object for layer control
let baseMaps = {
    "Terrain": Esri_TerrainMap,
    "Streets": Esri_WorldStreetMap
};

map.addControl(new L.Control.Search({
    layer: markers,
    autoResize: false,
    initial: false,
    position: 'topleft',
    propertyName: 'searchItem',
    marker: {
        icon: false,
        animate: true
    },
    hideMarkerOnCollapse: true,
    zoom: 15
}));

// Create Scale control and add to map
const scale = L.control.scale().addTo(map);

// Extend leaflet-measure to avoid moving on click
L.Control.Measure.include({
    _setCaptureMarkerIcon: function () {
        this._captureMarker.options.autoPanOnFocus = false;

        this._captureMarker.setIcon(
            L.divIcon({
                iconSize: this._map.getSize().multiplyBy(2)
            })
        );
    }
});

// Add measure control to map
var measure = L.control.measure({
    position: 'topleft'
}).addTo(map);

// Delete text from measurement control icon
document.getElementsByClassName("leaflet-control-measure-toggle")[0].textContent = "";        

(async function() {
    const boundary = await fetchJSON('./data/MWA_Boundary.geojson')
    const boundaryLayer = L.geoJSON(boundary, {
        style: {
            color: "#005eab",
            fillColor: "#ffffff",
            fillOpacity: "0.2",
            interactive: false
        }
    })
    boundaryLayer.addTo(map);
    
    // Create overlay object for layer control
    const overlayMaps = {
        "Wells": markers,
        "Boundary": boundaryLayer
    };
    
    // Create and add layer control to map
    const layerControl = L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(map);
}) ();