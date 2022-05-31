var map = L.map('map').fitWorld();
let track = [];
let distanceParcourue = 0;
let firstPoint;
let marker;


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

let trafficLightIcon = L.icon({
    iconUrl: 'trafficLight.png',
    iconSize: [60, 48],
    iconAnchor: [30, 40],
});

map.locate({
    watch: true,
    setView: true,
    enableHighAccuracy: true,
    maxZoom: 16
});

function onLocationFound(e) {
    if (track.length == 0) {
        firstPoint = e.latlng; //{ lat: 48.9140808, lng: 2.3600318 };
        track.push(firstPoint);
        L.circle(firstPoint, {
            radius: 500,
            color: 'red'
        }).addTo(map);
        L.marker(firstPoint, { icon: trafficLightIcon }).addTo(map);
        marker = L.marker(firstPoint);
        marker.addTo(map);  
    } else {
        let lastValue = track[track.length - 1];
        let distance = Math.floor(e.latlng.distanceTo(lastValue));
        if (distance > 3*e.accuracy) {
            track.push(e.latlng);
            distanceParcourue += distance;
            L.polyline(track, {color: 'blue'}).addTo(map);
            map.removeLayer(marker);
            marker = L.marker(e.latlng);
            marker.addTo(map).bindPopup("Distance: " + distanceParcourue + " m").openPopup();  
        }
    }

}

map.on('locationfound', onLocationFound);

function onLocationError(e) {
    alert(e.message);
}

map.on('locationerror', onLocationError);