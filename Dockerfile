# =============================================================
# Stage 1: BUILD — compiles the TypeScript code
# =============================================================
FROM node:22-alpine AS build
WORKDIR /app

# Manifests first, to leverage Docker layer caching
COPY package*.json ./
RUN npm ci

# Copies build configs + source code and compiles
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

# =============================================================
# Stage 2: PRODUCTION — slim image for AWS EC2/ECS
# =============================================================
FROM node:22-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

# Runtime dependencies only (no devDependencies)
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copies the compiled artifact from the build stage
COPY --from=build /app/dist ./dist

# Best practice for containers (do not run as root)
USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
