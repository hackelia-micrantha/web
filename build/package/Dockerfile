FROM registry.gitlab.com/micrantha/micra as builder

# install necessary packages for build
RUN apk add g++ yarn autoconf automake nodejs-current zlib-dev

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

COPY --from=builder /app/web/template /app/template

COPY --from=builder /app/web/public /app/public

# set the working directory
WORKDIR /app

# define arguments for running
ARG port=3778

# define default environment
ENV PORT=$port
ENV MICRANTHA_TEMPLATE_PATH="/app/template"
ENV MICRANTHA_PUBLIC_PATH="/app/public"

# define the command
CMD ["sh", "-c", "/app/bin/micrantha -port $PORT"]

# report which port
EXPOSE $port