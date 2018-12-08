<template>
    <div class="converter-container">
        <button @click="convertRgbToCmyk">Convert RGB To CMYK</button>
        <button @click="convertCmykToRgb">Convert CMYK To RGB</button>
        <div class="rgb"> 
            <label for="r">R</label>
            <input id="r" type="number" v-model="rgb.r" min="0" max="255" step="1">
            <label for="g">G</label>
            <input id="g" type="number" v-model="rgb.g" min="0" max="255" step="1">
            <label for="b">B</label>
            <input id="b" type="number" v-model="rgb.b" min="0" max="255" step="1">
        </div>
        <div class="cmyk">
            <label for="c">C</label>
            <input id="c" type="number" v-model="cmyk.c" min="0" max="1" step=".01">
            <label for="m">M</label>
            <input id="m" type="number" v-model="cmyk.m" min="0" max="1" step=".01">
            <label for="y">Y</label>
            <input id="y" type="number" v-model="cmyk.y" min="0" max="1" step=".01">
            <label for="k">K</label>
            <input id="k" type="number" v-model="cmyk.k" min="0" max="1" step=".01">
        </div>
    </div>
</template>

<script>
export default {
  data: function() {
    return {
      rgb: {
        r: 0,
        g: 0,
        b: 0
      },
      cmyk: {
        c: 0,
        m: 0,
        y: 0,
        k: 0
      }
    };
  },
  methods: {
    convertRgbToCmyk: function() {
      const cmyk = rgb2cmyk(this.rgb);
      console.log(cmyk);
      this.cmyk = cmyk;
    },
    convertCmykToRgb: function() {
      this.rgb = cmyk2rgb(this.cmyk);
    }
  }
};

function rgb2cmyk(rgb) {
  let scaled = {
    r: rgb.r / 255,
    g: rgb.g / 255,
    b: rgb.b / 255
  };
  const k = 1 - Math.max(...Object.values(scaled));
  const c = (1 - scaled.r - k) / (1 - k)
  const m = (1 - scaled.g - k) / (1 - k)
  const y = (1 - scaled.b - k) / (1 - k)
  
  return {
    k: parseFloat(k).toFixed(2),
    c: c ? parseFloat(c).toFixed(2) : 0,
    m: m ? parseFloat(m).toFixed(2) : 0,
    y: y ? parseFloat(y).toFixed(2) : 0,
  };
}

function cmyk2rgb(cmyk) {
  console.log(cmyk);
  return {
    r: 255 * (1 - cmyk.c) * (1 - cmyk.k),
    g: 255 * (1 - cmyk.m) * (1 - cmyk.k),
    b: 255 * (1 - cmyk.y) * (1 - cmyk.k)
  };
}
</script>

<style lang="scss">
</style>