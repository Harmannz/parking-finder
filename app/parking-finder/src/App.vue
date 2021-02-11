<template>
  <div id="app">
    <my-map></my-map>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue';
import MyMap from './components/MyMap.vue';

export default {
  name: 'App',
  components: {
    HelloWorld,
    MyMap,
  },
};
</script>

<style lang="scss">
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    height: 100%
  }
</style>
