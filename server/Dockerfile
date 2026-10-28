# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Workspace root files needed for @samudra/shared resolution
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/

RUN npm ci --workspace server --workspace shared --include-workspace-root=false || npm install --workspace server --workspace shared

COPY shared/ shared/
COPY server/ server/
RUN npm run build -w shared && npm run build -w server

# Runtime stage
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/shared ./shared
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/package.json ./server/

WORKDIR /app/server
EXPOSE 5000
CMD ["node", "dist/index.js"]
