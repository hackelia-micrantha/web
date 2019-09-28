FROM golang:alpine as builder

RUN apk add make g++ libc-dev

WORKDIR /app

COPY . .

RUN make build

FROM alpine:latest

COPY --from=builder /app/micrantha /app/website /app/

COPY --from=builder /app/web/template /app/web/

WORKDIR /app

ARG port=3778

ENV PORT=$port

CMD ["sh", "-c", "./micrantha -port $PORT"]

EXPOSE 3778