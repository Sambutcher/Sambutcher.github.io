let objectDetector;
let lastDetectionsCache = [];

export async function init() {
    let model = await cocoSsd.load()
    objectDetector = model;
}

export async function detectFeu() {
    let meanLastDetection = null;
    let cnt = 0;
    for (let i = 0; i < lastDetectionsCache.length; i++) { 
        if (lastDetectionsCache[i]) {
            if (cnt == 0) {
                meanLastDetection = lastDetectionsCache[i];
            } else {
                meanLastDetection.x = (cnt * meanLastDetection.x + lastDetectionsCache[i].x) / (cnt + 1);
                meanLastDetection.y = (cnt * meanLastDetection.y + lastDetectionsCache[i].y) / (cnt + 1);
                meanLastDetection.dx = (cnt * meanLastDetection.dx + lastDetectionsCache[i].dx) / (cnt + 1);
                meanLastDetection.dy = (cnt * meanLastDetection.dy + lastDetectionsCache[i].dy) / (cnt + 1);
            }
            cnt++;
        }

    }

    let detection = await detectFeuOneFrame(meanLastDetection);

    lastDetectionsCache.push(detection);
    if (lastDetectionsCache.length >= 4) {
        lastDetectionsCache.shift();
    }

    return meanLastDetection;
}

async function detectFeuOneFrame(lastDetection) {
    //cherche dans une frame le feu le plus proche de lastDetection, sinon celui le plus proche du centre
    let canvas = document.getElementById('c');
    let cw = window.innerWidth;
    let ch = window.innerHeight;

    let result = await objectDetector.detect(canvas, 20, 0.4);

    let detection = null;
    let min = null;
    for (let i = 0; i < result.length; i++) {
        if (result[i].class == 'traffic light') {
            let dTL = distanceToLast(result[i], lastDetection);
            if (min == null || dTL < min) {
                detection = { 'x': result[i].bbox[0], 'y': result[i].bbox[1], 'dx': result[i].bbox[2], 'dy': result[i].bbox[3] };
                min = dTL;
            }
        }
    }

    return detection;
}

//calcul de la distance au carré de la detection au dernier (ou au centre si le dernier est null)
function distanceToLast(object, lastDet) {
    let cw = window.innerWidth;
    let ch = window.innerHeight;
    let x = object.bbox[0];
    let y = object.bbox[1];
    let dx = object.bbox[2];
    let dy = object.bbox[3];

    if (lastDet == null) {
        return ((x + dx / 2 - cw / 2) ** 2 + (y + dy / 2 - ch / 2) ** 2); //distance au centre
    } else {
        return ((x + dx / 2 - (lastDet.x + lastDet.dx / 2)) ** 2 + (y + dy / 2 - (lastDet.y + lastDet.dy / 2)) ** 2);
    }
}