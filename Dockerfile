# Use official Bun base image
FROM oven/bun:1-debian AS base
WORKDIR /usr/src/app
RUN apt-get update -y && apt-get install -y git openssl
RUN git clone --depth 1 -b RELEASE_TAG https://github.com/netchimken/noto.git .

# --- Install dev dependencies ---
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
COPY prisma /temp/dev
RUN cd /temp/dev && bun install --frozen-lockfile && bun run db:gen

# --- Install production dependencies ---
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
COPY prisma /temp/prod
RUN cd /temp/prod && bun install --frozen-lockfile --production && bun run db:gen

# --- Build the app ---
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
ENV NODE_ENV=production
RUN bun run build

# --- Final image ---
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/build build
COPY --from=prerelease /usr/src/app/package.json .

USER bun
EXPOSE 3000
ENTRYPOINT ["bun", "run", "build/index.js"]
