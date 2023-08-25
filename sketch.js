let mySound;
let myFont;
let sampleIsPlaying;
let amplitude;
let fft;
let circleSize;
let shapeThickness;
let shapeType;
let shapeScale;

let segments = [];
let firstGeneration;
let secondGeneration;
let thirdGeneration;
let fourthGeneration;
let fifthGeneration;
let sixthGeneration;

let pauseButton;
let playButton;
let stopButton;
let skipToStartButton;
let skipToEndButton;
let loopButton;
let recordButton;
let recordingState = 0;

let backgroundColor;

let myRec;

function preload() {
  soundFormats('mp3');
  mySound = loadSound('./sound/Kalte_Ohren_(_Remix_).mp3');
  myFont = loadFont('assets/Lato-Regular.ttf');
}

function setup() {
  createCanvas(1920, 1080);
  angleMode(RADIANS);

  textFont(myFont);

  colorPalette = ['red', 'orange', 'yellow', 'cyan', 'blue', 'teal', 'violet'];

  ////////////////////////////
  /////PLAYBACK BUTTONS//////
  ///////////////////////////

  pauseButton = playBackButtons(
    './images/pause-solid.svg',
    width / 2 - 260,
    pauseSound
  );
  playButton = playBackButtons(
    './images/play-solid.svg',
    width / 2 - 180,
    playSound
  );
  stopButton = playBackButtons(
    './images/stop-solid.svg',
    width / 2 - 100,
    stopSound
  );
  skipToStartButton = playBackButtons(
    './images/fast-backward-solid.svg',
    width / 2 - 20,
    skipToStartSound
  );
  skipToEndButton = playBackButtons(
    './images/fast-forward-solid.svg',
    width / 2 + 60,
    skipToEndSound
  );
  loopButton = playBackButtons(
    './images/repeat-solid.svg',
    width / 2 + 140,
    loopSound
  );
  recordButton = playBackButtons(
    './images/circle-solid-white.svg',
    width / 2 + 220,
    recordSound
  );

  //volume, rate, and pan slider
  volSlider = slider(0, 1, width / 2 + 350, 45, 0.5);
  rateSlider = slider(0, 1, width / 2 + 350, 95, 0.5);
  panSlider = slider(0, 1, width / 2 + 350, 155, 0.5);

  //recording
  mic = new p5.AudioIn();
  recorder = new p5.SoundRecorder();
  recorder.setInput(mic);

  soundFile = new p5.SoundFile();

  // Meyda
  if (typeof Meyda === 'undefined') {
    console.log("Meyda couldn't be found!");
  } else {
    console.log('Meyda is found!');
    analyzer = Meyda.createMeydaAnalyzer({
      audioContext: getAudioContext(),
      source: mySound,
      buffer: 512,
      featureExtractors: ['rms', 'zcr', 'energy'],
      callback: (features) => {
        shapeThickness = features.rms * 10000;
        shapeType = features.zcr;
        shapeScale = features.energy / 100;
      },
    });
  }

  // snowflake code from : https://editor.p5js.org/codingtrain/sketches/SJHcVCAgN
  let a = createVector(0, 100);
  let b = createVector(600, 100);
  let s1 = new Segment(a, b);

  let len = p5.Vector.dist(a, b);
  let h = (len * sqrt(3)) / 2;
  let c = createVector(300, 100 + h);

  let s2 = new Segment(b, c);
  let s3 = new Segment(c, a);
  segments.push(s1);
  segments.push(s2);
  segments.push(s3);

  //snowflake generations - only going up to the sixth

  firstGeneration = segments;

  secondGeneration = createNextGeneration(firstGeneration);

  thirdGeneration = createNextGeneration(secondGeneration);

  fourthGeneration = createNextGeneration(thirdGeneration);

  fifthGeneration = createNextGeneration(fourthGeneration);

  sixthGeneration = createNextGeneration(fifthGeneration);

  // Speech recognition to set the background color
  // Works on Chrome - Doesn't work on firefox
  // Speech recognition code edited from: https://github.com/IDMNYU/p5.js-speech/blob/master/examples/05continuousrecognition.html

  myRec = new p5.SpeechRec('en-US', parseResult); // new P5.SpeechRec object
  myRec.continuous = true; // do continuous recognition
  myRec.interimResults = true; // allow partial recognition (faster, less accurate)

  backgroundColor = color(0, 0, 0);

  myRec.start(); // start engine
}

