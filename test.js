let vid = document.getElementById('v');
let canvas = document.getElementById('c');
let ctx = canvas.getContext("2d");
let vw, vh, W;
let cw, ch;

let state = 'loading';

let constraints = { audio: false, video: { facingMode: "environment" } };
navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {//capture du stream video
  vid.srcObject = stream;

  vid.play().then(() => {
    console.log('video OK');
    //initialisation des variables de largeur/hauteur
    vw = vid.videoWidth;
    vh = vid.videoHeight;
    W = vh / vw;
    cw = window.innerWidth;
    canvas.width = cw;
    ch = window.innerHeight;
    canvas.height = ch;
    state = 'capture';
  });

});

//boucle d'affichage
const FPS = 1;
function processVideo() {
  let begin = Date.now();
  switch (state) {
    case 'capture':
      ctx.drawImage(vid, (vw - cw * W) / 2, 0, vh * cw / ch, vh, 0, 0, cw, ch);
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
