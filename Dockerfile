# syntax=docker/dockerfile:1

# ---- Build stage: compile the Vite SPA + bundle the Express server ----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Build SPA (-> dist/) and server bundle (-> dist/server.cjs)
COPY . .
RUN npm run build

# ---- Runtime stage: run the Express server with Node ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Production deps only (server bundle uses --packages=external)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Built assets + server bundle
COPY --from=build /app/dist ./dist

EXPOSE 3000

# Container healthcheck against the running server
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --spider http://localhost:3000/ || exit 1

CMD ["node", "dist/server.cjs"]
