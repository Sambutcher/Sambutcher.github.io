let vid = document.getElementById('v');
let canvas = document.getElementById('c');
let ctx = canvas.getContext("2d");
let crop;
let vw, vh, W;
let cw,ch;

let state = 'loading';

let objectDetector;
const label ='traffic light'; 

console.log('init');
//initialisation
let constraints = { audio: false, video: { facingMode: "environment" } };
navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {//capture du stream video
  vid.srcObject = stream;
  vid.play().then(()=>{
    console.log('video OK')
    //initialisation des variables de largeur/hauteur
    vw = vid.videoWidth;
    vh = vid.videoHeight;
    W=vh/vw;
    cw = window.innerWidth;
    canvas.width = cw;
    ch = window.innerHeight;
    canvas.height = ch;
    
   cocoSsd.load().then(model => { //initalisation du modèle de détection
      console.log('modèle OK')
      objectDetector=model;
      state='capture';
    });
  });
});

//boucle d'affichage
const FPS = 30;
function processVideo() {
  let begin = Date.now();
  switch (state) {
    case 'capture':
      ctx.drawImage(vid, (vw - cw * W) / 2, 0, vh * cw / ch, vh, 0, 0, cw, ch); 
      ctx.beginPath(); 
        ctx.moveTo(cw/2,4*ch/10-cw/10);
        ctx.lineTo(cw/2,4*ch/10);
        ctx.moveTo(cw/2,6*ch/10);
        ctx.lineTo(cw/2,6*ch/10+cw/10);
        ctx.moveTo(3*cw/10,ch/2);
        ctx.lineTo(4*cw/10,ch/2);
        ctx.moveTo(6*cw/10,ch/2);
        ctx.lineTo(7*cw/10,ch/2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'white';
        ctx.stroke();
      break;
    case 'photo':
      //
      break;
    case 'loading':
      
      break;
  }
  let delay = 1000 / FPS - (Date.now() - begin);
  setTimeout(processVideo, delay);
}
//lancement de la boucle d'affichage
setTimeout(processVideo, 0);

//Click event
canvas.addEventListener('click',()=>{
  if (state == 'capture') {
    state = 'photo';
    
    ctx.drawImage(vid, (vw - cw * W) / 2, 0, vh * cw / ch, vh, 0, 0, cw, ch);

    objectDetector.detect(canvas, 20, 0.2).then(result => { // Lancement de la détection
      
      let j = -1;
      let min=cw**2+ch**2;

      for (let i = 0; i < result.length; i++) {
        let dToC = distanceToCenter(result[i]);
        if (result[i].class == label && ( dToC < min)) {
          j = i;
          min = dToC;
        }
      }

      if (j >= 0) {
        let cible;
        cible=chercheCible(...result[j].bbox);
        if(cible){
          ctx.beginPath();
          ctx.arc(cible.x, cible.y, cible.r, 0, 2 * Math.PI, false);
          ctx.strokeStyle = 'white';
          ctx.stroke();
        }
        console.log(cible);
      }
    })
  } else if (state == 'photo') {
    state = 'capture';
  }
})

//resize event pour modifier les variables de width/height
window.addEventListener('resize',()=>{
  cw = window.innerWidth;
  canvas.width = cw;
  ch = window.innerHeight;
  canvas.height = ch;
})

function distanceToCenter(object) {
  let x = object.bbox[0];
  let y = object.bbox[1];
  let dx = object.bbox[2];
  let dy = object.bbox[3];
  return ((x + dx / 2 - cw/2) **2 + (y + dy / 2 - ch/2) ** 2);
}

function chercheCible(x,y,dx,dy){
  let crop;

  crop = cv.matFromImageData(ctx.getImageData(x, y, dx, dy));
  cv.cvtColor(crop, crop, cv.COLOR_BGR2HSV);
    cv.medianBlur(crop, crop, 5);

    let mask1 = new cv.Mat();
    let low1 = new cv.Mat(crop.rows, crop.cols, crop.type(), [120, 150, 150, 0]);
    let high1 = new cv.Mat(crop.rows, crop.cols, crop.type(), [140, 255, 255, 255]);
    cv.inRange(crop, low1, high1, mask1);

    let mask2 = new cv.Mat();
    let low2 = new cv.Mat(crop.rows, crop.cols, crop.type(), [20, 150, 150, 0]);
    let high2 = new cv.Mat(crop.rows, crop.cols, crop.type(), [40, 255, 255, 255]);
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

    if (maxCircle) {
      return {'x':maxCircle.center.x+x,'y':maxCircle.center.y+y,'r':maxCircle.radius};
    } else { 
      return;
     }
}