var dataArray;

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
  93.7,
  100.2,
  102.75,
  110.5,
  119.75,
  127.5,
  133.5,
  144.75,
  149.5,
  153.5,
  157,
  167.4,
  168,
  169,
  173.8,
  177.8,
  181.5,
  190.7,
  195.5,
  203.8
];

// let albumsToColors = {
//   "12BarBruise": ['#2Bfb4f', '#c54835', '#e2c743', '#172119', '#e48550', '#ce4b3d', '#457D58'],
//   "EyesLikeSky": ['#d6bc63', '#faf2d1', '#a38d5a', '#272720', '#caa53a', '#cfa948', '#f5eac5'],
//   "FloatAlongFill": ['#d3c6df', '#e87e3c', '#cbda65', '#e07239', '#e3cc4c','#76a54b', '#6d6736'],
//   "Default": ['#fb4934', '#b8bb26', '#fabd2f', '#83a598', '#d3869b', '#8ec07c', '#fe8019', '#282828', '#fbf1c7']
// }

let albumToRGBColors = {
  "12BarBruise": [
    [46, 61, 37],
    [201, 66, 49],
    [194, 195, 112],
    [105, 68, 44],
    [196, 133, 89],
    [144, 61, 42],
    [56, 179, 151],
    [210, 229, 202],
    [186, 104, 110],
    [172, 140, 156], 
    [190, 73, 53]
  ],
  "EyesLikeSky": [
    [50, 41, 21],
    [46, 61, 37],
    [201, 66, 49],
    [194, 195, 112],
    [105, 68, 44],
    [196, 133, 89],
    [144, 61, 42],
    [56, 179, 151],
    [210, 229, 202],
    [186, 104, 11], 
    [172, 140, 156]
  ],
  "FloatAlongFill" :  [
    [211, 196, 54],
    [28, 71, 34],
    [101, 162, 65],
    [149, 81, 32],
    [210, 116, 39],
    [222, 195, 212],
    [44, 170, 74],
    [144, 183, 67],
    [222, 182, 126],
    [64, 176, 100], 
    [205, 175, 53]
  ],
  "Oddments" :  [
    [160, 136, 105],
    [49, 58, 51],
    [236, 204, 87],
    [221, 164, 95],
    [88, 123, 114],
    [95, 48, 34],
    [139, 102, 32],
    [159, 84, 80],
    [173, 183, 189],
    [64, 156, 163], 
    [152, 129, 98]
  ],
  "ImInYourMind" :  [
    [99, 182, 96],
    [193, 207, 173],
    [19, 35, 21],
    [192, 54, 56],
    [118, 82, 68],
    [66, 112, 64],
    [68, 60, 43],
    [136, 143, 142],
    [145, 186, 173],
    [58, 80, 76], 
    [25, 41, 25]
  ],
  "Default" : [
    [0, 0, 0],
    [255, 255, 255]
  ]
}
        
let lastBucket = 0;
let albumStart = [
  ["12BarBruise", 9.5],
  ["EyesLikeSky", 44.5],
  ["FloatAlongFill", 77.9],
  ["Oddments", 110.75],
  ["ImInYourMind", 157],
  ["Default", 204],
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
let started = false;
function onSoundLoadSuccess(e){
  analyser = getAudioContext().createAnalyser();
  analyser.fftSize = 4096;
  analyser.smoothingTimeConstant = .2;

  getAudioContext().audioWorklet.addModule('processor.js').then(() => {
    registerProcessor('processor-node', ProcessorNode);
    let node = new ProcessorNode(getAudioContext());
    sound.connect(analyser);
    analyser.connect(node);
  });

  // let processorNode = getAudioContext().createScriptProcessor(4096, 1, 1);
  // processorNode.onaudioprocess = () => {
  //   self.spectrum = new Float32Array(4096);
  //   analyser.getFloatTimeDomainData(self.spectrum);
  //   dataArray = getFrequencyAndNormalizedData(self.spectrum, sound.sampleRate())['normalizeData']
  // }
  // sound.connect(analyser);
  // analyser.connect(processorNode);
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

let currentBg = [0, 0, 0];
let currentStroke = [255, 255, 255];
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
    let colorList = albumToRGBColors[album];
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
    sound.play();
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
  stroke(currentStroke[0], currentStroke[1], currentStroke[2]);
  background(currentBg[0], currentBg[1], currentBg[2]);
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