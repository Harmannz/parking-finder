import firebase from 'firebase/app';
import 'firebase/firestore';

const { GeoFirestore } = require('geofirestore');

// load environment config. Need to use dotenv to import process.env variables because this file
// will not automatically load the variables from vuejs --mode attribute.
const dotenv = require('dotenv');

dotenv.config();

// Get a Firestore instance
export const db = firebase
  .initializeApp(
    {
      projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
      databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
      ssl: process.env.VUE_APP_FIREBASE_SSL,
    },
  )
  .firestore();

// Export geofire reference
export const geoFirestore = new GeoFirestore(db);

// Export types that exists in Firestore
// This is not always necessary, but it's used in other examples
const { Timestamp, GeoPoint } = firebase.firestore;
export { Timestamp, GeoPoint };

// ADD THESE LINES
if (window.location.hostname === 'localhost') {
  console.log('localhost detected!');
  db.settings({
    host: 'localhost:9090',
    ssl: false,
  });
}
