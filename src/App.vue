<template>
  <div id="app">
    <Paint />
  </div>
</template>

<script>
import Paint from './components/Paint.vue'

export default {
  name: 'app',
  components: {
    Paint
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 1200px;
  margin: 0 auto;
  color: #2c3e50;
}

button {
  background: #000;
  color: #FFF;
  border: 0;
  padding: 0.5rem;
  margin: 0.5rem;
  transition: .3s background-color ease-in-out;

  &:hover, &:active {
    background: #AAA;
    outline: 0;
    cursor: pointer;
  }

  &::-moz-focus-inner {
    border: 0;
  }
}
input {
  padding: 0.5rem;
  margin: 0.5rem;
  outline: 0;
  border: 1px solid #000;
}
</style>
