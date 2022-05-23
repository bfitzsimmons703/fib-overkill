FROM rust:1.60 as builder

WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:buster-slim

WORKDIR /app

COPY --from=builder /app/target/release/worker ./worker

CMD ["./worker"]