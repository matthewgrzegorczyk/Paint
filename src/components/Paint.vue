<template>
    <div class="paint-container">
        <div class="tool-bar">
            <input type="color" name="color" v-bind:value="color" />
            <input type="range" name="line_width" v-bind:value="line_width" />
            <ul class="shapes">
                <li v-for="tool in tools" v-bind:key="tool.id" v-on:click="selectTool" v-bind:data-tool="tool.name">
                    {{ tool.display_name }}
                </li>
            </ul>
        </div>
        <div class="canvas-container">
            <canvas height="500" width="500" id="main-canvas" class="main-canvas"></canvas>
            <canvas height="500" width="500" id="helper-canvas" class="helper-canvas" v-on:mousemove="onMouseMove" v-on:click="onMouseClick"></canvas>
        </div>
        <div class="cursor-position">
            Mouse position X: {{ mouse.position.x }} Y: {{ mouse.position.y }}
        </div>
    </div>
</template>


<script>
export default {
  name: "paint",
  data: function() {
    return {
      activeTool: null,
      isDrawing: false,
      mainCanvas: document.getElementById('main-canvas'),
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
          y: 0,
        }
      },
      color: '#FF00FF',
      line_width: 2,
      history: []
    }
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
      ctx.strokeStyle = this.color;
      clearCanvas(canvas);

      if (this.isDrawing) {
        switch (activeTool) {
          case "line":
            if (this.drawing.points.length >= 1) {
              const line = drawLine(this.drawing.points[0], this.mouse.position);
              ctx.stroke(line);
            }
            // console.log(this.drawing.points[0], this.mouse.position);
            break;
          case "elipsis":
            console.log(`Let's start drawing an elipsis`);
            break;
          case "rect":
            console.log(`Let's draw some rectangulars.`);
            break;
          default:
            break;
        }
      }
    },
    onMouseClick: function(event) {
      const position = calculatePosition(event);

      const activeTool = this.getActiveTool();
      const canvas = event.target;
      const ctx = canvas.getContext("2d");

      if (activeTool !== null) {
        this.isDrawing = true;
      } else {
        this.isDrawing = false;
      }

      switch (activeTool) {
        case "line":
          this.drawing.points.push(position); // Set starting point.
          
          if (this.drawing.points.length >= 2) {
            const line = drawLine(this.drawing.points[0], this.drawing.points[1]);
            const mainCtx = this.mainCanvas.getContext('2d');
            mainCtx.strokeStyle = this.color;
            mainCtx.stroke(line);
            console.log(this.drawing.points, line);

            this.drawing.points = [];
          }
          break;
        case "elipsis":
          console.log(`Let's start drawing an elipsis`);
          break;
        case "rect":
          console.log(`Let's draw some rectangulars.`);
          break;
        default:
          break;
      }
    },
    getActiveTool: function() {
      return this.activeTool ? this.activeTool.dataset.tool : null;
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
  if (mode === "fill") {
    ctx.fillRect(a.x, a.y, b.x, b.y);
  } else if (mode === "stroke") {
    ctx.strokeRect(a.x, a.y, b.x, b.y);
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