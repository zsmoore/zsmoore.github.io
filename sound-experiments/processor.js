class Processor extends AudioWorkletProcessor {
  process (inputs, outputs, parameters) {
    // this is awful but im not setting up import exports
    dataArray = inputs[0];
  }
}

registerProcessor('processor', Processor);