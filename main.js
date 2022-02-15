
let capt;
let img;
let cw,ch;
let sw,sh;

let state;

let objectDetector;

const label='traffic light';//'person'


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  sw=windowWidth;
  sh=windowHeight;
}


function setup() {
  sw=windowWidth;
  sh=windowHeight;
  
  createCanvas(sw,sh);
  let constraints = { audio: false, video: { facingMode: "environnment" }  };
  capt=createCapture(constraints, (stream)=>{
    cw=capt.width;
    ch=capt.height;
    capt.hide();
    objectDetector = ml5.objectDetector('cocossd', ()=>{
      state='capture';
      console.log('OK');
    });
  });

}

function draw() {
  if (state=='capture') {
    img=capt.get((cw-ch*sw/sh)/2,0,ch*sw/sh,ch);
    img.resize(sw,sh);
    image(img,0,0); 
    noFill();
    stroke('white');
    circle(sw/2,sh/2,sw/10);
  } 
  
}

function distanceToCenter(object){
  let x=object.x;
  let y=object.y;
  let dx=object.width;
  let dy=object.height;
  return ((x+dx/2-sw)^2+(y+dy/2-sh)^2);
}

function mousePressed(){
  if (state=='capture'){
    state='photo';
    objectDetector.detect(img,(err,results)=>{
      let distMin;
      let cible;
      for (let i=0;i<results.length;i++){
        let dist=distanceToCenter(results[i]);
        if (results[i].label==label && (!distMin || distMin>dist)){
          cible=results[i];
          distMin=dist;
        }
        if (cible) {
      fill('red');
      noStroke();
      circle(cible.x+cible.width/2,cible.y+cible.height/2,10);
      console.log(cible);
        }
    }
    });
  } else if (state=='photo'){
    state='capture';
  }
}

