<template>
  <div class="demo">
    <v-progress-circular v-if="modelLoading && loadingProgress < 100" indeterminate color="primary" />
    <div class="loading-progress" v-if="modelLoading && loadingProgress < 100">Loading...{{ loadingProgress }}%</div>
    <v-layout v-if="!modelLoading" row wrap justify-center>
      <v-flex sm6 md4>
        <div class="input-column">
          <div class="input-container">
            <div class="input-label">Draw any digit (0-9) here <span class="arrow">⤸</span></div>
            <div class="canvas-container">
              <canvas
                id="input-canvas" width="240" height="240"
                @mousedown="activateDraw"
                @mouseup="deactivateDrawAndPredict"
                @mouseleave="deactivateDrawAndPredict"
                @mousemove="draw"
                @touchstart="activateDraw"
                @touchend="deactivateDrawAndPredict"
                @touchmove="draw"
              ></canvas>
              <canvas id="input-canvas-scaled" width="28" height="28" style="display:none;"></canvas>
              <canvas id="input-canvas-centercrop" style="display:none;"></canvas>
            </div>
          </div>
        </div>
      </v-flex>
      <v-flex sm2 md1>
        <div class="controls-column">
          <div class="control">
            <v-switch label="use GPU" v-model="useGPU" :disabled="modelLoading || !hasWebGL" color="primary"></v-switch>
          </div>
          <div class="control">
            <v-btn flat bottom right color="primary" @click="clear"><v-icon left>close</v-icon>Clear</v-btn>
          </div>
        </div>
      </v-flex>
      <v-flex sm8 md4>
        <div class="output-column">
          <div class="output">
            <div class="output-class"
              :class="{ predicted: i === predictedClass }"
              v-for="i in outputClasses"
              :key="`output-class-${i}`"
            >
              <div class="output-label">{{ i }}</div>
              <div class="output-bar"
                :style="{ height: `${Math.round(100 * output[i])}px`, background: `rgba(27, 188, 155, ${output[i].toFixed(2)})` }"
              ></div>
            </div>
          </div>
        </div>
      </v-flex>
    </v-layout>
    <div class="layer-outputs-container" v-if="!modelLoading">
      <div class="bg-line"></div>
      <div
        v-for="(layerOutput, layerIndex) in layerOutputImages"
        :key="`intermediate-output-${layerIndex}`"
        class="layer-output"
      >
        <div class="layer-output-heading">
          <span class="layer-class">{{ layerOutput.layerClass }}</span>
          <span> {{ layerDisplayConfig[layerOutput.name].heading }}</span>
        </div>
        <div class="layer-output-canvas-container">
          <canvas v-for="(image, index) in layerOutput.images"
            :key="`intermediate-output-${layerIndex}-${index}`"
            :id="`intermediate-output-${layerIndex}-${index}`"
            :width="image.width"
            :height="image.height"
            style="display:none;"
          ></canvas>
          <canvas v-for="(image, index) in layerOutput.images"
            :key="`intermediate-output-${layerIndex}-${index}-scaled`"
            :id="`intermediate-output-${layerIndex}-${index}-scaled`"
            :width="layerDisplayConfig[layerOutput.name].scalingFactor * image.width"
            :height="layerDisplayConfig[layerOutput.name].scalingFactor * image.height"
          ></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import * as KerasJS from '../../../../src'
import * as utils from '../../utils'

const MODEL_FILEPATH_PROD = 'https://transcranial.github.io/keras-js-demos-data/mnist_cnn/mnist_cnn.bin'
const MODEL_FILEPATH_DEV = '/demos/data/mnist_cnn/mnist_cnn.bin'

const LAYER_DISPLAY_CONFIG = {
  conv2d_1: { heading: '32 3x3 filters, padding valid, 1x1 strides', scalingFactor: 2 },
  activation_1: { heading: 'ReLU', scalingFactor: 2 },
  conv2d_2: { heading: '32 3x3 filters, padding valid, 1x1 strides', scalingFactor: 2 },
  activation_2: { heading: 'ReLU', scalingFactor: 2 },
  max_pooling2d_1: { heading: '2x2 pooling, 1x1 strides', scalingFactor: 2 },
  dropout_1: { heading: 'p=0.25 (only active during training phase)', scalingFactor: 2 },
  flatten_1: { heading: '', scalingFactor: 2 },
  dense_1: { heading: 'output dimensions 128', scalingFactor: 4 },
  activation_3: { heading: 'ReLU', scalingFactor: 4 },
  dropout_2: { heading: 'p=0.5 (only active during training phase)', scalingFactor: 4 },
  dense_2: { heading: 'output dimensions 10', scalingFactor: 8 },
  activation_4: { heading: 'Softmax', scalingFactor: 8 }
}

