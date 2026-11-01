// volumes
let bgVolume = 0.15;
let scoreVolume = 0.8;
let booVolume = 0.7;

let gameState = "start";
let difficulty = "easy";
let playTime = 30;
let score = 0;
let timeLeft = 30;
let secondsPlayed = 0;
let endReason = "dead";
let items = [];
let lastSpawn =0;
let fallSpeed = 2;
let spawnDealy = 900;
let evilChance = 0.15;
let itemSize = 80;


let imgBg, imgSnail, imgEnemy, imgPumkin, imgDead, imgSpong;
let pixelFont;
let bgMusic, scoreSound, booSound;
let startBlur, deadBlur;
let startMillis = 0;

let buttonEasy, buttonMed, buttonHard, buttonMinus, buttonPlus, buttonStart, buttonRetry;

// loading all before start
function preload() {
    imgBg = loadImage("assets/img/bg.png");
    imgSnail = loadImage("assets/img/snail.png");
    imgEnemy = loadImage("assets/img/enemy.png");
    imgPumkin = loadImage("assets/img/pumkin.png");
    imgDead = loadImage("assets/img/dead.png");
    imgSpong = loadImage("assets/img/spong.png");   
    pixelFont = loadFont("assets/fonts/Silkscreen/Silkscreen-Regular.ttf");
    bgMusic = loadSound("assets/audio/bg.mp3");
    scoreSound = loadSound("assets/audio/score.mp3");
    booSound = loadSound("assets/audio/boo.mp3");
}

// canvas and audio
function setup() {
    createCanvas(windowWidth, windowHeight);
    imageMode(CENTER);
    textAlign(CENTER, CENTER);
    if (pixelFont){
        textFont(pixelFont);
    }
    bgMusic.setVolume(bgVolume);
    scoreSound.setVolume(scoreVolume);
    booSound.setVolume(booVolume);
    makeStartBlur();
}
// canvas = browser 
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    makeStartBlur();
}   

// snapshot 
function makeStartBlur() {
    image(imgBg, width/2, height/2, width, height);
    startBlur = get();
    startBlur.filter(BLUR, 6);
}
// Draw
function draw(){
    itemSize = min(width, height) * 0.1;
    if (pixelFont){
        textFont(pixelFont);
    }
    if (gameState == "start"){
        drawStart();
    } else if (gameState === "playing"){
        drawPlay();
    } else{
        drawDead();
    }
}
// pop up
function drawGlassPanel(x, y, w, h, panelColor){
    drawingContext.shadowBlur = 28;
    drawingContext.shadowColor = "rgba(0, 0, 0, 0.55)";
    fill(panelColor);
    stroke(225, 255, 255, 90);
    strokeWeight(1.5);
    rect(x, y, w, h, 16);
    drawingContext.shadowBlur = 0;
    noStroke();
}

// buttons
function drawButton (x, y, w, h, label, selected){
    if (selected){
        fill(50, 90, 170, 230);
    } else{
        fill(18, 36, 80, 200);
    }
    stroke(170, 200, 240, 210);
    strokeWeight(2);
    rect(x, y, w, h, 8);
    noStroke();
    fill(200, 220, 245);
    textAlign(CENTER, CENTER);
    text(label, x + w / 2, y + h / 2);
}

// true if muse in button box
function clickBox(b){
    return mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h;
}

// start menu
function drawStart(){
    image(startBlur, width/2, height/2, width, height);

    let panelW = min(460, width * 0.9);
    let panelH = min(560, height * 0.92);
    let panelX = width / 2 - panelW / 2;
    let panelY = height / 2 - panelH / 2;
    drawGlassPanel(panelX, panelY, panelW, panelH, color(8, 22, 55, 165));

    image(imgSpong, width / 2, panelY + panelH * 0.16, panelW * 0.28);

    fill(186, 210, 240);
    textSize(min(width, height) * 0.028);
    text("Which level do you want t play?", width / 2, panelY + panelH * 0.34);

    let bw = panelW * 0.28;
    let bh = panelH * 0.1;
    let by = panelY + panelH * 0.4;
    let gap = panelW * 0.4;
    let bx = panelX + panelW * 0.06;
    btnEasy = {x: bx, y: by, w: bw, h: bh};
    btnMed = {x: bx + bw + gap, y: by, w: bw, h: bh};
    btnHard = {x: bx + (bw + gap) * 2, y: by, w: bw, h: bh};
    textSize(min(width, height) * 0.022);
    drawButton(btnEasy.x, btnEasy.y, bw, bh, "Easy", difficulty === "easy");
    drawButton(btnMed.x, btnMed.y, bw, bh, "Medium", difficulty === "medium");
    drawButton(btnHard.x, btnHard.y, bw, bh, "Hard", difficulty === "hard");

    let tw = bh;
    let ty = panelY + panelH * 0.58;
    btnMinus = { x: width / 2 - bw * 0.9, y: ty, w: tw, h: tw};
    btnPlus = { x: width / 2 + bw * 0.9 - tw, y: ty, w: tw, h: tw};
    drawButton(btnMinus.x, btnMinus.y, tw, tw, "-", false);
    drawButton(btnPlus.x, btnPlus.y, tw, tw, "+", false);
    fill(186, 210, 240);
    textSize(min(width, height) * 0.03);
    text(playTime + "sec", width / 2, ty + tw / 2);

    let sw = panelW * 0.78;
    let sh = panelH * 0.12;
    btnStart = { x: width / 2 - sw / 2, y: panelY + panelH * 0.76, w: sw, h: sh};
    textSize(min(width, height) * 0.022);
    drawButton(btnStart.x, btnStart.y, sw, sh, "Start Game", false);
}

