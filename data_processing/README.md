# Data Processing

Process WCC car parks data for firebase.   
Initially this involves removes the coordinates column and preparing it for firestore + geofire.


## Extract data

```bash
docker build -t park:process_data . && \
docker run --rm \
--mount src=$(pwd)/data,target=/data,type=bind,readonly \
--volume $(pwd)/target:/target \
park:process_data \
/data/Car_Parks_Wellington.csv -o /target/car_parks.csv

```
