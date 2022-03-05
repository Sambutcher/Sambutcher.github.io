let vid = document.getElementById('v');
let canvas = document.getElementById('c');
let ctx = canvas.getContext("2d");
let src, cap;
let feu;
let vw, vh, W;
let cw = window.innerWidth;
let ch = window.innerHeight;

let objectDetector;

canvas.width = cw;
canvas.height = ch;
ctx.font = '48px';
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText("Loading...", cw / 2, ch / 2);

//initialisation
let constraints = { audio: false, video: { facingMode: "environment" } };
navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {//capture du stream video
  vid.srcObject = stream;
  vid.play().then(() => {
    vw = vid.videoWidth;
    vid.width = vw;
    vh = vid.videoHeight;
    vid.height = vh;
    W = vh / vw;

    src = new cv.Mat(vh, vw, cv.CV_8UC4);
    cap = new cv.VideoCapture(vid);

    cocoSsd.load().then(model => { //initalisation du modèle de détection
      objectDetector = model;
      //lancement de la boucle d'affichage
      setTimeout(processVideo, 0);
    });
  });
});

//boucle d'affichage
const FPS = 60;
function processVideo() {
  let begin = Date.now();

  showFrame();
  detectFeu();
  showFeu()
  showCross();

  let delay = 1000 / FPS - (Date.now() - begin);
  setTimeout(processVideo, delay);
}


//Click event (passage de capture <->photo)
canvas.addEventListener('click', () => {
  if (feu){
    if (Math.sqrt((feu.x + feu.dx / 2 -cw/2)**2+ (feu.y + feu.dy / 6 - ch/2)**2)<feu.dy/8){
      feu.status[0]=true;
    } 
    if (Math.sqrt((feu.x + feu.dx / 2 -cw/2)**2+ (feu.y + feu.dy / 2 - ch/2)**2)<feu.dy/8){
      feu.status[1]=true;
    } 
    if (Math.sqrt((feu.x + feu.dx / 2 -cw/2)**2+ (feu.y + 5*feu.dy / 6 - ch/2)**2)<feu.dy/8){
      feu.status[2]=true;
    } 
   }
})

//resize event pour modifier les variables de width/height
window.addEventListener('resize', () => {
  cw = window.innerWidth;
  canvas.width = cw;
  ch = window.innerHeight;
  canvas.height = ch;
})

//calcul de la distance au centre (au carré)
function distanceToCenter(object) {
  let x = object.bbox[0];
  let y = object.bbox[1];
  let dx = object.bbox[2];
  let dy = object.bbox[3];
  return ((x + dx / 2 - cw / 2) ** 2 + (y + dy / 2 - ch / 2) ** 2);
}



function showFrame() {
  //Affichage de la frame
  cap.read(src);
  let rect = new cv.Rect(Math.max(0, (vw - cw * W) / 2), 0, Math.min(vw, vh * cw / ch), vh);
  let dst = src.roi(rect);
  cv.resize(dst, dst, new cv.Size(cw, ch));
  cv.imshow(canvas, dst);
  dst.delete();
}

function showCross() {
  ctx.beginPath();
  ctx.moveTo(cw / 2, 4 * ch / 10 - cw / 10);
  ctx.lineTo(cw / 2, 4 * ch / 10);
  ctx.moveTo(cw / 2, 6 * ch / 10);
  ctx.lineTo(cw / 2, 6 * ch / 10 + cw / 10);
  ctx.moveTo(3 * cw / 10, ch / 2);
  ctx.lineTo(4 * cw / 10, ch / 2);
  ctx.moveTo(6 * cw / 10, ch / 2);
  ctx.lineTo(7 * cw / 10, ch / 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'grey';
  ctx.stroke();
}

function detectFeu() {
  objectDetector.detect(canvas, 20, 0.2).then(result => { // Lancement de la détection
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


    //Recherche et affichage du cercle cible
    if (j >= 0) {
      if (!feu) {
        feu = { 'x': result[j].bbox[0], 'y': result[j].bbox[1], 'dx': result[j].bbox[2], 'dy': result[j].bbox[3], 'status': [false, false, false] };
      } else {
        feu = { 'x': result[j].bbox[0], 'y': result[j].bbox[1], 'dx': result[j].bbox[2], 'dy': result[j].bbox[3], 'status': feu.status };
      }
    } else {
      feu = null;
    }

  })
}

function showFeu(){
  if (feu) {
    ctx.fillStyle = "white";
    ctx.fillRect(feu.x, feu.y, feu.dx, feu.dy);

    ctx.beginPath();
    ctx.arc(feu.x + feu.dx / 2, feu.y + feu.dy / 6, feu.dy / 8, 0, 2 * Math.PI, false);
    ctx.fillStyle = (feu.status[0] ? 'white' : 'black');
    ctx.strokeStyle = 'black';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(feu.x + feu.dx / 2, feu.y + feu.dy / 2, feu.dy / 8, 0, 2 * Math.PI, false);
    ctx.fillStyle = (feu.status[1] ? 'white' : 'black');
    ctx.strokeStyle = 'black';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(feu.x + feu.dx / 2, feu.y + 5 * feu.dy / 6, feu.dy / 8, 0, 2 * Math.PI, false);
    ctx.fillStyle = (feu.status[2] ? 'white' : 'black');
    ctx.strokeStyle = 'black';
    ctx.fill();
    ctx.stroke();
  }
}

//Recherche de la cible dans le feu
/*function chercheCible(x, y, dx, dy) {

  let crop;

  crop = cv.matFromImageData(ctx.getImageData(x, y, dx, dy));
  cv.cvtColor(crop, crop, cv.COLOR_RGB2HSV);
  cv.medianBlur(crop, crop, 5);

  let mask1 = new cv.Mat();
  let low1 = new cv.Mat(crop.rows, crop.cols, crop.type(), [160, 100, 50, 0]);
  let high1 = new cv.Mat(crop.rows, crop.cols, crop.type(), [179, 255, 255, 255]);
  cv.inRange(crop, low1, high1, mask1);

  let mask2 = new cv.Mat();
  let low2 = new cv.Mat(crop.rows, crop.cols, crop.type(), [0, 100, 50, 0]);
  let high2 = new cv.Mat(crop.rows, crop.cols, crop.type(), [70, 255, 255, 255]);
  cv.inRange(crop, low2, high2, mask2);

  let mask = new cv.Mat();
  cv.bitwise_or(mask1, mask2, mask);

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(mask, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

  let maxRad = 0;
  let maxCircle;
  for (let i = 0; i < contours.size(); i++) {
    let cnt = contours.get(i);
    let circle = cv.minEnclosingCircle(cnt);
    if (circle.radius > maxRad) {
      maxRad = circle.radius;
      maxCircle = circle;
    }
  }

  mask1.delete();
  low1.delete();
  high1.delete();
  mask2.delete();
  low2.delete();
  high2.delete();
  mask.delete();
  contours.delete();
  hierarchy.delete();


  if (maxCircle) {
    return { 'x': maxCircle.center.x + x, 'y': maxCircle.center.y + y, 'r': maxCircle.radius };
  } else {
    return;
  }
}*/