FROM mysql:5.7.19

# 启动mysql不需要验证
ENV MYSQL_ALLOW_EMPTY_PASSWORD=yes

# http 插件的版本
ENV MYSQL_UDF_HTTP=1.0.0

# node版本号
ENV NODE_VERSION 8.4.0
ENV NPM_CONFIG_LOGLEVEL info

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

# 下载依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    xz-utils \
    curl \
    libcurl4-openssl-dev \
	&& rm -rf /var/lib/apt/lists/*

# 这个二进制版本是在ubuntu16.04,64位 版本下编译完成的
COPY mysql-udf-http.so /usr/lib/mysql/plugin

# 安装node
RUN curl -SLO "http://cdn.npm.taobao.org/dist/node/latest/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.xz" \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs

ENTRYPOINT [ "/usr/local/bin/node" ]

# 复制编译后的代码
COPY bin /app

CMD [ "/app/" ]