// game play
function drawPlay(){
    image(imgBg, width / 2, height / 2, width, height);

    timeLeft = playTime - (millis() - startMillis) / 1000;
    if (timeLeft <= 0){
        endGame("time");
        return;
    }

    if (millis() - lastSpawn > spawnDelay){
        spawnItem();
        lastSpawn = millis();
    }

    // move, draw
    for (let i = items.length - 1; i >= 0; i--){
        items[i].y += items[i].speed;
        image(items[i].img, items[i].x, items[i].y, itemSize, itemSize);
        if (items[i].y > height + itemSize){
            items.splice(i, 1);
        }
    }

    fill(186, 210, 240);
    textSize(min(width, height) * 0.035);
    textAlign(LEFT, TOP)
    text("SCORE " + score, width * 0.03, height * 0.03);
    textAlign(RIGHT, TOP);
    text("TIME " + cell(timeLeft), width * 0.97, height * 0.3);
    textAlign(CENTER, CENTER);
}
// game over
function drawDead(){
    if (deadBlur){
        image(deadBlur, width / 2, height /2, width, height);
    } else {
        image(startBlur, width / 2, height / 2, width, height);
    }

  let panelW = min(420, width * 0.86);
  let panelH = min(380, height * 0.7);
  let panelX = width / 2 - panelW / 2;
  let panelY = height / 2 - panelH / 2;
  drawGlassPanel(panelX, panelY, panelW, panelH, color(36, 150, 55, 175));

  image(imgPumkin, width / 2, panelY + panelH * 0.22, panelW * 0.28, panelW * 0.28);

  fill(220, 255, 220);
  textSize(min(width, height) * 0.04);
  if (endReason === "time") {
    text("Time's up!", width / 2, panelY + panelH * 0.46);
  } else {
    text("You are dead!", width / 2, panelY + panelH * 0.46);
  }

  textSize(min(width, height) * 0.025);
  text("You scored " + score + " in " + secondsPlayed + " seconds", width / 2, panelY + panelH * 0.6);

  let bw = panelW * 0.42;
  let bh = panelH * 0.16;
  btnRetry = { x: width / 2 - bw / 2, y: panelY + panelH * 0.72, w: bw, h: bh };
  textSize(min(width, height) * 0.028);
  drawButton(btnRetry.x, btnRetry.y, bw, bh, "RETRY", false);
}

// Create one falling item at a random x position.
function spawnItem(){
    let item = {
        x: random(itemSize, width - itemSize),
        y: -itemSize,
        speed: fallSpeed,
        type: "good",
        img: imgSnail
    };
    if(random() < evilChance) {
        item.type = "evil";
        item.img = imgEnemy;
    } else {
        let pick = random();
        if (pick < 0.33 && imgSnail){
            item.img = imgSnail;
        } else if (pick < 0.66) {
            item.img = imgSnail;
        } else {
            item.img = imgPumkin;
        }
    }
    items.push(item);
}

// set fall speed
function setDifficulty(){
    if (difficulty === "easy"){
        fallSpeed = min(height, width) * 0.004;
        spawnDelay = 900;
        spawnChance = 0.14;        
    } else if (difficulty === "medium"){
        fallSpeed = min(height, width) * 0.007;
        spawnDelay = 620;
        evilChance = 0.28;
    } else {
        fallSpeed = min(height, width) * 0.011;
        spawnDelay = 400;
        evilChance = 0.45;
    }
     
}

// Stop music 
function endGame(reason){
    endReason = reason;
    secondsPlayed = constrain(round(playTime - timeLeft), 0, playTime);
    if (reason === "time"){
        secondsPlayed = playTime;
    }

    deadBlur = get();
    deadBlur.filter(BLUR, 6);
    gameState = "dead";
    if (bgMusic.isPlaying()){
        bgMusic.stop();
    }
    if (!booSound.isPlaying()){
        booSound.loop();
    }
}

// clear
function resetGame(){
    score = 0;
    timeLeft = playTime;
    items = [];
    endReason = "dead";
}

// handle main menu
function mousePressed() {
  if (gameState === "start") {
    if (clickBox(btnEasy)) {
      difficulty = "easy";
    } else if (clickBox(btnMed)) {
      difficulty = "medium";
    } else if (clickBox(btnHard)) {
      difficulty = "hard";
    } else if (clickBox(btnMinus)) {
      playTime = constrain(playTime - 5, 30, 60);
    } else if (clickBox(btnPlus)) {
      playTime = constrain(playTime + 5, 30, 60);
    } else if (clickBox(btnStart)) {
      setDifficulty();
      resetGame();
      startMillis = millis();
      lastSpawn = millis();
      gameState = "playing";
      bgMusic.loop();
    }
  } else if (gameState === "playing") {
    // Check if the click hits a falling item.
    for (let i = items.length - 1; i >= 0; i--) {
      if (dist(mouseX, mouseY, items[i].x, items[i].y) < itemSize / 2) {
        if (items[i].type === "evil") {
          endGame("dead");
        } else {
          score += 1;
          scoreSound.play();
          items.splice(i, 1);
        }
        return;
      }
    }
  } else if (gameState === "dead") {
    if (btnRetry && clickBox(btnRetry)) {
      if (booSound.isPlaying()) {
        booSound.stop();
      }
      resetGame();
      gameState = "start";
    }
  }
}