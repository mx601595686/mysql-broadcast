#!/bin/sh

# 容器内调试
# node --inspect-brk=0.0.0.0:9229 ./
# ssh /usr/sbin/sshd

# 删除之前的容器
docker rm mbc 

# 启动
docker run -it --name mbc -p 0.0.0.0:3306:3306 -p 0.0.0.0:3000:3000 -p 0.0.0.0:3333:22 -p 9229:9229 -v $(pwd)/bin:/app/bin --entrypoint /bin/bash mysql-broadcast