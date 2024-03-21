FROM node:18.13.0 

# 设置工作目录
WORKDIR /app

# 拷贝 package.json 和 package-lock.json 到工作目录
COPY package*.json ./

# 安装依赖
RUN npm install

# 拷贝应用程序代码到工作目录
COPY . .

COPY init.sql /docker-entrypoint-initdb.d/init.sql

# 暴露端口
EXPOSE 3000

# 启动应用程序
CMD ["npm", "start"]
