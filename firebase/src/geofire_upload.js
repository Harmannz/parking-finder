#!/usr/bin/env node

/**
 * Script to upload geo (lat, long) car parks to firebase
 */

const firebase = require('firebase/app')

if (require.main === module) {

    const yargs = require('yargs')
    const {GeoFirestore} = require('geofirestore');
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

    // Load geo data from csv file and batch upload to geofirstore
    const geoCsvFile = `${process.cwd()}/${argv.file}`
    csv().fromFile(geoCsvFile).then((cars) => {
        let carsCopy = [...cars]
        while (carsCopy.length > 0) {
            batch_upload(carsCopy.splice(0, 250), geoFirestore)
        }
    })
}

/**
 * Uploads the cars documents to firebase in a single batch commit.
 *
 * @param cars An array of cars objects with lat and long attributes
 * @param firebaseRef Firestore reference
 */
async function batch_upload(cars, firebaseRef) {
    if (cars.length > 500) {
        throw "Cannot commit more than 500 in a single batch"
    }

    let batch = firebaseRef.batch()
    const geoCollection = firebaseRef.collection('geo-car-park')

    cars.forEach(car => {
        let data_ref = geoCollection.doc(car["GlobalID"])
        batch.set(
            data_ref.native,
            {
                carpark: car["GlobalID"],
                purpose: car["purpose"],
                coordinates: new firebase.firestore.GeoPoint(Number(car["latitude"]), Number(car["longitude"]))
            }
        )
    })

    return await batch.commit()
}

module.exports = {
    batch_upload
}