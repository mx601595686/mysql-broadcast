# 这个是根据my-docker-image/mysql/mysql-udf-http构建的镜像
# FROM my-docker-image/mysql:mysql-udf-http

# 使用保存在阿里云上的镜像
FROM registry.cn-hangzhou.aliyuncs.com/wujingtao/mysql:mysql-udf-http-0.0.2


# 安装node
# 这个参考的是my-docker-image/nodejs/淘宝CDN.dockerfile

# node版本号
ENV NODE_VERSION 8.4.0
ENV NPM_CONFIG_LOGLEVEL info

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

RUN curl -SLO "http://cdn.npm.taobao.org/dist/node/latest/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.xz" \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs

ENTRYPOINT [ "/usr/local/bin/node" ]

### 从这开始是程序代码了

# 启动mysql不需要验证
ENV MYSQL_ALLOW_EMPTY_PASSWORD=yes

WORKDIR /app

# 安装依赖
COPY package.json /app
RUN npm install --production

# 复制编译后的代码
COPY bin /app/bin

# 健康检查
COPY node_modules/service-starter/docker/health_check.sh /app


HEALTHCHECK \
# 每次检查的间隔时间
    --interval=5s \
# 单次检查的超时时长
    --timeout=30s \
# 这个可以理解为在开始正式检查之前容器所需要的启动时间
    --start-period=30s \
# 连续多少次检查失败可判定该服务是unhealthy
    --retries=3 \
# 调用程序所暴露出的健康检查接口
    CMD /app/health_check.sh

CMD [ "/app/" ]