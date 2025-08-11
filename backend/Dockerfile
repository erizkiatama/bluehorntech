FROM golang:1.24-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git curl

# Download and install migrate tool
RUN curl -L https://github.com/golang-migrate/migrate/releases/latest/download/migrate.linux-amd64.tar.gz | tar xvz && \
    mv migrate /usr/local/bin/migrate

COPY go.mod go.sum ./
RUN go mod download

COPY .. .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main cmd/server/main.go

FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/

# Copy the built application
COPY --from=builder /app/main .

# Copy configuration files
COPY --from=builder /app/config ./config

# 🚀 Copy migrate binary and migration files
COPY --from=builder /usr/local/bin/migrate /usr/local/bin/migrate
COPY --from=builder /app/migrations ./migrations

EXPOSE 8080

# 🔧 Run migrations then start app
CMD sh -c "migrate -path ./migrations -database \"$DATABASE_URL\" up && ./main"
