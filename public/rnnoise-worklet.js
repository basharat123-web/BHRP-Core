/**
 * RNNoise AudioWorklet Processor
 * Discord-style ML noise suppression using the RNNoise model by Mozilla/Xiph.
 */

const RNNOISE_FRAME_SIZE = 480;

class RNNoiseProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._initialized = false;
    this._rnnoiseModule = null;
    this._denoiseState = null;
    this._inputBuffer = new Float32Array(RNNOISE_FRAME_SIZE);
    this._inputBufferIndex = 0;
    this._outputBuffer = new Float32Array(RNNOISE_FRAME_SIZE);

    this.port.onmessage = (event) => {
      if (event.data.type === 'destroy') this._cleanup();
    };

    this._loadRNNoise();
  }

  _loadRNNoise() {
    try {
      importScripts('/rnnoise-sync.js');
      // createRNNWasmModuleSync is a global after importScripts
      const module = createRNNWasmModuleSync();
      this._rnnoiseModule = module;
      this._denoiseState = module._rnnoise_create(0);
      this._initialized = true;
    } catch (err) {
      console.error('[RNNoise Worklet] Failed to load WASM:', err);
    }
  }

  _cleanup() {
    if (this._rnnoiseModule && this._denoiseState) {
      this._rnnoiseModule._rnnoise_destroy(this._denoiseState);
      this._denoiseState = null;
    }
  }

  _processFrame(inputFrame) {
    const m = this._rnnoiseModule;
    const s = this._denoiseState;
    const inputPtr = m._malloc(RNNOISE_FRAME_SIZE * 4);
    const outputPtr = m._malloc(RNNOISE_FRAME_SIZE * 4);
    const scaled = new Float32Array(RNNOISE_FRAME_SIZE);
    for (let i = 0; i < RNNOISE_FRAME_SIZE; i++) scaled[i] = inputFrame[i] * 32768;
    m.HEAPF32.set(scaled, inputPtr / 4);
    m._rnnoise_process_frame(s, outputPtr, inputPtr);
    const out = new Float32Array(RNNOISE_FRAME_SIZE);
    for (let i = 0; i < RNNOISE_FRAME_SIZE; i++) out[i] = m.HEAPF32[outputPtr / 4 + i] / 32768;
    m._free(inputPtr);
    m._free(outputPtr);
    return out;
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input || !input[0] || !input[0].length) return true;
    const inCh = input[0];
    const outCh = output[0];

    if (!this._initialized) { outCh.set(inCh); return true; }

    let idx = 0;
    while (idx < inCh.length) {
      const toCopy = Math.min(RNNOISE_FRAME_SIZE - this._inputBufferIndex, inCh.length - idx);
      this._inputBuffer.set(inCh.subarray(idx, idx + toCopy), this._inputBufferIndex);
      this._inputBufferIndex += toCopy;
      idx += toCopy;
      if (this._inputBufferIndex === RNNOISE_FRAME_SIZE) {
        this._outputBuffer.set(this._processFrame(this._inputBuffer));
        this._inputBufferIndex = 0;
      }
    }
    outCh.set(this._outputBuffer.subarray(0, outCh.length));
    return true;
  }
}

registerProcessor('rnnoise-processor', RNNoiseProcessor);
