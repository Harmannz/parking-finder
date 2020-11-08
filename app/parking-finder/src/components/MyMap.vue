<template>
  <div style="height: 500px; width: 100%">
    <div style="height: 200px; overflow: auto;">
      <p>First marker is placed at {{ withPopup.lat }}, {{ withPopup.lng }}</p>
      <p>Center is at {{ currentCenter }} and the zoom is: {{ currentZoom }}</p>
      <button @click="addToCollection">
        Add to collection
      </button>
      <button @click="showLongText">
        Toggle long popup
      </button>
      <button @click="showMap = !showMap">
        Toggle map
      </button>
    </div>
    <div>
      <ul id="NearByParking">
        <p>Found nearbyParking: {{nearbyParking.length}}</p>
        <p>First result: {{nearbyParking[0]}}</p>
      </ul>
    </div>
    <l-map
      v-if="showMap"
      :zoom="zoom"
      :center="center"
      :options="mapOptions"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
    >
      <l-tile-layer
        :url="url"
        :attribution="attribution"
      />
      <l-marker :lat-lng="withPopup">
        <l-popup>
          <div @click="innerClick">
            I am a popup
            <p v-show="showParagraph">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
              sed pretium nisl, ut sagittis sapien. Sed vel sollicitudin nisi.
              Donec finibus semper metus id malesuada.
            </p>
          </div>
        </l-popup>
      </l-marker>
      <l-marker :lat-lng="withTooltip">
        <l-tooltip :options="{ permanent: true, interactive: true }">
          <div @click="innerClick">
            I am a tooltip
            <p v-show="showParagraph">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
              sed pretium nisl, ut sagittis sapien. Sed vel sollicitudin nisi.
              Donec finibus semper metus id malesuada.
            </p>
          </div>
        </l-tooltip>
      </l-marker>
    </l-map>
  </div>
</template>

<script>
import { latLng } from 'leaflet';
import {
  LMap, LTileLayer, LMarker, LPopup, LTooltip,
} from 'vue2-leaflet';

import firebase from 'firebase/app';
import { db, geoFirestore } from '../db';

export default {
  name: 'MyMap',
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip,
  },
  data() {
    return {
      zoom: 18,
      center: latLng(-41.287993, 174.778678),
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      withPopup: latLng(-41.287993, 174.778678),
      withTooltip: latLng(-41.287993, 174.778678),
      currentZoom: 18,
      currentCenter: latLng(-41.287993, 174.778678),
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.5,
      },
      showMap: true,
      nearbyParking: [],
    };
  },
  watch: {
    currentCenter: {
      immediate: true,
      handler(oldCenter, newCenter) {
        // fetch nearbyParking when the current center changes
        // for now, query the database on every change.
        // In the future it can be made smarter by caching and querying selectively.
        this.fetchNearByParking(newCenter);
      },
    },
  },
  methods: {
    fetchNearByParking(newCenter) {
      const query = geoFirestore.collection('geo-car-park').near({ center: new firebase.firestore.GeoPoint(newCenter.lat, newCenter.lng), radius: 3 });
      const vm = this;
      query.get().then((value) => {
        vm.nearbyParking = value.docs;
      });
    },
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
    showLongText() {
      this.showParagraph = !this.showParagraph;
    },
    addToCollection() {
      // Add to firebase collection
      const demoCollection = db.collection('demo');
      demoCollection.add({
        text: 'Firebase Update Demo',
      })
        .then((docRef) => {
          console.log('Document written with ID: ', docRef.id);
        })
        .catch((error) => {
          console.error('Error adding document: ', error);
        });
    },
    innerClick() {
      alert('Click!');
    },
  },
};
</script>