function draw() {
  background(backgroundColor);

  // speech recognition instructions:
  textSize(20);
  textAlign(LEFT);
  strokeWeight(1);
  stroke(255);
  fill(255);
  text('Please use the microphone ', 20, 60);
  text('to set the background color ', 20, 90);
  text('saying the color name by : ', 20, 120);
  text('Red, Blue, Purple, Pink', 20, 150);

  mySound.setVolume(volSlider.value());
  mySound.rate(rateSlider.value());
  mySound.pan(panSlider.value());

  fill(255);
  noStroke();
  textSize(20);
  text('Master Volume', width / 2 + 350, 45);
  text('Rate', width / 2 + 350, 95);
  text('Pan', width / 2 + 350, 155);

  col = random(colorPalette);

  translate(width / 3 + 50, height / 5);
  strokeWeight(shapeThickness % 20);
  stroke(col);

  if (shapeType >= 10) {
    // console.log('it is 3rd generation');
    segments = fifthGeneration;
  } else if (shapeType < 10 && shapeType >= 5) {
    // console.log('it is 2nd generation');
    segments = fourthGeneration;
  } else {
    // console.log('it is first generation');
    segments = thirdGeneration;
  }

  for (let s of segments) {
    s.show();
  }

  translate(width / 11, height / 6);
  scale(0.4);
  let signArray = [-1, 1];
  let randomSign = random(signArray);
  rotate(randomSign * shapeScale);
  for (let s of sixthGeneration) {
    s.show();
  }
}

// factory function to create playback buttons
function playBackButtons(name, xPos, method) {
  let button = createImg(name);
  button.position(xPos, 45);
  button.size(50, 50);
  button.mousePressed(method);
  return button;
}

// factory function to create sliders
function slider(lowLim, highLim, xPos, yPos, defaultVal) {
  let slider = createSlider(lowLim, highLim, defaultVal, 0.01);
  slider.position(xPos, yPos);
  slider.style('width', '300px');

  return slider;
}

// play sound function
function playSound() {
  mySound.play();
  console.log(getAudioContext().state);
  sampleIsPlaying = true;
  analyzer.start();
}

// stop sound function
function stopSound() {
  mySound.stop();
  console.log(getAudioContext().state);
  sampleIsPlaying = false;
  analyzer.stop;
}

// pause sound function
function pauseSound() {
  mySound.pause();
  console.log(getAudioContext().state);
  sampleIsPlaying = false;
}

// skip to the start of the sound function
function skipToStartSound() {
  mySound.jump();
  console.log(getAudioContext().state);
}

// skip the end of the function
function skipToEndSound() {
  mySound.jump(mySound.duration() - 5);
  console.log(getAudioContext().state);
}

// turns on loop if it's not looping
// turns off loop if it's looping
function loopSound() {
  if (mySound.isLooping()) {
    mySound.setLoop(false);
    console.log('loop is off');
    console.log(getAudioContext().state);
    loopButton.remove();
    loopButton = playBackButtons(
      './images/repeat-solid.svg',
      width / 2 + 140,
      loopSound
    );
  } else if (!mySound.isLooping()) {
    mySound.setLoop(true);
    console.log('loop is on');
    console.log(getAudioContext().state);
    loopButton.remove();
    loopButton = playBackButtons(
      './images/repeat-1-solid.svg',
      width / 2 + 140,
      loopSound
    );
  }
}

//function to record sound
function recordSound() {
  mic.start();
  if (getAudioContext().state != 'running') {
    getAudioContext().resume();
  }
  if (recordingState == 0 && mic.enabled) {
    console.log('recording');
    recordButton.remove();
    recordButton = playBackButtons(
      './images/circle-solid-red.svg',
      width / 2 + 220,
      recordSound
    );
    recorder.record(soundFile);
    recordingState++;
  } else if (recordingState === 1) {
    console.log('Click to play and download');
    recordButton.remove();
    recordButton = playBackButtons(
      './images/download-solid.svg',
      width / 2 + 220,
      recordSound
    );
    recorder.stop();
    recordingState++;
  } else if (recordingState === 2) {
    console.log('Click to record');
    recordButton.remove();
    recordButton = playBackButtons(
      './images/circle-solid-white.svg',
      width / 2 + 220,
      recordSound
    );
    soundFile.play();
    save(soundFile, 'output.wav');
    recordingState = 0;
  }
}

//helper function for draw the snowflake shape
function addAll(arr, list) {
  for (let s of arr) {
    list.push(s);
  }
}

// draw the snowflake shape
// snow flake code from : https://editor.p5js.org/codingtrain/sketches/SJHcVCAgN
function createNextGeneration(segmentArray) {
  let nextGeneration = [];

  for (let s of segmentArray) {
    let children = s.generate();
    addAll(children, nextGeneration);
  }
  return nextGeneration;
}

//parse speech recognition to set backgroundColor
function parseResult() {
  // recognition system will often append words into phrases.
  // so hack here is to only use the last word:
  var mostrecentword = myRec.resultString.split(' ').pop();
  if (mostrecentword.indexOf('red') !== -1) {
    backgroundColor = color(255, 49, 49);
  } else if (mostrecentword.indexOf('purple') !== -1) {
    backgroundColor = color(125, 18, 255);
  } else if (mostrecentword.indexOf('blue') !== -1) {
    backgroundColor = color(27, 3, 163);
  } else if (mostrecentword.indexOf('pink') !== -1) {
    backgroundColor = color(255, 16, 240);
  }
  console.log(mostrecentword);
}
