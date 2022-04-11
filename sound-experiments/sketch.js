let swaps = [
  9.5, 
  15.75,
  19.5,
  21.75,
  24.7, 
  29.5, 
  34.5, 
  44.5, 
  52.5, 
  62,
  72,
  77.9,
  83.7,
  93.7

];

let albumsToColors = {
  "12BarBruise": ['#2Bfb4f', '#c54835', '#e2c743', '#172119', '#e48550', '#ce4b3d', '#457D58'],
  "EyesLikeSky": ['#d6bc63', '#faf2d1', '#a38d5a', '#272720', '#caa53a', '#cfa948', '#f5eac5'],
  "FloatAlongFill": ['#d3c6df', '#e87e3c', '#cbda65', '#e07239', '#e3cc4c','#76a54b', '#6d6736'],
  "Default": ['#fb4934', '#b8bb26', '#fabd2f', '#83a598', '#d3869b', '#8ec07c', '#fe8019', '#282828', '#fbf1c7']
}

let lastBucket = 0;
let albumStart = [
  ["12BarBruise", 9.5],
  ["EyesLikeSky", 44.5],
  ["FloatAlongFill", 77.9],
  ["Default", 93.7],
]

function getCurrentAlbum(currentTime) {
  for (let i = 0; i < albumStart.length; i++) {
    let album = albumStart[i];
    if (i != albumStart.length - 1) {
      let nextAlbum = albumStart[i + 1];
      if (currentTime > nextAlbum[1]) {
        continue;
      } else {
        return album[0];
      }
    }
    
    if (currentTime > album) {
      return album[0];
    }
  }
  return "Default";
}

function bucketChanged(currentTime) {
  for (let i = 0; i < swaps.length; i++) {
    if (currentTime > swaps[i]) {
      if (i != swaps.length - 1 && currentTime > swaps[i+1]) {
        continue;
      } else {
        if (swaps[i] != lastBucket) {
          lastBucket = swaps[i];
          return true;
        } else {
          return false;
        }
      }
    }
  }
  return false;
}

let sumOld = 0;
let thresh = 0;

function sumWithLag(lag, samples) {
  let sum = 0;
  for (let i = 0; i <= samples.length - lag - 1; i++) {
    sum += (samples[i] * samples[i + lag]);
  }
  return sum;
}

function correlate(samples) {
  let autoCorrelation = [];
  for (let lag = 0; lag < samples.length; lag++) {
    autoCorrelation[lag] = sumWithLag(lag, samples);
  }
  return autoCorrelation;
}

function maxAbsoluteScaling(samples) {
  let max = Math.abs(Math.max(...samples));
  return samples.map(sample => sample / max);
}


function getFrequency(samples, sampleRate) {
  let sum = 0;
  let pdState = 0;
  let period = 0;
  for (let i = 0; i < samples.length; i++) {
    sumOld = sum;
    sum = samples[i];

    if (pdState === 2 && sum - sumOld <= 0) {
      period = i;
      pdState = 3;
    }

    if (pdState === 1 && sum > thresh && sum - sumOld > 0) {
      pdState = 2;
    }

    if (i == 0) {
      thresh = sum * .5;
      pdState = 1;
    }
  }

  return sampleRate / period;
}


function getFrequencyAndNormalizedData(samples, sampleRate) {
  let autoCorrelation = correlate(samples);
  let normalized = maxAbsoluteScaling(autoCorrelation);
  // let freq = getFrequency(normalized, sampleRate);
  return {
    // 'freq': freq,
    'normalizeData': normalized
  };
}

let sound;
let analyser;
let dataArray;
let started = false;
function onSoundLoadSuccess(e){
  sound.play();
  analyser = getAudioContext().createAnalyser();
  analyser.fftSize = 4096;
  analyser.smoothingTimeConstant = .2;

  let processorNode = getAudioContext().createScriptProcessor(4096, 1, 1);
  processorNode.onaudioprocess = () => {
    self.spectrum = new Float32Array(4096);
    analyser.getFloatTimeDomainData(self.spectrum);
    dataArray = getFrequencyAndNormalizedData(self.spectrum, sound.sampleRate())['normalizeData']
  }
  sound.connect(analyser);
  analyser.connect(processorNode);
  console.log("load sound success",e);
}
function onSoundLoadError(e){
  console.log("load sound error",e);
}
function onSoundLoadProgress(e){
  console.log("load sound progress",e);
}

let history = [];
function preload() {
  sound = loadSound('assets/gizz.mp4', onSoundLoadSuccess, onSoundLoadError, onSoundLoadProgress);
}

let currentBg = 1;
let currentStroke = 255;
function setup() {
  createCanvas(windowWidth, windowHeight);
  background(currentBg);
  stroke(currentStroke);
}

function getRandomColor(colorList) {
  return colorList[Math.floor(Math.random() * colorList.length)];
}

function getBackgroundAndStroke(currentTime) {
  if (bucketChanged(currentTime)) {
    let album = getCurrentAlbum(currentTime);
    let colorList = albumsToColors[album];
    let bg = getRandomColor(colorList);
    let strokeC = getRandomColor(colorList);
    while (strokeC == bg) {
      strokeC = getRandomColor(colorList);
    }
    return {
      "strokeC": strokeC,
      "bg": bg,
    };
  }
}

function mousePressed() {
  if (!started) {
    started = true;
    userStartAudio();
  }
}

function draw() {
  if (!started) {
    textAlign(CENTER, CENTER);
    fill(255);
    text("Click to start", width/2, height/2);
    return;
  }

  if (dataArray == undefined) {
    console.log('In Draw data array dead');
    return;
  }

  noFill();

  bgAndStroke = getBackgroundAndStroke(sound.currentTime());
  if (bgAndStroke != undefined) {
    currentBg = bgAndStroke['bg'];
    currentStroke = bgAndStroke['strokeC'];
  }
  stroke(currentStroke);
  background(currentBg);
  strokeWeight(3);

  drawWave(dataArray, 0);
  // history.unshift(dataArray);
  // history = history.slice(0, 10);
  // for (let i = 0; i < 10; i++) {
  //   if (history.length <= i) {
  //     break;
  //   }
  //   arr = history[i]
  //   drawWave(arr, i);
  // }
}

function drawWave(arr, adjustment) {
  // stroke(255 - (adjustment * 20));
  beginShape();
  for (let i = 0; i < arr.length; i++) {
    let w = map(i, 0, arr.length, 1, width);
    let h = map(arr[i], -1, 1, height, 0);
    curveVertex(w + (adjustment * 20), h + (adjustment * 20));
  }
  endShape();
}