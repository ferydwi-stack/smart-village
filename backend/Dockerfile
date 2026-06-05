# Build stage
FROM golang:alpine AS builder

WORKDIR /app

# Install git for fetching dependencies if needed
RUN apk add --no-cache git

COPY go.mod ./
COPY . .

RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/server

# Run stage
FROM alpine:latest

WORKDIR /app

# Add a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/main .

# Create uploads directory and change ownership
RUN mkdir -p /app/uploads/products && chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

CMD ["./main"]
