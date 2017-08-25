#!/bin/sh
docker rm mbc 

#docker run -it --name mbc -p 0.0.0.0:3306:3306 -p 9229:9229 -v $(pwd)/bin:/app/bin mysql-broadcast 
 docker run -it --name mbc -p 0.0.0.0:3306:3306 -p 9229:9229 -v $(pwd)/bin:/app/bin --entrypoint /bin/bash mysql-broadcast 