FROM python:alpine

WORKDIR /usr/src/app

COPY nztm .

ENTRYPOINT ["python", "-m", "unittest", "discover"]

CMD ["-v", "test"]



