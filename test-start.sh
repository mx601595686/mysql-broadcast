#!/bin/bash
docker rm mbc 
# docker run -it --name mbc -p 192.168.232.190:3306:3306 -v ${workspaceRoot}/bin:/app/bin mysql-broadcast
docker run -it --name mbc -p 192.168.232.190:3306:3306 -v $(pwd)/bin:/app/bin --entrypoint /bin/bash mysql-broadcast node 