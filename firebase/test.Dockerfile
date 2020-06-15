FROM timbru31/java-node:11-jre

WORKDIR /usr/src/app

RUN npm install -g firebase-tools

COPY package.json .

RUN npm install

COPY . .

CMD ["sh", "-c", "firebase emulators:exec --only firestore 'npm test'"]
