let canvas = document.getElementById('c');
let ctx = canvas.getContext("2d");
let vid = document.getElementById('v');
let reload = document.getElementById('reload');
let src, cap;

let vw, vh, W;
let cw = window.innerWidth;
let ch = window.innerHeight;
let cartoucheVide = new Image();
let cartouchePleine = new Image();
let star = new Image();

//resize event pour modifier les variables de width/height
window.addEventListener('resize', () => {
    cw = window.innerWidth;
    canvas.width = cw;
    ch = window.innerHeight;
    canvas.height = ch;
})

export function loading() {
    canvas.width = cw;
    canvas.height = ch;
    ctx.font = '48px sans serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Loading...", cw / 2, ch / 2);
}

export async function init() {

    cartoucheVide.src = 'cartoucheVide.png';
    cartouchePleine.src = 'cartouchePleine.png';
    star.src = 'star.png';

    let constraints = { audio: false, video: { facingMode: "environment" } };
    let stream = await navigator.mediaDevices.getUserMedia(constraints);
    vid.srcObject = stream;

    await vid.play();
    vw = vid.videoWidth;
    vid.width = vw;
    vh = vid.videoHeight;
    vid.height = vh;
    W = vh / vw;

    src = new cv.Mat(vh, vw, cv.CV_8UC4);
    cap = new cv.VideoCapture(vid);

}

export function showFrame() {
    //Affichage de la frame
    cap.read(src);
    let zoom = 4;
    let x = Math.max(0, (vw - cw * W) / 2);
    let dx = Math.min(vw, vh * cw / ch);
    let alpha = 0.5 * (1 - 1 / zoom) * dx;
    let beta = 0.5 * (1 - 1 / zoom) * vh;
    let rect = new cv.Rect(x + alpha, beta, dx / zoom, vh / zoom);
    let dst = src.roi(rect);
    cv.resize(dst, dst, new cv.Size(cw, ch));
    cv.imshow(canvas, dst);
    dst.delete();
}

export function showCross() {
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
    ctx.strokeStyle = 'white';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cw / 2, ch / 2, 1.5 * cw / 10, 0, 2 * Math.PI, false);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';
    ctx.stroke();
}

export function showFeu(feu) {
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

export function showCartouches(cartouches) {
    for (let i = 0; i < 3; i++) {
        if (i < cartouches) {
            ctx.drawImage(cartouchePleine, 5 + cw * i / 20, 5, cw / 20, cw / 10);

        } else {
            ctx.drawImage(cartoucheVide, 5 + cw * i / 20, 5, cw / 20, cw / 10);
        }
    }
}

export function showDistance(taux) {
    ctx.fillStyle = "yellow";
    ctx.fillRect(10 + 3 * cw / 20, 5, (cw - 10 - 3 * cw / 20) * (1 - taux), cw / 10);
}

export function splash(tirState) {
    if (tirState) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = (tirState == 'pass') ? 'green' : 'red';
        ctx.fillRect(0, 0, cw, ch);
    }
}

export function showScore(score, tentatives, stars) {
    ctx.font = 'bold 48px sans serif';
    ctx.fillStyle = 'white';
    let txt = score + ' / ' + tentatives;
    let txtWidth = ctx.measureText(txt).width;
    ctx.fillText(txt, cw / 20, ch -12);
    for (let i = 0; i < stars; i++) {
        ctx.drawImage(star, cw*(i+1) / 10 + txtWidth , ch - 48, 36,36);
        
        
    }

}

