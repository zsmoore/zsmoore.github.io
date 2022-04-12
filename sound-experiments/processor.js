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
    const vals = parameters.data;
    console.log(parameters);
    if (vals.length !== 1) {
      dataArray = vals;
    }

    return true;
  }
}

registerProcessor('processor-node', ProcessorNode);