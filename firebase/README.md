# Firebase

## Local development setup

Follow guide here: https://firebase.google.com/docs/cli#mac-linux-npm

1. install firebase tools `npm install -g firebase-tools`

2. `firebase init emulators` to install emulator

3. `firebase emulators:start --only firestore` to start emulator
```bash
$ firebase emulators:start --only firestore
i  emulators: Starting emulators: firestore
i  firestore: Firestore Emulator logging to firestore-debug.log
i  ui: downloading ui-v1.0.0.zip...
Progress: ===============================================================================================================================================================================================================> (100% of 4MB
i  ui: Emulator UI logging to ui-debug.log

┌───────────────────────────────────────────────────────────────────────┐
│ ✔  All emulators ready! View status and logs at http://localhost:4000 │
└───────────────────────────────────────────────────────────────────────┘

┌───────────┬────────────────┬─────────────────────────────────┐
│ Emulator  │ Host:Port      │ View in Emulator UI             │
├───────────┼────────────────┼─────────────────────────────────┤
│ Firestore │ localhost:8080 │ http://localhost:4000/firestore │
└───────────┴────────────────┴─────────────────────────────────┘
  Other reserved ports: 4400, 4500

Issues? Report them at https://github.com/firebase/firebase-tools/issues and attach the *-debug.log files.

```

### Testing

If you have the firebase emulator running, run `npm test`

otherwise you can use the [test.Dockerfile](test.Dockerfile) for testing. Run `$ docker build -t app:test --file test.Dockerfile . && docker run --rm -it app:test`   
