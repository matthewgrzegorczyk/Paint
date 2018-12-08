<template>
    <div class="paint-container">
        <div class="tool-bar">
            <ul class="tabs">
              <li @click="setActiveTab" :class="{ active: tabActive === 'basic' }" data-tab-name="basic">Basic</li>
              <li @click="setActiveTab" :class="{ active: tabActive === 'misc' }" data-tab-name="misc">Misc</li>
              <li @click="setActiveTab" :class="{ active: tabActive === 'converter' }" data-tab-name="converter">Color Converter</li>
              <li @click="setActiveTab" :class="{ active: tabActive === 'image' }" data-tab-name="image">Image</li>
            </ul>
            <div class="tabs-content">
              <li id="tab-basic" :class="{ active: tabActive === 'basic' }">
                <div class="tab-content">
                  <input type="text" name="color" v-model="color" />
                  <input type="color" name="color" v-model="color" />
                  <input type="range" name="line_width" v-model="line_width" min="1" max="10" step="1" />
                  <ul v-if="tools.length" class="shapes">
                      <li v-for="tool in tools" v-bind:key="tool.id" v-on:click="selectTool" v-bind:data-tool="tool.name">
                          {{ tool.display_name }}
                      </li>
                  </ul>
                </div>
              </li>
              <li id="tab-misc" :class="{ active: tabActive === 'misc' }">
                <div class="tab-content">
                  <div class="lineParameters">
                  <input type="number" placeholder="lineAx" v-model="lineAx">
                  <input type="number" placeholder="lineAy" v-model="lineAy">
                  <input type="number" placeholder="lineBx" v-model="lineBx">
                  <input type="number" placeholder="lineBy" v-model="lineBy">
                  <button @click="drawLineUsingParams">Draw Line</button>
                </div>
                <div class="circleParameters">
                  <input type="number" v-model="circleCenter.x">
                  <input type="number" v-model="circleCenter.y">
                  <input type="number" v-model="circleRadius">
                  <button @click="drawCircleUsingParams">Draw Circle</button>
                </div>
                <div class="rectangleParameters">
                  <input type="number" placeholder="rectX" v-model="rectX">
                  <input type="number" placeholder="rectY" v-model="rectY">
                  <input type="number" placeholder="rectWidth" v-model="rectWidth">
                  <input type="number" placeholder="rectHeight" v-model="rectHeight">
                  <button @click="drawRectUsingParams">Draw Rect</button>
                </div>
               </div>
              </li>
              <li :class="{ active: tabActive === 'converter' }">
                <div class="tab-content">
                  <Converter />
                </div>
              </li>
              <li :class="{ active: tabActive === 'image' }">
                <div class="tab-content">
                  <form action="" method="post" enctype="multipart/form-data">
                    <input type="file" name="image" @change="filesChange">
                  </form>
                  <div class="actions">
                    <button @click="smoothImage">Filtr wygladzajacy (usredniajacy)</button>
                    <button>Filtr medianowy</button>
                    <button>Filtr wykrywania krawedzi (sobel)</button>
                    <button>Dylatacja</button>
                    <button>Erozja</button>
                    <button @click="imageDraw">Image</button>
                  </div>
                  <div class="image-preview">
                    <img ref="preview" @load="onPreviewLoad">
                  </div>
                </div>
              </li>
            </div>
            <button @click="clearCanvas">Clear Canvas</button>
            <!-- <button @click="imageDraw">Draw Image</button> -->
        </div>
        <div class="canvas-container">
            <canvas v-bind:height="canvasHeight" v-bind:width="canvasWidth" id="main-canvas" class="main-canvas" ref="mainCanvas"></canvas>
            <canvas v-bind:height="canvasHeight" v-bind:width="canvasWidth" id="helper-canvas" class="helper-canvas" ref="helperCanvas" v-on:mousemove="onMouseMove" v-on:click="onMouseClick"></canvas>
        </div>
        <div class="cursor-position">
            Mouse position X: {{ mouse.position.x }} Y: {{ mouse.position.y }}
        </div>
    </div>
</template>


<script>
/*
TODO:
Przesuwanie oraz zmiana rozmiaru kszałtów.
*/

import Converter from "./Converter.vue";
import lena_img from "./../assets/len_full.jpg";
import _ from 'lodash';

