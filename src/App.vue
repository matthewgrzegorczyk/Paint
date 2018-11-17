<template>
  <div id="app">
    <Paint />
    <Converter />
  </div>
</template>

<script>
import Paint from './components/Paint.vue'
import Converter from './components/Converter.vue'

export default {
  name: 'app',
  components: {
    Paint,
    Converter
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

ul {
  li {
    list-style: none;
  }
}
</style>
