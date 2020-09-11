import Vue from 'vue';
import { firestorePlugin } from 'vuefire';
import App from './App.vue';
import './db';

import 'leaflet/dist/leaflet.css';

Vue.config.productionTip = false;

Vue.use(firestorePlugin);

new Vue({
  render: (h) => h(App),
}).$mount('#app');
