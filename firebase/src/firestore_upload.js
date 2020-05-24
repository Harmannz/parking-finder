#!/usr/bin/env node

/**
 * Script to upload car park data to firestore
 */
const yargs = require('yargs')
const admin = require('firebase-admin');
const csv = require('csvtojson')

const argv = yargs
    .example('$0 -f foo.csv -c serviceAccount.js', 'Upload car parks data to Firestore')
    .option('file', {
        alias: 'f',
        nargs: 1,
        description: 'load csv file'
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

// Initialise firebase app via credentials json file

let serviceAccount = require(`${process.cwd()}/${argv.creds}`);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

let ref = admin.firestore();
ref.settings({timestampsInSnapshots: true})


// load csv data to firebase
const csvPath = `${process.cwd()}/${argv.file}`

csv().fromFile(csvPath).then((jsonData) => {
    let jsonDataCopy = [...jsonData]
    while (jsonDataCopy.length > 0) {
        batch_upload(jsonDataCopy.splice(0, 250))
    }
})

function batch_upload(carParks) {
    let batch = ref.batch()
    const carParkCollection = ref.collection('car-parks')

    carParks.forEach(carPark => {

        let carParkRef = carParkCollection.doc(carPark["GlobalID"])
        batch.set(
            carParkRef,
            sanitizeCarData(carPark)
        )
    })

    batch.commit().then(function () {
        console.log("committed batch")
    })
}

/**
 * Remove redundant car park data that is not required because it is specific to WCC or incur unnecessary costs
 * @param carPark
 * @returns {*}
 */
function sanitizeCarData(carPark) {
    delete carPark["GlobalID"]
    delete carPark["OBJECTID"]
    delete carPark["X"]
    delete carPark["Y"]
    delete carPark["system_id"]
    if (!carPark["street_address"] || carPark["street_address"].length === 0) {
        delete carPark["street_address"]
    }
    return carPark

}
