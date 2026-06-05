# DesaMart - Village Marketplace Platform

DesaMart is a complete, containerized microservices platform designed for village marketplaces. This setup provides a production-ready infrastructure using Docker Compose.

## Microservices Architecture

- **Reverse Proxy**: Nginx (Alpine)
- **Frontend**: Next.js 14
- **Backend API**: Go + Fiber v2
- **NLP Service**: Python 3.11 + FastAPI
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Object Storage**: MinIO

## Prerequisites

Ensure you have the following installed on your system:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

## Quick Start

1. **Clone the repository** (or navigate to this directory).
2. **Copy the environment file**:
   ```bash
   cp .env.example .env
   ```
   *Modify the `.env` file with your desired credentials.*

3. **Build and start the services**:
   ```bash
   docker compose up --build
   ```

4. **Access the services**:
   - **Frontend**: [http://localhost:3000](http://localhost:3000) (or via Nginx on [http://localhost](http://localhost))
   - **Backend API**: [http://localhost:8080](http://localhost:8080) (or via Nginx on [http://localhost/api/](http://localhost/api/))
   - **NLP Service**: [http://localhost:8000](http://localhost:8000)
   - **MinIO Console**: [http://localhost:9001](http://localhost:9001) (API on port 9000)

## Service URLs (Direct Access)

| Service | URL | Port |
| --- | --- | --- |
| Nginx (Entry Point) | `http://localhost` | 80 |
| Frontend | `http://localhost:3000` | 3000 |
| Backend | `http://localhost:8080` | 8080 |
| NLP Service | `http://localhost:8000` | 8000 |
| PostgreSQL | `localhost` | 5432 |
| Redis | `localhost` | 6379 |
| MinIO API | `http://localhost:9000` | 9000 |
| MinIO Console | `http://localhost:9001` | 9001 |

## Development Notes

- **Next.js 14**: The frontend is configured for production using a multi-stage build and the standalone output feature. Ensure your `next.config.js` includes `output: 'standalone'`.
- **Go Backend**: The backend uses a multi-stage build for a minimal final image size.
- **Python NLP Service**: Volumes are configured to persist models in the `nlp-models` volume.
