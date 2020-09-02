FROM timbru31/java-node:11-jre

WORKDIR /usr/src/app

COPY firebase .

RUN npm install -g firebase-tools

ENTRYPOINT ["firebase"]

CMD ["emulators:start"]