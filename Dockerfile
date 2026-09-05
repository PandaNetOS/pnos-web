# 构建阶段
FROM node:20-bookworm-slim AS builder
WORKDIR /build
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 产物阶段：只存静态文件
FROM scratch
COPY --from=builder /build/dist /dist
