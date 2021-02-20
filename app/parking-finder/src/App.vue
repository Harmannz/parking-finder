<template>
  <v-app>
    <v-main>
      <my-map/>
    </v-main>
  </v-app>
</template>

<script>
import MyMap from './components/MyMap.vue';

export default {
  name: 'App',
  components: {
    MyMap,
  },
};
</script>

<style lang="scss">
#app {
  height: 100%;
}
</style>
