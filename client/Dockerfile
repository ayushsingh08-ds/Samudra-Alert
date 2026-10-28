# Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY client/package.json client/

RUN npm ci --workspace client --workspace shared --include-workspace-root=false || npm install --workspace client --workspace shared

COPY shared/ shared/
COPY client/ client/
RUN npm run build -w client

# Runtime stage: nginx
FROM nginx:alpine
COPY --from=build /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
