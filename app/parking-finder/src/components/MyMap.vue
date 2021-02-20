<template>
  <div id="parkingMap">
    <l-map
      v-if="showMap"
      :zoom="mapAttributes.zoom"
      :center="mapAttributes.center"
      :options="mapAttributes.mapOptions"
      :minZoom="16"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
      @ready="attachSidebar"
      ref="parkingMap"
    >
      <l-control>
        <div id="sidebar" class="leaflet-sidebar collapsed">
          <!-- Nav tabs -->
          <div class="leaflet-sidebar-tabs">
            <ul role="tablist"> <!-- top aligned tabs -->
              <li class="white"><a href="#home" role="tab">
                <v-icon color="primary">mdi-menu</v-icon>
              </a></li>
            </ul>
          </div>

          <!-- Tab panes -->
          <div class="leaflet-sidebar-content">
            <div class="leaflet-sidebar-pane" id="home">
              <h1 class="leaflet-sidebar-header primary">
                WCC Car Parks
                <div class="leaflet-sidebar-close"><v-icon>mdi-backburger</v-icon></div>
              </h1>

              <p class="pt-2">
                Project to help find nearby car parks in Wellington greater area.
              </p>

              <h2>Filter parking by purpose</h2>
              <p>Unselecting all will fetch all car parks.</p>
              <v-switch
                v-model="typesOfCarParksToFetch"
                color="primary"
                label="Disabled"
                value="Disabled"
              ></v-switch>
              <v-switch
                v-model="typesOfCarParksToFetch"
                color="primary"
                label="Motorcycle"
                value="Motorcycle"
              ></v-switch>
              <v-divider></v-divider>

              <h2>Filter parking by orientation</h2>
              <p>Unselecting all will fetch all car parks.</p>
              <v-switch disabled >
                <template v-slot:label>
                  Angle parking
                </template>
              </v-switch>
              <v-divider></v-divider>

              <h2>Filter parking by orientation</h2>
              <p>Unselecting all will fetch all car parks.</p>
              <v-switch disabled >
                <template v-slot:label>
                  Metered parking
                </template>
              </v-switch>
              <v-divider></v-divider>

              <v-list-item class="pl-0" three-line>
                <v-list-item-icon>
                  <v-icon color="primary">mdi-information</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>About</v-list-item-title>
                  <v-list-item-subtitle>
                    This project uses WCC car parking data to make easy to find nearby car parking.
                  </v-list-item-subtitle>
                  <v-list-item-subtitle>
                    I use this to find nearby disabled car parking spots.
                  </v-list-item-subtitle>
                  <v-list-item-subtitle>
                    More features will be added shortly.
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item class="pl-0" three-line>
                <v-list-item-icon>
                  <a href="https://github.com/Harmannz" target="_blank">
                  <v-icon color="primary" >mdi-github</v-icon>
                  </a>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Contribute</v-list-item-title>
                  <v-list-item-subtitle>
                    Checkout the github repo for feedback or to raise issues.
                    <a href="https://github.com/Harmannz/parking-finder" target="_blank">
                      Parking Finder Repo
                    </a>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </div>
          </div>
        </div>
      </l-control>
      <v-locatecontrol
        :options="mapAttributes.locateControlOptions"
      />
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
  LMap, LTileLayer, LMarker, LIcon, LControl,
} from 'vue2-leaflet';
import 'leaflet-sidebar-v2';
import Vue2LeafletLocatecontrol from 'vue2-leaflet-locatecontrol/Vue2LeafletLocatecontrol.vue';

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
    LIcon,
    'v-locatecontrol': Vue2LeafletLocatecontrol,
    LControl,
  },
  data() {
    return {
      noLocation: true,
      currentZoom: 18,
      currentCenter: latLng(-41.313286, 174.780518),
      showMap: true,
      nearbyParking: [],
      typesOfCarParksToFetch: ['Disabled'],
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
        locateControlOptions: {
          drawCircle: true,
          initialZoomLevel: 18,
          locateOptions: {
            enableHighAccuracy: true,
          },
          returnToPrevBounds: true,
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
      handler() {
        // fetch nearbyParking when the current center changes
        // for now, query the database on every change.
        // In the future it can be made smarter by caching and querying selectively.
        this.fetchNearByParking();
      },
    },
    typesOfCarParksToFetch: {
      handler() {
        this.fetchNearByParking();
      },
    },
  },
  methods: {
    attachSidebar(mapObject) {
      const sidebar = window.L.control.sidebar({
        autopan: false, // whether to maintain the centered map point when opening the sidebar
        closeButton: true, // whether t add a close button to the panes
        container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
        position: 'left', // left or right
      });

      sidebar.addTo(mapObject);
    },
    fetchNearByParking() {
      let query = geoFirestore.collection('geo-car-park')
        .near({
          center: new firebase.firestore.GeoPoint(this.currentCenter.lat, this.currentCenter.lng),
          radius: 0.2,
        });

      if (this.typesOfCarParksToFetch.length > 0) {
        query = query.where('purpose', 'in', this.typesOfCarParksToFetch);
      }

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
  @import "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css";
  @import "~leaflet-sidebar-v2/css/leaflet-sidebar.css";
  #parkingMap {
    height: 100%;
  }
  #sidebar {
    text-align: justify;
    height:100%;
    ul {
      // vuetify adds left padding which we dont want
      padding-left: 0;
    }
  }
  #sidebar.collapsed {
    height: 40px;
  }
</style>
