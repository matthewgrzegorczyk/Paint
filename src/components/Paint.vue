<template>
    <div class="paint-container">
        <div class="tool-bar">
            <input type="text" name="color" v-model="color" />
            <input type="color" name="color" v-model="color" />
            <input type="range" name="line_width" v-model="line_width" min="1" max="10" step="1" />
            <ul class="shapes">
                <li v-for="tool in tools" v-bind:key="tool.id" v-on:click="selectTool" v-bind:data-tool="tool.name">
                    {{ tool.display_name }}
                </li>
            </ul>
        </div>
        <div class="canvas-container">
            <canvas height="500" width="500" id="main-canvas" class="main-canvas" ref="mainCanvas"></canvas>
            <canvas height="500" width="500" id="helper-canvas" class="helper-canvas" v-on:mousemove="onMouseMove" v-on:click="onMouseClick"></canvas>
        </div>
        <div class="cursor-position">
            Mouse position X: {{ mouse.position.x }} Y: {{ mouse.position.y }}
        </div>
    </div>
</template>


<script>
/*
TODO:
1. Rysowanie obiektów poprzez wpisanie parametrów w pola tekstowe.
2. Przesuwanie oraz zmiana rozmiaru kszałtów.
*/
export default {
  name: "paint",
  data: function() {
    return {
      activeTool: null,
      isDrawing: false,
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
      color: "#FF00FF",
      line_width: 2,
      history: []
    };
  },
  methods: {
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
    drawMe: function() {
      const ctx = this.$refs.mainCanvas.getContext("2d");
      ctx.stroke(drawLine({ x: 0, y: 0 }, { x: 50, y: 50 }));
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
  } else if (mode === "stroke") {
    ctx.stroke();
  }
}
</script>


<style lang="scss">
.tool-bar li {
  cursor: pointer;

  &.active {
    font-weight: 700;
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