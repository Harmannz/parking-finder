FROM timbru31/java-node:11-jre

WORKDIR /usr/src/app

COPY firebase-setup .

COPY firebase-test-data/firebase-import firebase-import

RUN npm install -g firebase-tools

ENTRYPOINT ["firebase"]

CMD ["emulators:start", "--import=firebase-import"]