export default {
  props: ['hasWebGL'],

  created() {
    // store module on component instance as non-reactive object
    this.model = new KerasJS.Model({
      filepath: process.env.NODE_ENV === 'production' ? MODEL_FILEPATH_PROD : MODEL_FILEPATH_DEV,
      gpu: this.hasWebGL,
      transferLayerOutputs: true
    })
  },

  async mounted() {
    await this.model.ready()
    this.modelLoading = false
    this.$nextTick(() => {
      this.getIntermediateOutputs()
    })
  },

  beforeDestroy() {
    this.model.cleanup()
  },

  data() {
    return {
      useGPU: this.hasWebGL,
      modelLoading: true,
      input: new Float32Array(784),
      output: new Float32Array(10),
      outputClasses: _.range(10),
      layerOutputImages: [],
      layerDisplayConfig: LAYER_DISPLAY_CONFIG,
      drawing: false,
      strokes: []
    }
  },

  computed: {
    loadingProgress() {
      return this.model.getLoadingProgress()
    },
    predictedClass() {
      if (this.output.reduce((a, b) => a + b, 0) === 0) {
        return -1
      }
      return this.output.reduce((argmax, n, i) => (n > this.output[argmax] ? i : argmax), 0)
    }
  },

  watch: {
    useGPU(value) {
      this.model.toggleGPU(value)
    }
  },

  methods: {
    clear() {
      this.clearIntermediateOutputs()
      const ctx = document.getElementById('input-canvas').getContext('2d')
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      const ctxCenterCrop = document.getElementById('input-canvas-centercrop').getContext('2d')
      ctxCenterCrop.clearRect(0, 0, ctxCenterCrop.canvas.width, ctxCenterCrop.canvas.height)
      const ctxScaled = document.getElementById('input-canvas-scaled').getContext('2d')
      ctxScaled.clearRect(0, 0, ctxScaled.canvas.width, ctxScaled.canvas.height)
      this.output = new Float32Array(10)
      this.drawing = false
      this.strokes = []
    },
    activateDraw(e) {
      this.drawing = true
      this.strokes.push([])
      let points = this.strokes[this.strokes.length - 1]
      points.push(utils.getCoordinates(e))
    },
    draw(e) {
      if (!this.drawing) return

      const ctx = document.getElementById('input-canvas').getContext('2d')

      ctx.lineWidth = 20
      ctx.lineJoin = ctx.lineCap = 'round'
      ctx.strokeStyle = '#393E46'

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      let points = this.strokes[this.strokes.length - 1]
      points.push(utils.getCoordinates(e))

      // draw individual strokes
      for (let s = 0, slen = this.strokes.length; s < slen; s++) {
        points = this.strokes[s]

        let p1 = points[0]
        let p2 = points[1]
        ctx.beginPath()
        ctx.moveTo(...p1)

        // draw points in stroke
        // quadratic bezier curve
        for (let i = 1, len = points.length; i < len; i++) {
          ctx.quadraticCurveTo(...p1, ...utils.getMidpoint(p1, p2))
          p1 = points[i]
          p2 = points[i + 1]
        }
        ctx.lineTo(...p1)
        ctx.stroke()
      }
    },
    deactivateDrawAndPredict: _.debounce(
      function() {
        if (!this.drawing) return
        this.drawing = false

        const ctx = document.getElementById('input-canvas').getContext('2d')

        // center crop
        const imageDataCenterCrop = utils.centerCrop(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height))
        const ctxCenterCrop = document.getElementById('input-canvas-centercrop').getContext('2d')
        ctxCenterCrop.canvas.width = imageDataCenterCrop.width
        ctxCenterCrop.canvas.height = imageDataCenterCrop.height
        ctxCenterCrop.putImageData(imageDataCenterCrop, 0, 0)

        // scaled to 28 x 28
        const ctxScaled = document.getElementById('input-canvas-scaled').getContext('2d')
        ctxScaled.save()
        ctxScaled.scale(28 / ctxCenterCrop.canvas.width, 28 / ctxCenterCrop.canvas.height)
        ctxScaled.clearRect(0, 0, ctxCenterCrop.canvas.width, ctxCenterCrop.canvas.height)
        ctxScaled.drawImage(document.getElementById('input-canvas-centercrop'), 0, 0)
        const imageDataScaled = ctxScaled.getImageData(0, 0, ctxScaled.canvas.width, ctxScaled.canvas.height)
        ctxScaled.restore()

        // process image data for model input
        const { data } = imageDataScaled
        this.input = new Float32Array(784)
        for (let i = 0, len = data.length; i < len; i += 4) {
          this.input[i / 4] = data[i + 3] / 255
        }

        this.model.predict({ input: this.input }).then(outputData => {
          this.output = outputData.output
          this.getIntermediateOutputs()
        })
      },
      200,
      { leading: true, trailing: true }
    ),
    getIntermediateOutputs() {
      const outputs = []
      this.model.modelLayersMap.forEach((layer, name) => {
        if (name === 'input') return
        let images = []
        if (layer.hasOutput && layer.output && layer.output.tensor.shape.length === 3) {
          images = utils.unroll3Dtensor(layer.output.tensor)
        } else if (layer.hasOutput && layer.output && layer.output.tensor.shape.length === 2) {
          images = [utils.image2Dtensor(layer.output.tensor)]
        } else if (layer.hasOutput && layer.output && layer.output.tensor.shape.length === 1) {
          images = [utils.image1Dtensor(layer.output.tensor)]
        }
        outputs.push({ layerClass: layer.layerClass || '', name, images })
      })
      this.layerOutputImages = outputs
      setTimeout(() => {
        this.showIntermediateOutputs()
      }, 0)
    },
    showIntermediateOutputs() {
      this.layerOutputImages.forEach((output, layerNum) => {
        const scalingFactor = this.layerDisplayConfig[output.name].scalingFactor
        output.images.forEach((image, imageNum) => {
          const ctx = document.getElementById(`intermediate-output-${layerNum}-${imageNum}`).getContext('2d')
          ctx.putImageData(image, 0, 0)
          const ctxScaled = document
            .getElementById(`intermediate-output-${layerNum}-${imageNum}-scaled`)
            .getContext('2d')
          ctxScaled.save()
          ctxScaled.scale(scalingFactor, scalingFactor)
          ctxScaled.clearRect(0, 0, ctxScaled.canvas.width, ctxScaled.canvas.height)
          ctxScaled.drawImage(document.getElementById(`intermediate-output-${layerNum}-${imageNum}`), 0, 0)
          ctxScaled.restore()
        })
      })
    },
    clearIntermediateOutputs() {
      this.layerOutputImages.forEach((output, layerNum) => {
        const scalingFactor = this.layerDisplayConfig[output.name].scalingFactor
        output.images.forEach((image, imageNum) => {
          const ctxScaled = document
            .getElementById(`intermediate-output-${layerNum}-${imageNum}-scaled`)
            .getContext('2d')
          ctxScaled.save()
          ctxScaled.scale(scalingFactor, scalingFactor)
          ctxScaled.clearRect(0, 0, ctxScaled.canvas.width, ctxScaled.canvas.height)
          ctxScaled.restore()
        })
      })
    }
  }
}
</script>