export default {
  name: "paint",
  components: {
    Converter
  },
  data: function() {
    return {
      tabActive: "basic",
      activeTool: null,
      isDrawing: false,
      canvasWidth: 500,
      canvasHeight: 500,
      drawing: {
        points: []
      },
      tools: [
        { id: 1, name: "line", display_name: "Line" },
        { id: 2, name: "elipsis", display_name: "Elipsis" },
        { id: 3, name: "rect", display_name: "Rectangular" }
      ],
      mouse: {
        position: {
          x: 0,
          y: 0
        }
      },
      color: "#BADA55",
      line_width: 2,
      history: [],

      // Draw by parameters variables.
      lineAx: 0,
      lineAy: 0,
      lineBx: 0,
      lineBy: 0,

      circleCenter: {
        x: 0,
        y: 0
      },
      circleRadius: 0,

      rectX: 0,
      rectY: 0,
      rectWidth: 0,
      rectHeight: 0,
    };
  },
  methods: {
    smoothImage: function(event) {
      const mainCtx = this.$refs.mainCanvas.getContext("2d");
      const imgData = mainCtx.getImageData(
        0,
        0,
        this.canvasWidth,
        this.canvasHeight
      );
      let data = _.chunk(imgData.data, 4);
      console.log(data);

      // for (let y = 0; y <= this.canvasHeight; y++) {
      //   for (let x = 0; x <= this.canvasWidth; x++) {
      //     let pixelData = getPixelDataAt(imgData, x, y);

      //     if (x==2) {
      //       break;
      //     }
      //   }
      // }

      const finalImageData = new ImageData(
        Uint8ClampedArray.from(_.flatten(data)),
        this.canvasWidth,
        this.canvasHeight
      );
      mainCtx.putImageData(finalImageData, 0, 0);
    },
    setActiveTab: function(event) {
      this.tabActive = event.target.dataset.tabName;
    },
    filesChange: function(event, files) {
      const file = event.target.files[0];

      const reader = new FileReader();

      reader.addEventListener(
        'load',
        () => {
          this.loadImage(reader.result);
        },
        false
      );

      if (file) {
        reader.readAsDataURL(file);
      }
    },
    loadImage: function(src) {
      this.$refs.preview.src = src;
    },
    onPreviewLoad: function(event) {
      const imgWidth = this.$refs.preview.width;
      const imgHeight = this.$refs.preview.height;

      this.resizeCanvas(imgWidth, imgHeight);

      const mainCtx = this.$refs.mainCanvas.getContext("2d");
      
      mainCtx.drawImage(this.$refs.preview, 0, 0, imgWidth, imgHeight);
    },
    resizeCanvas: function(width, height) {
      this.canvasWidth = width;
      this.canvasHeight = height;
    },
    selectTool: function(event) {
      if (this.activeTool && this.activeTool !== event.target) {
        this.activeTool.classList.remove("active");
      }
      this.activeTool = event.target;
      this.activeTool.classList.add("active");

      this.drawing.points = [];
    },
    onMouseMove: function(event) {
      this.mouse.position = calculatePosition(event);

      const activeTool = this.getActiveTool();
      const canvas = event.target;
      const ctx = canvas.getContext("2d");
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.fillStyle = this.color;
      clearCanvas(canvas);
      const mainCtx = this.$refs.mainCanvas.getContext("2d");
      // console.log(
      //   mainCtx.isPointInPath(this.mouse.position.x, this.mouse.position.y)
      // );

      if (this.isDrawing) {
        switch (activeTool) {
          case "line":
            if (this.drawing.points.length >= 1) {
              const line = drawLine(
                this.drawing.points[0],
                this.mouse.position
              );
              ctx.stroke(line);
            }
            // console.log(this.drawing.points[0], this.mouse.position);
            break;
          case "elipsis":
            const radius = distance(
              this.drawing.points[0],
              this.mouse.position
            );
            drawCircle(ctx, this.drawing.points[0], radius, "stroke");
            break;
          case "rect":
            drawRect(
              ctx,
              this.drawing.points[0],
              this.mouse.position,
              "stroke"
            );
            break;
          default:
            break;
        }
      }
    },
    onMouseClick: function(event) {
      const position = calculatePosition(event);

      const activeTool = this.getActiveTool();
      const mainCtx = this.$refs.mainCanvas.getContext("2d");
      mainCtx.lineWidth = this.line_width;
      mainCtx.strokeStyle = this.color;
      mainCtx.fillStyle = this.color;

      if (activeTool !== null) {
        this.isDrawing = true;
      } else {
        this.isDrawing = false;
      }

      switch (activeTool) {
        case "line":
          this.drawing.points.push(position); // Set starting point.

          if (this.drawing.points.length >= 2) {
            const line = drawLine(
              this.drawing.points[0],
              this.drawing.points[1]
            );
            mainCtx.stroke(line);

            this.drawing.points = [];
            this.isDrawing = false;
          }
          break;
        case "elipsis":
          this.drawing.points.push(position);

          if (this.drawing.points.length >= 2) {
            const radius = distance(
              this.drawing.points[0],
              this.drawing.points[1]
            );
            drawCircle(mainCtx, this.drawing.points[0], radius, "fill");

            this.drawing.points = [];
            this.isDrawing = false;
          }
          break;
        case "rect":
          this.drawing.points.push(position);

          if (this.drawing.points.length >= 2) {
            drawRect(
              mainCtx,
              this.drawing.points[0],
              this.drawing.points[1],
              "fill"
            );

            this.drawing.points = [];
            this.isDrawing = false;
          }
          break;
        default:
          break;
      }
    },
    getActiveTool: function() {
      return this.activeTool ? this.activeTool.dataset.tool : null;
    },
    clearCanvas: function() {
      clearCanvas(this.$refs.mainCanvas);
    },
    imageDraw: function() {
      this.loadImage(lena_img);
    },
    drawLineUsingParams: function() {
      const line = drawLine(
        { x: this.lineAx, y: this.lineAy },
        { x: this.lineBx, y: this.lineBy }
      );
      console.log(file);

      const mainCtx = this.$refs.mainCanvas.getContext("2d");
      mainCtx.fillStyle = this.color;
      mainCtx.strokeStyle = this.color;
      mainCtx.stroke(line);
    },
    drawCircleUsingParams: function() {
      const mainCtx = this.$refs.mainCanvas.getContext("2d");
      mainCtx.fillStyle = this.color;
      mainCtx.strokeStyle = this.color;
      drawCircle(
        mainCtx,
        { x: this.circleCenter.x, y: this.circleCenter.y },
        this.circleRadius,
        "fill"
      );
      console.log(
        mainCtx,
        { x: this.circleCenter.x, y: this.circleCenter.y },
        this.circleRadius
      );
    },
    drawRectUsingParams: function() {
      const mainCtx = this.$refs.mainCanvas.getContext("2d");
      mainCtx.fillStyle = this.color;
      mainCtx.strokeStyle = this.color;
      drawRect(
        mainCtx,
        { x: this.rectX, y: this.rectY },
        { x: this.rectX + this.rectWidth, y: this.rectY + this.rectWidth },
        "fill"
      );
    }
  }
};

