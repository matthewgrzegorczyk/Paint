<template>
  <div class="paint-container">
    <div class="tool-bar">
      <ul class="tabs">
        <li
          @click="setActiveTab"
          :class="{ active: tabActive === 'basic' }"
          data-tab-name="basic"
        >Basic</li>
        <li
          @click="setActiveTab"
          :class="{ active: tabActive === 'misc' }"
          data-tab-name="misc"
        >Misc</li>
        <li
          @click="setActiveTab"
          :class="{ active: tabActive === 'converter' }"
          data-tab-name="converter"
        >Color Converter</li>
        <li
          @click="setActiveTab"
          :class="{ active: tabActive === 'image' }"
          data-tab-name="image"
        >Image</li>
        <li
          @click="setActiveTab"
          :class="{ active: tabActive === 'bezier' }"
          data-tab-name="bezier"
        >Bezier</li>
      </ul>
      <div class="tabs-content">
        <li id="tab-basic" :class="{ active: tabActive === 'basic' }">
          <div class="tab-content">
            <input type="text" name="color" v-model="color">
            <input type="color" name="color" v-model="color">
            <input type="range" name="line_width" v-model="line_width" min="1" max="10" step="1">
            <ul v-if="tools.length" class="shapes">
              <li
                v-for="tool in tools"
                v-bind:key="tool.id"
                v-on:click="selectTool"
                v-bind:data-tool="tool.name"
              >{{ tool.display_name }}</li>
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
            <Converter/>
          </div>
        </li>
        <li :class="{ active: tabActive === 'image' }">
          <div class="tab-content">
            <form action method="post" enctype="multipart/form-data">
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
          </div>
        </li>
        <li :class="{ active: tabActive === 'bezier' }">
          <div class="tab-content">
            <div>
              P1
              <input placeholder="P0.X" type="text" v-model="bezierPoints[0].x">
              <input placeholder="P0.Y" type="text" v-model="bezierPoints[0].y">
            </div>
            <div>
              P2
              <input placeholder="P1.X" type="text" v-model="bezierPoints[1].x">
              <input placeholder="P1.Y" type="text" v-model="bezierPoints[1].y">
            </div>
            <div>
              P3
              <input placeholder="P2.X" type="text" v-model="bezierPoints[2].x">
              <input placeholder="P2.Y" type="text" v-model="bezierPoints[2].y">
            </div>
            <div>
              P4
              <input placeholder="P3.X" type="text" v-model="bezierPoints[3].x">
              <input placeholder="P3.Y" type="text" v-model="bezierPoints[3].y">
            </div>
            <button @click="drawBezier">Draw bezier</button>
          </div>
        </li>
      </div>
      <button @click="clearCanvas">Clear Canvas</button>
      <!-- <button @click="imageDraw">Draw Image</button> -->
    </div>
    <div class="image-preview">
      <img ref="preview" @load="onPreviewLoad">
    </div>
    <div class="canvas-container">
      <canvas
        v-bind:height="canvasHeight"
        v-bind:width="canvasWidth"
        id="main-canvas"
        class="main-canvas"
        ref="mainCanvas"
      ></canvas>
      <canvas
        v-bind:height="canvasHeight"
        v-bind:width="canvasWidth"
        id="helper-canvas"
        class="helper-canvas"
        ref="helperCanvas"
        v-on:mousemove="onMouseMove"
        v-on:click="onMouseClick"
        v-on:contextmenu="getContextMenu"
      ></canvas>
    </div>
    <div class="cursor-position">Mouse position X: {{ mouse.position.x }} Y: {{ mouse.position.y }}</div>
  </div>
</template>


