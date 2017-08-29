#!/bin/sh
docker rm mbc 
# node --inspect-brk=0.0.0.0:9229 ./

#docker run -it --name mbc -p 0.0.0.0:3306:3306 -p 9229:9229 -v $(pwd)/bin:/app/bin mysql-broadcast 
 docker run -it --name mbc -p 0.0.0.0:3306:3306 -p 9229:9229 -v $(pwd)/bin:/app/bin --entrypoint /bin/bash mysql-broadcast 