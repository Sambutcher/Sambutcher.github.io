let vid = document.getElementById('v');
let canvas = document.getElementById('c');
let src;
let dst;
let cap;
let state = 'loading';

console.log(state);

let constraints = { audio: false, video: { facingMode: "environment" } };
navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {//capture du stream video
  vid.srcObject = stream;
  vid.play().then(() => {
    vw = vid.videoWidth;
    vid.width=vw;
    vh = vid.videoHeight;
    vid.height=vh;
    W = vh / vw;
    cw = window.innerWidth;
    canvas.width = cw;
    ch = window.innerHeight;
    canvas.height = ch;
    src = new cv.Mat(vh, vw, cv.CV_8UC4);
    cap = new cv.VideoCapture(vid);
    state = 'capture';
    console.log(state);
  });
});

const FPS = 10;
function processVideo() {
  let begin = Date.now();
  switch (state) {
    case 'capture':
      cap.read(src);
      let rect= new cv.Rect(Math.max(0,(vw - cw * W) / 2), 0,Math.min(vw, vh * cw / ch), vh);
      console.log(rect);
      dst=src.roi(rect);
      cv.resize(dst,dst,new cv.Size(cw,ch));
      cv.imshow(canvas, dst);
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

//resize event pour modifier les variables de width/height
window.addEventListener('resize', () => {
  cw = window.innerWidth;
  canvas.width = cw;
  ch = window.innerHeight;
  canvas.height = ch;
})