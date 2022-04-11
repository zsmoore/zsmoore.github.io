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
  console.log('start');
  let autoCorrelation = correlate(samples);
  console.log(autoCorrelation);
  let normalized = maxAbsoluteScaling(autoCorrelation);
  console.log(normalized);
  let freq = getFrequency(normalized, sampleRate);
  return {
    'freq': freq,
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
function preload() {
  sound = loadSound('assets/gizz.mp4', onSoundLoadSuccess, onSoundLoadError, onSoundLoadProgress);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();

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

function draw() {
  if (dataArray == undefined) {
    return;
  }

  background(1);
  strokeWeight(3);
  stroke(0);

  beginShape();
  for (let i = 0; i < dataArray.length; i++) {
    let w = map(i, 0, dataArray.length, 1, width);
    let h = map(dataArray[i], -1, 1, height, 0);
    curveVertex(w, h);
  }
  endShape();
}