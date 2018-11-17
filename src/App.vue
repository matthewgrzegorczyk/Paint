<template>
  <div id="app">
    <Paint />
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import Paint from './components/Paint.vue'

export default {
  name: 'app',
  components: {
    HelloWorld,
    Paint
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
