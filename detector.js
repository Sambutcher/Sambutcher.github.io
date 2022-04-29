let objectDetector;
let lastDetection=null;

export async function init() {
    let model = await cocoSsd.load()
    objectDetector = model;
}

export async function detectFeu() {
    let canvas = document.getElementById('c');
    let cw = window.innerWidth;
    let ch = window.innerHeight;

    let detection;
    let result = await objectDetector.detect(canvas, 20, 0.4);

    //recherche du label le plus au centre ->result[j]
    let j = -1;
    let min = cw ** 2 + ch ** 2;
    for (let i = 0; i < result.length; i++) {
        let dToC = distanceToCenter(result[i]);
        if (result[i].class == 'traffic light' && (dToC < min)) {
            j = i;
            min = dToC;
        }
    }

    //Recherche et affichage du feu j
    if (j >= 0) {
        detection={ 'x': result[j].bbox[0], 'y': result[j].bbox[1], 'dx': result[j].bbox[2], 'dy': result[j].bbox[3]};
        lastDetection=detection;
    } else {
        detection = lastDetection;
        lastDetection=null;
    }

    return detection;
}

//calcul de la distance au centre (au carré)
function distanceToCenter(object) {
    let cw = window.innerWidth;
    let ch = window.innerHeight;
    let x = object.bbox[0];
    let y = object.bbox[1];
    let dx = object.bbox[2];
    let dy = object.bbox[3];
    return ((x + dx / 2 - cw / 2) ** 2 + (y + dy / 2 - ch / 2) ** 2);
}