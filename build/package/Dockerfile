FROM golang:alpine as builder

RUN apk add make g++ libc-dev

WORKDIR /app

COPY . .

RUN make build

FROM alpine:latest

COPY --from=builder /app/micrantha /app/

COPY --from=builder /app/web/template /app/template

COPY --from=builder /app/website /app/public

WORKDIR /app

ARG port=3778

ENV PORT=$port

ENV MICRANTHA_TEMPLATE_PATH="/app/template"

ENV MICRANTHA_PUBLIC_PATH="/app/public"

CMD ["sh", "-c", "./micrantha -port $PORT"]

EXPOSE $port