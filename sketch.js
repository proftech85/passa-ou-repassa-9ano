let logo;

function preload() {
  // AGORA A LOGO É DA RAIZ
  logo = loadImage("logo.png");
}

function setup() {
  createCanvas(800, 400);
}

function draw() {
  background(20, 30, 60);

  fill(255);
  textSize(22);
  textAlign(CENTER, CENTER);
  text("Teste de Logo – Passa ou Repassa 9º Ano", width / 2, 60);

  if (logo) {
    image(logo, width / 2 - 75, 120, 150, 150);
  }
}
