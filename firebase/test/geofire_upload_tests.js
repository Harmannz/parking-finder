const firebase = require("@firebase/testing");
const fs = require("fs");

/*
 * ============
 *    Setup
 * ============
 */
const projectId = `rules-spec-${Date.now()}`;
const firebasePort = require(`${process.cwd()}/firebase.json`).emulators.firestore.port;
const rules = fs.readFileSync(`${process.cwd()}/firestore.rules`, "utf8");

const { GeoFirestore } = require('geofirestore');
const geofire_upload = require('../src/geofire_upload')

/**
 * Creates a new app.
 *
 * @return {object} the app.
 */
function initApp() {
    return firebase.initializeTestApp({projectId}).firestore();
}

/*
 * ============
 *  Test Cases
 * ============
 */
beforeEach(async () => {
    // Clear the database between tests
    await firebase.clearFirestoreData({ projectId });
});

before(async () => {
    await firebase.loadFirestoreRules({ projectId, rules });
});

after(async () => {
    await Promise.all(firebase.apps().map(app => app.delete()));
});

describe("My app", () => {

    it("should ensure document UUID matches global id", async () => {
        const ref = initApp();
        const geoFirestore = new GeoFirestore(ref)
        let cars = [{
            "GlobalID" : "38ee3f9a-1e04-4d9d-b858-9281481e9461",
            "purpose" : "Regular",
            "latitude" : "-41.32527748805887",
            "longitude" : "174.81533079843308"
        }]

        await firebase.assertSucceeds(geofire_upload.batch_upload(cars, geoFirestore))
        await firebase.assertSucceeds(
            geoFirestore
                .collection('geo-car-park')
                .doc('38ee3f9a-1e04-4d9d-b858-9281481e9461')
                .get())
    });
});
