import firebase from 'firebase/app';
import 'firebase/firestore';

const { GeoFirestore } = require('geofirestore');

// Get a Firestore instance
export const db = firebase
  .initializeApp(
    {
      projectId: 'wcc-carpark',
      databaseURL: 'http://localhost:9090',
      ssl: false,
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
