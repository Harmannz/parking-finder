#!/usr/bin/env node

/**
 * Script to upload geo (lat, long) car parks to firebase
 */

const yargs = require('yargs')
const { GeoCollectionReference, GeoFirestore, GeoQuery, GeoQuerySnapshot } = require('geofirestore');
const admin = require('firebase-admin');
const csv = require('csvtojson')

const argv = yargs
    .example('$0 -f foo.csv -c serviceAccount.js', 'Upload car parks data to GeoFirestore')
    .option('file', {
        alias: 'f',
        nargs: 1,
        description: 'car park csv data containing lat and long'

    })
    .option('creds', {
        alias: 'c',
        nargs: 1,
        description: 'firebase credential json file'

    })
    .demandOption(['f', 'c'])
    .help()
    .alias('help', 'h')
    .argv;


// Initialise app
let serviceAccount = require(`${process.cwd()}/${argv.creds}`);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


// Get reference to firestore
let ref = admin.firestore();
const geoFirestore = new GeoFirestore(ref)
const geoCsvFile = `${process.cwd()}/${argv.file}`

csv().fromFile(geoCsvFile).then((jsonData) => {
    let jsonDataCopy = [...jsonData]
    while (jsonDataCopy.length > 0) {
        batch_upload(jsonDataCopy.splice(0, 250))
    }
})

function batch_upload(jsonData) {
    let batch = geoFirestore.batch()
    const geoCollection = geoFirestore.collection('geo-car-park')

    jsonData.forEach(data => {
        let data_ref = geoCollection.doc(data["global_id"])
        batch.set(
            data_ref,
            {
                carpark: data["GlobalID"],
                purpose: data["purpose"],
                coordinates: new admin.firestore.GeoPoint(Number(data["latitude"]), Number(data["longitude"]))
            }
        )
    })

    batch.commit().then(function () {
        console.log("committed batch")
    })
}
