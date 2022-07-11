FROM registry.gitlab.com/micrantha/micra as builder

RUN apk update

# install necessary packages for build
RUN apk add build-base g++ yarn autoconf automake nodejs libtool pkgconf nasm zlib-dev python2

# define working directory
WORKDIR /app

# copy the current project to container
COPY . .

# build the distribution
RUN make dist

# simplify
FROM alpine:latest

# copy the necessary files from the build image
COPY --from=builder /app/bin /app/bin

COPY --from=builder /app/web/public /app/public

# set the working directory
WORKDIR /app

# define arguments for running
ARG port=${PORT:-8080}

# define default environment
ENV PORT=$port
ENV MICRANTHA_PUBLIC_PATH="/app/public"

HEALTHCHECK CMD /app/bin/health-check -port $PORT

# define the command

CMD /app/bin/micrantha -port $PORT

# report which port
EXPOSE $port