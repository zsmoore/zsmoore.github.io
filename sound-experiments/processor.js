class ProcessorNode extends AudioWorkletProcessor {
  constructor(context) {
    super(context, 'processor-node');
  }

  static get parameterDescriptors() {
    return [{
      name: 'data',
      defaultValue: 0.7
    }];
  }

  process(inputs, outputs, parameters) {
    console.log(inputs);
    console.log(outputs);
    const vals = parameters.data;
    if (vals.length !== 1) {
      this.dataArray = vals;
    }

    return true;
  }
}

registerProcessor('processor-node', ProcessorNode);