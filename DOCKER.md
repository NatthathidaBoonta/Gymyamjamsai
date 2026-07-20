# Docker Setup Guide — Gymyamjamsai

วิธี run Gymyamjamsai ทั้ง stack ด้วย Docker Compose ที่มี Frontend, Backend, และ MySQL ในเพียงคำสั่งเดียว

## Prerequisites

- **Docker Desktop** (Windows/Mac) หรือ **Docker Engine** (Linux)
- **Docker Compose** (รวมใน Docker Desktop อยู่แล้ว)
- **Git**

## Quick Start

```bash
# 1. Clone repository (ถ้ายังไม่มี)
git clone https://github.com/your-org/gymyamjamsai.git
cd gymyamjamsai

# 2. Copy environment file
cp .env.example .env
# (adjust MySQL passwords in .env if needed)

# 3. Start all services
docker-compose up -d

# 4. Wait for MySQL to initialize (15-30 seconds)
# Check logs:
docker-compose logs -f mysql

# 5. Access the application
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
# phpMyAdmin: http://localhost:8081
#   (Username: root, Password: from .env MYSQL_ROOT_PASSWORD)
```

## Services

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Frontend** | 5173 | http://localhost:5173 | Vite dev server (React 19 + Vite) |
| **Backend** | 5000 | http://localhost:5000 | Node.js Express API |
| **MySQL** | 3306 | localhost:3306 | Database (initialized with seed scripts) |
| **phpMyAdmin** | 8081 | http://localhost:8081 | Database GUI (optional) |

## Environment Variables

Edit `.env` to customize:

```env
MYSQL_ROOT_PASSWORD=rootpassword        # MySQL root password
MYSQL_DATABASE=gymyamjamsai            # Database name
MYSQL_USER=gymuser                      # Database user
MYSQL_PASSWORD=gympassword              # Database password
```

**Note:** Backend and Frontend have their own `.env` files in their directories. Docker Compose uses the root `.env` to configure MySQL and passes those to backend/frontend services.

## Common Commands

```bash
# Start services (detached)
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v

# View logs
docker-compose logs -f              # All services
docker-compose logs -f backend      # Specific service

# Execute command inside container
docker-compose exec backend npm run build
docker-compose exec mysql mysql -uroot -p$MYSQL_ROOT_PASSWORD

# Rebuild images (useful after dependency changes)
docker-compose build
docker-compose up -d --no-deps

# Check service status
docker-compose ps
```

## Troubleshooting

### MySQL not initialized
```bash
# Check MySQL logs
docker-compose logs mysql

# Ensure init scripts exist
ls -la mysql/init/
```

### Frontend can't connect to Backend
- Verify backend is running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`
- Frontend .env should use `http://localhost:5000` (local) or configured API URL

### Port already in use
```bash
# Find process using port
lsof -i :5173    # Frontend
lsof -i :5000    # Backend
lsof -i :3306    # MySQL
lsof -i :8081    # phpMyAdmin

# Change port in docker-compose.yml (e.g., "5174:5173" for frontend)
```

### Permission issues (Linux)
```bash
# Run docker-compose with sudo if permission denied
sudo docker-compose up -d
# OR add user to docker group:
sudo usermod -aG docker $USER
# Then logout and login again
```

## Development Workflow

- **Frontend source**: `./frontend/src/` — changes auto-reload via Vite HMR
- **Backend source**: `./backend/src/` — changes auto-restart via nodemon
- **Database**: Persists in Docker volume `mysql_data`

Edit files locally → changes appear in running containers automatically (hot-reload).

## Database Initialization

On first run, MySQL initializes using scripts in `./mysql/init/`:
- `01-schema.sql` — Creates tables (10-table schema per ERD)
- `02-seed.sql` — Populates test data (admin, trainer, member users)

To re-initialize database:
```bash
docker-compose down -v          # Remove volume
docker-compose up -d            # Reinitialize from scripts
```

## Production Build

This setup is for **development**. For production, use:
- Multi-stage Dockerfile (frontend: build → serve with nginx or backend)
- Environment-specific configurations
- Proper secret management (don't hardcode passwords)

See `Phase 15: Production Deployment Guide` for Railway/cloud deployment.

---

**Tested on:** Windows 11 (Docker Desktop), macOS (Homebrew Docker), Ubuntu 22.04 (Docker Engine)
