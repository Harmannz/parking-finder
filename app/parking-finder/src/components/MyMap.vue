<template>
  <div id="parkingMap">
    <l-map
      v-if="showMap"
      :zoom="mapAttributes.zoom"
      :center="mapAttributes.center"
      :options="mapAttributes.mapOptions"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
    >
      <l-tile-layer
        :url="mapAttributes.url"
        :attribution="mapAttributes.attribution"
      />
      <l-marker
        v-for="parking in nearbyParking"
        v-bind:key="parking.id"
        :lat-lng="getLatLong(parking.data())"
       >
        <l-icon
          :icon-size="mapAttributes.iconSize"
          :icon-anchor="mapAttributes.iconAnchor"
          :shadow-url="mapAttributes.iconUrl"
          :icon-url="mapAttributes.iconUrl"
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
import { geoFirestore } from '../db';

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
      noLocation: true,
      currentZoom: 18,
      currentCenter: latLng(-41.313286, 174.780518),
      showMap: true,
      nearbyParking: [],
      mapAttributes: {
        zoom: 18,
        center: latLng(-41.313286, 174.780518),
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        iconUrl: parkingIcon,
        iconSize: [32, 37],
        iconAnchor: [16, 37],
        mapOptions: {
          zoomSnap: 0.5,
        },
      },
    };
  },
  beforeMount() {
    this.fetchCurrentLocation();
    this.currentCenter = this.mapAttributes.center;
  },
  watch: {
    currentCenter: {
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
    fetchCurrentLocation() {
      navigator.geolocation.getCurrentPosition((position) => {
        this.mapAttributes.center = latLng(position.coords.latitude, position.coords.longitude);
      }, () => {
        // failed to fetch current location. Potentially send a message to user and default
        this.mapAttributes.center = latLng(-41.313286, 174.780518);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
      });
    },
    zoomUpdate(zoom) {
      this.mapAttributes.currentZoom = zoom;
    },
    getLatLong(data) {
      return latLng(data.coordinates.latitude, data.coordinates.longitude);
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
  },
};
</script>

<style lang="scss">
  #parkingMap {
    height: 100%;
  }
</style>
