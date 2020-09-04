import firebase from 'firebase/app';
import 'firebase/firestore';

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

// Export types that exists in Firestore
// This is not always necessary, but it's used in other examples
const { Timestamp, GeoPoint } = firebase.firestore;
export { Timestamp, GeoPoint };

// if using Firebase JS SDK < 5.8.0
db.settings({ timestampsInSnapshots: true });

// ADD THESE LINES
if (window.location.hostname === 'localhost') {
  console.log('localhost detected!');
  db.settings({
    host: 'localhost:9090',
    ssl: false,
  });
}
