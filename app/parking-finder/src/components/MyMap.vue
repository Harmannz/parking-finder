<template>
  <div style="height: 500px; width: 100%">
    <div style="height: 200px; overflow: auto;">
      <p>Center is at {{ currentCenter }} and the zoom is: {{ currentZoom }}</p>
      <button @click="addToCollection">
        Add to collection
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
      <l-marker
        v-for="parking in nearbyParking"
        v-bind:key="parking.id"
        :lat-lng="getLatLong(parking.data())"
       >
        <l-icon
          :icon-size="iconSize"
          :icon-anchor="iconAnchor"
          :shadow-url="iconUrl"
          :icon-url="iconUrl"
        >
        </l-icon>
      </l-marker>
    </l-map>
  </div>
</template>

<script>
import { Icon, latLng } from 'leaflet';
import {
  LMap, LTileLayer, LMarker, LPopup, LTooltip, LIcon,
} from 'vue2-leaflet';

import firebase from 'firebase/app';
import { db, geoFirestore } from '../db';

// eslint-disable-next-line no-underscore-dangle
delete Icon.Default.prototype._getIconUrl;

const parkingIcon = require('@/assets/parking_icon.png');

export default {
  name: 'MyMap',
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip,
    LIcon,
  },
  data() {
    return {
      zoom: 18,
      center: latLng(-41.313286, 174.780518),
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      currentZoom: 18,
      currentCenter: latLng(-41.313286, 174.780518),
      mapOptions: {
        zoomSnap: 0.5,
      },
      showMap: true,
      nearbyParking: [],
      iconUrl: parkingIcon,
      iconSize: [32, 37],
      iconAnchor: [16, 37],
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
      const query = geoFirestore.collection('geo-car-park').near({ center: new firebase.firestore.GeoPoint(newCenter.lat, newCenter.lng), radius: 0.1 });
      const vm = this;
      query.get().then((value) => {
        vm.nearbyParking = value.docs;
      });
    },
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    getLatLong(data) {
      return latLng(data.coordinates.latitude, data.coordinates.longitude);
    },
    centerUpdate(center) {
      this.currentCenter = center;
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
  },
};
</script>
