
let posRef, pos;

async function locate() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(position => {
            resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        }, reject, {
            enableHighAccuracy: true,
            timeout: Infinity,
            maximumAge: 0
        });
    });
}

export async function initRechargement(){
    posRef = await locate();
}

export async function distanceToRef() {
    pos = await locate();
    
    if ((posRef.latitude == pos.latitude) && (posRef.longitude == pos.longitude)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * posRef.latitude / 180;
        var radlat2 = Math.PI * pos.latitude / 180;
        var theta = posRef.longitude - pos.longitude;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515 * 1.609344 * 1000;

        return dist;
    }
}

