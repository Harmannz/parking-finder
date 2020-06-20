FROM timbru31/java-node:11-jre

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY . .

CMD ["sh", "-c", "./node_modules/firebase-tools/lib/bin/firebase.js emulators:exec --only firestore 'npm test'"]
