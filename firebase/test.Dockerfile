FROM node:14

WORKDIR /usr/src/app

RUN apt-get update && \
    apt-get install -y openjdk-8-jdk && \
    npm install -g firebase-tools

COPY package.json .

RUN npm install

COPY . .

CMD ["sh", "-c", "firebase emulators:exec --only firestore 'npm test'"]