<script>
import Converter from "./Converter.vue";
import lena_full from "./../assets/len_full.jpg";
import lena_std from "./../assets/len_std.jpg";
import { Bezier, Circle } from "./../helpers";
import _ from "lodash";

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
        { id: 0, name: "select", display_name: "Select" },
        { id: 1, name: "line", display_name: "Line" },
        { id: 2, name: "elipsis", display_name: "Elipsis" },
        { id: 3, name: "rect", display_name: "Rectangular" },
        { id: 4, name: "bezier", display_name: "Bezier" },
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
      bezierPoints: [
        {x: 0, y: 0},
        {x: 0, y: 0},
        {x: 0, y: 0},
        {x: 0, y: 0},
      ],
      selectedBezier: null,
    };
  },
  methods: {
    getContextMenu: function(event) {
      event.preventDefault();
    },
    smoothImage: function(event) {
      const mainCtx = this.$refs.mainCanvas.getContext("2d");
      const imgData = mainCtx.getImageData(
        0,
        0,
        this.canvasWidth,
        this.canvasHeight
      );


      console.log(imgData);

      // console.log(_.chunk(imgData.data, 4));

      // Parametry filtru wygladzajacego
      
      const masks = {
        smooth: [
          1, 1, 1,
          1, 1, 1,
          1, 1, 1,
        ],
        sobel: [
          -1, -2, -1,
          0, 0, 0,
          1, 2, 1,
        ],
      };

      const mask = masks.sobel;
      const maskSize = Math.sqrt(mask.length);

      const skip = Math.floor(maskSize / 2);

      for (let y = 0; y < this.canvasHeight; y++) {
        // Pomijanie krawedzi maski
        if (y < skip || y > this.canvasHeight - skip) {
          continue;
        }
        for (let x = 0; x < this.canvasWidth; x++) {
          // Pomijanie krawedzi maski
          if (x < skip || x > this.canvasWidth - skip) {
            continue;
          }

          // Maska
          let pixels = [];
          for (let i = -skip; i <= skip; i++) {
            for (let j = -skip; j <= skip; j++) {
              pixels.push(getPixelDataAt(imgData, x + j, y + i));
            }
          }

          
          const mid = Math.floor(pixels.length / 2);

          let pixelColor = [0, 0, 0, 255];

          // Filtr usredniajacy
          pixels.forEach((pixel, index) => {
            const weight = mask[index] / mask.length;
            pixelColor[0] += adjustPixelColor(pixel[0], weight);
            pixelColor[1] += adjustPixelColor(pixel[1], weight);
            pixelColor[2] += adjustPixelColor(pixel[2], weight);
          });
          // console.log(pixelColor);

          pixels[mid] = pixelColor;


          // Filtr medianowy.
          // const pixelsRed = pixels.sort((a, b) => {
          //   return a[0] - b[0];
          // });

          // const pixelsGreen = pixels.sort((a, b) => {
          //   return a[1] - b[1];
          // });

          // const pixelsBlue = pixels.sort((a, b) => {
          //   return a[2] - b[2];
          // });

          // console.log(pixelsRed, pixelsGreen, pixelsBlue);

          // let pixelData = getPixelDataAt(imgData, x, y);

          // pixelData[0] = adjustPixelColor(pixelData[0], 1);
          // pixelData[1] = adjustPixelColor(pixelData[1], 1);
          // pixelData[2] = adjustPixelColor(pixelData[2], 1);

          // setPixelDataAt(pixelData, imgData, x, y);
          setPixelDataAt(pixels[mid], imgData, x, y);
        }
      }

      mainCtx.putImageData(imgData, 0, 0);
    },
    setActiveTab: function(event) {
      this.tabActive = event.target.dataset.tabName;
    },
    filesChange: function(event, files) {
      const file = event.target.files[0];

      const reader = new FileReader();

      reader.addEventListener(
        "load",
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
    redrawHistory() {
      const mainCtx = this.$refs.mainCanvas.getContext('2d');
      const helperCtx = this.$refs.helperCanvas.getContext('2d');
      clearCanvas(this.$refs.mainCanvas);
      clearCanvas(this.$refs.helperCanvas);
      for (let entry of this.history.values()) {
        if ( ! entry.selected ) {
          let path = entry.getPath();
          mainCtx.stroke(path);
        }
        else {
          if (entry.name.toLowerCase() === 'bezier') {
            helperCtx.strokeStyle = '#F0F';
            const control_point_1 = new Circle(entry.points[1], 8);
            const control_point_2 = new Circle(entry.points[2], 8);
            helperCtx.stroke(control_point_1.path);
            helperCtx.stroke(control_point_2.path);
            helperCtx.stroke(entry.getPath());

            if (event.buttons === 1) {
              if (control_point_1.contains(this.mouse.position)) {
                entry.points[1] = this.mouse.position;
              }

              if (control_point_2.contains(this.mouse.position)) {
                entry.points[2] = this.mouse.position;
              }
            }
          }
        }
      }
      helperCtx.strokeStyle = this.color;
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
     
      let selectedHistory = this.history.filter((entry) => entry.selected === true);

      if (selectedHistory.length) {
        ctx.strokeStyle = '#F0F';
        for (let entry of selectedHistory.values()) {
          if (entry.name.toLowerCase() === 'bezier') {
            const control_point_1 = new Circle(entry.points[1], 8);
            const control_point_2 = new Circle(entry.points[2], 8);
            ctx.stroke(control_point_1.path);
            ctx.stroke(control_point_2.path);

            if (event.buttons === 1) {
              if (control_point_1.contains(this.mouse.position)) {
                entry.points[1] = this.mouse.position;
              }

              if (control_point_2.contains(this.mouse.position)) {
                entry.points[2] = this.mouse.position;
              }
            }
          }
          ctx.stroke(entry.getPath());
        }
        ctx.fillStyle = this.color;        
      }
      else {
        this.selectedBezier = null;
      }

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
          case "bezier":
            if (mainCtx.isPointInPath(this.mouse.position.x, this.mouse.position.y)) {
              console.log('Bajzel');
            }
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
        case "select":
          for (let entry of this.history.values()) {
            if (entry.contains(position)) {
              entry.selected = true;

              if (entry.name.toLowerCase() === 'bezier') {
                this.selectedBezier = entry;
                console.log(entry);
              }
            }
            else {
              entry.selected = false;
            }
          }
          this.redrawHistory();
          break;
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
        case "bezier":
          this.drawing.points.push(position);

          if (this.drawing.points.length >= 4) {
            let bezier = new Bezier(this.drawing.points);
            mainCtx.stroke(bezier.getPath());
            this.history.push(bezier);
            this.drawing.points = [];
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
      clearCanvas(this.$refs.helperCanvas);
      this.history = [];
    },
    imageDraw: function() {
      this.loadImage(lena_std);
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
    },
    drawBezier: function() {
      const mainCtx = this.$refs.mainCanvas.getContext("2d");

      const bezier = new Bezier(this.bezierPoints);
      mainCtx.stroke(bezier.getPath());
      this.history.push(bezier);
    }
  },
  watch: {
    selectedBezier: function(newVal, oldVal) {
      if (newVal && newVal.points) {
        this.bezierPoints = newVal.points;
      }
      else {
        this.bezierPoints = [
          {x: 0, y: 0},
          {x: 0, y: 0},
          {x: 0, y: 0},
          {x: 0, y: 0},
        ];
      }
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
  const offset = calculatePixelOffset(imgData.width, imgData.height, x, y);
  return getPixelData(imgData.data, offset);
}

function setPixelData(pixelData, imgData, offset = 0) {
  try {
    imgData.data.set(pixelData, offset);
  }
  catch(err) {
    console.log(offset);
    return;
  }
}

function setPixelDataAt(pixelData, imgData, x, y) {
  const offset = calculatePixelOffset(imgData.width, imgData.height, x, y);
  return setPixelData(pixelData, imgData, offset);
}

function calculatePixelOffset(width, height, x, y) {
  return (x + y * width) * 4;
}

function adjustPixelColor(pixelValue, value) {
  pixelValue *= value;

  if (pixelValue < 0) {
    return 0;
  }
  if (pixelValue > 255) {
    return 255;
  }

  return pixelValue;
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
  // max-height: 350px;
  // max-width: 300px;
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