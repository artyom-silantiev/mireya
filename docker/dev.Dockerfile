FROM oven/bun:1-debian AS base

# install nodejs for prisma generate step (-_-)
FROM base AS bun_and_node
ARG NODE_VERSION=20
RUN apt update \
    && apt install -y curl
RUN curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n \
    && bash n $NODE_VERSION \
    && rm n \
    && npm install -g n

# install node modules
FROM bun_and_node AS install
WORKDIR /temp/dev
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
# prisma generate
COPY ./prisma ./prisma
RUN bunx prisma generate

# copy node modules from install and app sources
FROM bun_and_node AS release
WORKDIR /app
COPY --from=install /temp/dev/node_modules node_modules
COPY .env ./
COPY tsconfig.json ./
COPY src src
COPY prisma prisma
COPY tests tests
COPY static static
COPY assets assets

# ENV
ENV NODE_PORT=3000


# run the app
EXPOSE 3000/tcp
CMD bunx prisma migrate dev && bun src/app_main/index.ts

