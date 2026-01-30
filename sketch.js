let logoImg;

function preload() {
  logoImg = loadImage("assets/logo.png");
}

function setup() {
  createCanvas(600, 300);
}

function draw() {
  background(30);
  if (logoImg) {
    image(logoImg, 250, 50, 100, 100);
  }
}
