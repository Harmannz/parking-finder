TODO:


1. Convert nztm to lat long using python script in docker container   
   1.5 test it works

DONE: 
```$bash
docker build -t wcc-python:latest . && \
docker run --rm --mount type=bind,source=$(pwd),target=/usr/src/app wcc-python:latest test.dat

```
2. process data to separate out the parking information with parking lat long data

3. upload data to firebase

4. upload lat long info to geofire

5. Test it works
