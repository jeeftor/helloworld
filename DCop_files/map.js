//pass keys and map id
L.mapbox.accessToken = 'pk.eyJ1IjoidGFwZXN0ZXMiLCJhIjoiV0xhZ29FSSJ9.W81XpuwvrDRuEW1v8eVQOA';
var map = L.mapbox.map('map-one', 'tapestes.l30deb2p');
var myLayer = L.mapbox.featureLayer().addTo(map);
var geoJson = [{
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [-80.987641, 31.993111]
    },
    "properties": {
        "title": "ownship",
        "icon": {
            "iconUrl": "images/ownship.png",
            "iconSize": [85, 60], // size of the icon
            "iconAnchor": [0, 0], // point of the icon which will correspond to marker's location
            "popupAnchor": [0, -25], // point from which the popup should open relative to the iconAnchor
            "className": "dot"
        }
    }
}];

// Set a custom icon on each marker based on feature properties.
myLayer.on('layeradd', function(e) {
    var marker = e.layer,
        feature = marker.feature;

    marker.setIcon(L.icon(feature.properties.icon));
});

// Add features to the map.
myLayer.setGeoJSON(geoJson);

// Disable drag and zoom handlers.
map.dragging.disable();