<style scoped lang="postcss">
@import '../../variables.css';

.input-column {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  & .input-container {
    width: 100%;
    text-align: right;
    margin: 20px;
    position: relative;
    user-select: none;

    & .input-label {
      font-family: var(--font-cursive);
      font-size: 18px;
      color: var(--color-lightgray);
      text-align: right;

      & span.arrow {
        font-size: 36px;
        color: #cccccc;
        position: absolute;
        right: -32px;
        top: 8px;
      }
    }

    & .canvas-container {
      display: inline-flex;
      justify-content: flex-end;
      margin: 10px 0;
      border: 15px solid var(--color-green-lighter);
      transition: border-color 0.2s ease-in;

      &:hover {
        border-color: var(--color-green-light);
      }

      & canvas {
        background: whitesmoke;

        &:hover {
          cursor: crosshair;
        }
      }
    }
  }
}

.controls-column {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-monospace);
  padding-top: 80px;

  & .control {
    width: 100px;
    margin: 10px 0;
  }
}

.output-column {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 40px;

  & .output {
    height: 160px;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: center;
    user-select: none;
    cursor: default;

    & .output-class {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 6px;
      border-bottom: 2px solid var(--color-green-lighter);

      & .output-label {
        font-family: var(--font-monospace);
        font-size: 1.5rem;
        color: var(--color-lightgray);
      }

      & .output-bar {
        width: 8px;
        background: #eeeeee;
        transition: height 0.2s ease-out;
      }
    }

    & .output-class.predicted {
      border-bottom-color: var(--color-green);

      & .output-label {
        color: var(--color-green);
      }
    }
  }
}

.layer-outputs-container {
  position: relative;

  & .bg-line {
    position: absolute;
    z-index: 0;
    top: 0;
    left: 50%;
    background: whitesmoke;
    width: 15px;
    height: 100%;
  }

  & .layer-output {
    position: relative;
    z-index: 1;
    margin: 30px 20px;
    background: whitesmoke;
    border-radius: 10px;
    padding: 20px;
    overflow-x: auto;

    & .layer-output-heading {
      font-size: 1rem;
      color: #999999;
      margin-bottom: 10px;
      display: flex;
      flex-direction: column;
      font-size: 12px;

      & span.layer-class {
        color: var(--color-green);
        font-size: 14px;
        font-weight: bold;
      }
    }

    & .layer-output-canvas-container {
      display: inline-flex;
      flex-wrap: wrap;
      background: whitesmoke;

      & canvas {
        border: 1px solid lightgray;
        margin: 1px;
      }
    }
  }
}
</style>
