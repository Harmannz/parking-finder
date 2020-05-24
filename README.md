# WCC Disabled Car Parking Service

Project to help find nearby car parks in Wellington greater area.

## MVP

MVP is to restrict the parking to just disabled car parks.

 

TODO:


1. Convert nztm to lat long using python script in docker container   
   1.5 test it works

DONE: 
```$bash
docker build -t park:latest . && \
docker run --rm \
--mount type=bind,source=$(pwd)/sample,target=/home/sample \
park:latest \
/home/sample/example.csv -o /home/sample/out.csv


python -m unittest nztm/test/test_nztm_to_geod.py

```
2. process data to separate out the parking information with parking lat long data
DONE:

3. upload data to firebase
DONE:
4. upload lat long info to geofire
DONE:
5. Test it works
DONE:

TODO: DOCUMENT THE ABOVE