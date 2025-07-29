FROM node:slim AS base

WORKDIR /app

# BUILD DEPS
FROM base AS build-deps

ENV NODE_ENV=development

ADD package.json yarn.lock ./

RUN yarn

# PROD DEPS
FROM base AS production-deps

ENV NODE_ENV=production

ADD package.json yarn.lock ./

RUN yarn

# BUILD
FROM build-deps AS build

ENV NODE_ENV=development

ADD . .

RUN NODE_ENV=production yarn build

FROM base

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/public /app/public
COPY --from=build /app/build /app/build
ADD package.json /app/

CMD ["yarn", "start"]
