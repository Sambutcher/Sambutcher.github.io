
let capt;
let img;
let cw, ch;
let sw, sh;

let state;

let objectDetector;

const label ='traffic light';//'person';

function setup() {
  sw = windowWidth;
  sh = windowHeight;
  state='loading';
  createCanvas(sw, sh);
  
  let constraints = { audio: false, video: { facingMode: "environment" } };
  capt = createCapture(constraints, (stream) => {
    cw = capt.width;
    ch = capt.height;
    capt.hide();
    objectDetector = ml5.objectDetector('cocossd', () => {
      state = 'capture';
      console.log('OK');
    });
  });
}

function draw() {
  switch (state) {
    case 'capture':
      img = capt.get((cw - ch * sw / sh) / 2, 0, ch * sw / sh, ch);
      img.resize(sw, sh);
      image(img, 0, 0);
      noFill();
      stroke('white');
      strokeWeight(2);
      line(sw/2,3*sh/10,sw/2,4*sh/10);
      line(sw/2,6*sh/10,sw/2,7*sh/10);
      line(3*sw/10,sh/2,4*sw/10,sh/2);
      line(6*sw/10,sh/2,7*sw/10,sh/2);
    break;
    case 'photo':
      //
    break;
    case 'loading':
      textAlign(CENTER,CENTER);
      textSize(32);
      fill('blue');
      text('Loading...',sw/2,sh/2);
    break;
  }
}

function distanceToCenter(object) {
  let x = object.x;
  let y = object.y;
  let dx = object.width;
  let dy = object.height;
  return ((x + dx / 2 - sw) ^ 2 + (y + dy / 2 - sh) ^ 2);
}


function touchStarted() {
  if (state == 'capture') {
    state = 'photo';

    image(img,0,0);
    fill('white');
    noStroke();
    circle(sw/2,sh/2,sw/100);

    objectDetector.detect(img, (err, results) => {
      let distMin;
      let cible;
      for (let i = 0; i < results.length; i++) {
        let dist = distanceToCenter(results[i]);
        if (results[i].label == label && (!distMin || distMin > dist)) {
          cible = results[i];
          distMin = dist;
        }
        if (cible) {
          noFill();
          stroke('blue');
          rect(cible.x, cible.y, cible.width, cible.height);
        }
      }
    });

  } else if (state == 'photo') {
    state = 'capture';
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  sw = windowWidth;
  sh = windowHeight;
}

