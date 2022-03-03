
let canvas = document.getElementById('c');
let vid = document.getElementById('v');
let ctx = canvas.getContext("2d");
let vw, vh, W;
let cw, ch;
let src, cap;


let constraints = { audio: false, video: { facingMode: "environment" } };
navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {//capture du stream video
  vid.srcObject = stream;
  vid.play().then(() => {
    vw = vid.videoWidth;
    vid.width = vw;
    vh = vid.videoHeight;
    vid.height = vh;
    W = vh / vw;
    cw = window.innerWidth;
    canvas.width = cw;
    ch = window.innerHeight;
    canvas.height = ch;
    src = new cv.Mat(vh, vw, cv.CV_8UC4);
    cap = new cv.VideoCapture(vid);
  });
});

vid.onloadedmetadata = () => {
  const FPS = 30;
  function processVideo() {
    let begin = Date.now();
    showFrame();
    let dst = new cv.Mat();
    cv.medianBlur(src, dst, 5);
    cv.cvtColor(dst, dst, cv.COLOR_RGB2HSV);

    //low red mask (Hue in [0,20])
    let mask1 = new cv.Mat();
    let low1 = new cv.Mat(dst.rows, dst.cols, dst.type(), [0, 150, 50, 0]);
    let high1 = new cv.Mat(dst.rows, dst.cols, dst.type(), [70, 255, 255, 255]);
    cv.inRange(dst, low1, high1, mask1);

    //high red mask (Hue in [160,179])
    let mask2 = new cv.Mat();
    let low2 = new cv.Mat(dst.rows, dst.cols, dst.type(), [160, 150, 50, 0]);
    let high2 = new cv.Mat(dst.rows, dst.cols, dst.type(), [179, 255, 255, 255]);
    cv.inRange(dst, low2, high2, mask2);

    //mask fusion
    let mask = new cv.Mat();
    cv.bitwise_or(mask1, mask2, mask);

    cv.bitwise_and(src, src, dst, mask);

    cv.imshow(canvas, dst);

    dst.delete();
    mask1.delete();
    low1.delete();
    high1.delete();
    mask2.delete();
    low2.delete();
    high2.delete();
    mask.delete();

    let delay = 1000 / FPS - (Date.now() - begin);
    setTimeout(processVideo, delay);
  }
  //lancement de la boucle d'affichage
  setTimeout(processVideo, 0);
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