function calculatePosition(event) {
  const rect = event.target.getBoundingClientRect();
  return {
    x: event.x - rect.left,
    y: event.y - rect.top
  };
}

function distance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function clearCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawLine(a, b) {
  const line = new Path2D();
  line.moveTo(a.x, a.y);
  line.lineTo(b.x, b.y);

  return line;
}

function drawRect(ctx, a, b, mode) {
  const width = b.x - a.x;
  const height = b.y - a.y;

  if (mode === "fill") {
    ctx.fillRect(a.x, a.y, width, height);
    ctx.strokeRect(a.x, a.y, width, height);
  } else if (mode === "stroke") {
    ctx.strokeRect(a.x, a.y, width, height);
  }
}

function drawCircle(ctx, a, radius, mode) {
  ctx.beginPath();
  ctx.arc(a.x, a.y, radius, 0, Math.PI * 2, true);
  ctx.closePath();

  if (mode === "fill") {
    ctx.fill();
    ctx.stroke();
  } else if (mode === "stroke") {
    ctx.stroke();
  }
}

function getPixelData(imgData, offset = 0) {
  return imgData.slice(offset, offset + 4);
}

function getPixelDataAt(imgData, x, y) {
  const offset = x * 4 + y * 4;
  return getPixelData(imgData.data, offset);
}

function setPixelData(imgData, offset = 0) {
  return imgData.splice.apply(this, [offset, 4].concat(Array.slice.call(arguments, 1)));
}

function setPixelDataAt(imgData, x, y) {
  const offset = x * 4 + y * 4;
  return setPixelData(imgData.data, offset);
}
</script>


<style lang="scss">
.paint-container {
  padding: 1rem;
}
.tabs,
.shapes {
  margin: 0;
  padding: 0;

  li {
    cursor: pointer;
    list-style: none;

    &.active {
      font-weight: 700;
    }
  }
}

.tabs {
  li {
    display: inline-block;
    margin-right: 1rem;

    &:last-child {
      margin-right: 0;
    }
  }
}
.tabs-content > li {
  display: none;

  &.active {
    display: block;
  }
}

.image-preview {
  max-height: 300px;
  max-width: 300px;
  overflow: hidden;
  border: 1px solid #000;
  display: inline-flex;

  img {
    max-height: 100%;
    max-width: 100%;
    height: auto;
    width: auto;
  }
}

.canvas-container {
  position: relative;
  text-align: left;
  display: inline-flex;
  border: 2px solid red;
  margin: 0;
  padding: 0;

  canvas {
    margin: 0;
    padding: 0;

    &:hover {
      cursor: pointer;
    }
  }

  canvas.helper-canvas {
    position: absolute;
    left: 0;
    top: 0;
  }
}
</style>