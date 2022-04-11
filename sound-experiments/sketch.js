let swaps = [
  9,
  15,
  19.5,
  21,
  24.5,
  29.5,
  34.5,
  43,
  52,
  62,

];

let lastBucket = 0;
function bucketChanged(currentTime) {
  for (let i = 0; i < swaps.length; i++) {
    if (currentTime > swaps[i]) {
      if (i != swaps.length - 1 && currentTime > swaps[i+1]) {
        continue;
      } else {
        if (swaps[i] != lastBucket) {
          console.log('updating bucket');
          lastBucket = swaps[i];
          return true;
        } else {
          console.log('not updating bucket');
          return false;
        }
      }
      console.log('time greator');
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

function onSoundLoadSuccess(e){
  console.log("load sound success",e);
}
function onSoundLoadError(e){
  console.log("load sound error",e);
}
function onSoundLoadProgress(e){
  console.log("load sound progress",e);
}


let sound;
let analyser;
let dataArray;
let history = [];
function preload() {
  sound = loadSound('assets/gizz.mp4', onSoundLoadSuccess, onSoundLoadError, onSoundLoadProgress);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();
  background(1);
  stroke(255);

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
}

let colors = [
  '#fb4934',
  '#b8bb26',
  '#fabd2f',
  '#83a598',
  '#d3869b',
  '#8ec07c',
  '#fe8019',
  '#282828',
  '#fbf1c7',
];

function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function getBackgroundAndStroke(currentTime) {
  if (bucketChanged(currentTime)) {
    let bg = getRandomColor();
    let strokeC = getRandomColor();;
    while (strokeC == bg) {
      strokeC = getRandomColor();
    }
    return {
      "strokeC": strokeC,
      "bg": bg
    };
  }
}

function draw() {
  if (dataArray == undefined) {
    console.log('In Draw data array dead');
    return;
  }
  clear();

  bgAndStroke = getBackgroundAndStroke(getAudioContext().currentTime);
  if (bgAndStroke != undefined) {
    stroke(bgAndStroke['strokeC']);
    background(bgAndStroke['bg']);
  }
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