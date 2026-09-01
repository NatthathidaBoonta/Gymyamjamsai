# Gym Yamjamsai - Production Deployment Guide

**Status:** Phase 15 Production Deployment

**Last Updated:** 2026-07-20

---

## Table of Contents

1. [Quick Start (Docker Compose)](#1-quick-start-docker-compose)
2. [Railway.app Deployment](#2-railwayapp-deployment)
3. [Manual Server Deployment](#3-manual-server-deployment)
4. [Environment Configuration](#4-environment-configuration)
5. [Database Migration & Setup](#5-database-migration--setup)
6. [SSL/HTTPS Configuration](#6-sslhttps-configuration)
7. [Monitoring & Logging](#7-monitoring--logging)
8. [Backup & Recovery](#8-backup--recovery)
9. [Troubleshooting](#9-troubleshooting)
10. [Post-Deployment Verification](#10-post-deployment-verification)

---

## 1. Quick Start (Docker Compose)

### 1.1 Prerequisites
```bash
# Required
- Docker 20.10+
- Docker Compose 1.29+
- Git
- 2GB RAM, 5GB disk space

# Verify installation
docker --version
docker-compose --version
```

### 1.2 Clone & Setup
```bash
# Clone repository
git clone https://github.com/your-org/gym-yamjamsai.git
cd gym-yamjamsai

# Create production environment file
cp .env.production.example .env

# Edit .env with production values
nano .env  # or use your editor
# Set: MYSQL_ROOT_PASSWORD, JWT_SECRET, FRONTEND_ORIGIN, VITE_API_URL, etc.
```

### 1.3 Build Production Images
```bash
# Build images using Dockerfile.prod
docker-compose -f docker-compose.prod.yml build

# Expected output:
# - Building mysql (pre-built image, skipped)
# - Building backend (multi-stage, ~2 min)
# - Building frontend (multi-stage, ~3 min)
```

### 1.4 Start Services
```bash
# Start all services (MySQL will initialize on first run)
docker-compose -f docker-compose.prod.yml up -d

# Wait 30 seconds for MySQL initialization
sleep 30

# Verify all services healthy
docker-compose -f docker-compose.prod.yml ps

# Expected output:
# STATUS: "Up (healthy)" for all services
```

### 1.5 Verify Deployment
```bash
# Check backend health
curl http://localhost:5000/api/health

# Expected response:
# {"status":"ok"}

# Check frontend
open http://localhost:80  # Visit in browser
# Should see login page

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'

# Expected: JWT token in response
```

### 1.6 View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Exit logs: Ctrl+C
```

### 1.7 Stop Services
```bash
# Stop all services (preserve volumes/data)
docker-compose -f docker-compose.prod.yml down

# Stop and remove data (careful!)
docker-compose -f docker-compose.prod.yml down -v
```

---

## 2. Railway.app Deployment

Railway is a PaaS platform perfect for deploying this stack with minimal DevOps.

### 2.1 Prerequisites
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
# Opens browser → Login/Signup → Authorize CLI

# Verify login
railway whoami
```

### 2.2 Create Railway Project
```bash
# Initialize Railway project
railway init

# Select: Create new project
# Enter project name: gym-yamjamsai
# Select region: Closest to your users (e.g., us-west-1)

# Verify project created
railway status
```

### 2.3 Create MySQL Database Service
```bash
# Add MySQL service
railway add

# Select: MySQL
# Configure:
#   - Database name: gymyamjamsai_prod
#   - Username: gymyam_user
#   - Password: [Generate strong password]
#   - Port: 3306

# Verify service added
railway services

# Get database URL (for backend env var)
railway env DATABASE_URL
# Copy this value for later
```

### 2.4 Create Backend Service (Node.js)
```bash
# Add Node.js service
railway add

# Select: Node.js
# Configure build:
#   - Build command: cd backend && npm install
#   - Start command: node server.js

# Set environment variables
railway env set PORT=5000
railway env set NODE_ENV=production
railway env set FRONTEND_ORIGIN=https://your-production-domain.com
railway env set VITE_API_URL=https://api.your-production-domain.com

# Generate strong JWT secret
railway env set JWT_SECRET=$(openssl rand -hex 32)

# Connect to MySQL (Railway auto-provides DATABASE_URL)
# Backend must use DATABASE_URL or parse it:
# const dbUrl = process.env.DATABASE_URL
# Example: mysql://gymyam_user:password@host:3306/gymyamjamsai_prod
```

### 2.5 Create Frontend Service (Node.js + Build)
```bash
# Add Node.js service for frontend
railway add

# Select: Node.js
# Configure build:
#   - Build command: cd frontend && npm install && npm run build
#   - Start command: npm install -g http-server && http-server dist

# Set environment variables
railway env set VITE_API_URL=https://api.your-production-domain.com

# Deploy
railway up frontend
```

### 2.6 Configure Domain & SSL
```bash
# Get backend URL from Railway dashboard
# Format: backend-service-uuid.railway.app

# Set custom domain (if using your own domain)
railway domain --service backend --domain api.your-production-domain.com

# Railway auto-provisions SSL certificate (Let's Encrypt)
# HTTPS enabled by default

# Point DNS records:
# api.your-production-domain.com → backend-service.railway.app (CNAME)
# your-production-domain.com → frontend-service.railway.app (CNAME)
```

### 2.7 Deploy All Services
```bash
# Deploy entire project
railway up

# Monitor deployment
railway logs -f

# Verify all services
railway status

# Expected:
# - mysql: Running
# - backend: Running
# - frontend: Running
```

### 2.8 Post-Deployment
```bash
# Test backend API
curl https://api.your-production-domain.com/api/health

# Test frontend
open https://your-production-domain.com

# View logs
railway logs backend
railway logs frontend
```

---

## 3. Manual Server Deployment

For traditional VPS/Cloud servers (AWS EC2, DigitalOcean, Linode, etc.)

### 3.1 Server Setup
```bash
# SSH into server
ssh -i ~/.ssh/private.key ubuntu@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu  # Allow docker without sudo
exit && ssh back in

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 3.2 Deploy Application
```bash
# Clone repository
git clone https://github.com/your-org/gym-yamjamsai.git
cd gym-yamjamsai

# Create production .env
nano .env
# Paste content from .env.production.example and set real values
# CRITICAL: JWT_SECRET, MYSQL_ROOT_PASSWORD, Database credentials

# Make startup script executable
chmod +x ./scripts/start-prod.sh

# Start services
./scripts/start-prod.sh
# Or: docker-compose -f docker-compose.prod.yml up -d
```

### 3.3 Configure Reverse Proxy (Nginx)
```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/gym-yamjamsai

# Paste config:
server {
    listen 80;
    server_name api.your-production-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name your-production-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/gym-yamjamsai /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx  # Start on boot
```

### 3.4 SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.your-production-domain.com -d your-production-domain.com

# Auto-renewal (configured by certbot)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 3.5 Firewall Rules
```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verify rules
sudo ufw status
```

### 3.6 Systemd Service (Auto-start)
```bash
# Create systemd service file
sudo nano /etc/systemd/system/gym-yamjamsai.service

# Paste:
[Unit]
Description=Gym Yamjamsai Docker Compose
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/gym-yamjamsai
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target

# Enable service
sudo systemctl daemon-reload
sudo systemctl enable gym-yamjamsai
sudo systemctl start gym-yamjamsai

# Verify
sudo systemctl status gym-yamjamsai
```

---

## 4. Environment Configuration

### 4.1 Critical Environment Variables
```bash
# Copy and fill in all values before starting

# Database
MYSQL_ROOT_PASSWORD=<strong-password>        # Required
MYSQL_DATABASE=gymyamjamsai_prod            # Required
MYSQL_USER=gymyam_user                      # Required
MYSQL_PASSWORD=<strong-password>            # Required

# Backend
PORT=5000                                    # Default: 5000
NODE_ENV=production                         # Required: production
FRONTEND_ORIGIN=https://yourdomain.com     # Required: CORS
JWT_SECRET=<64-char-hex-string>            # Required: generate new!
JWT_EXPIRES_IN=24h                         # Default: 24h

# Frontend
VITE_API_URL=https://api.yourdomain.com    # Required: API endpoint
```

### 4.2 Generate Strong Secrets
```bash
# Generate JWT_SECRET (Linux/Mac)
openssl rand -hex 32

# Generate MYSQL_ROOT_PASSWORD
openssl rand -base64 32

# Generate MYSQL_PASSWORD
openssl rand -base64 32
```

### 4.3 Security Best Practices
- [ ] Never commit .env file to git
- [ ] Use different passwords for each environment (dev, staging, prod)
- [ ] Rotate JWT_SECRET every 90 days
- [ ] Use managed database service (RDS, Railway) instead of Docker volume
- [ ] Store secrets in vault (AWS Secrets Manager, HashiCorp Vault)
- [ ] Don't hardcode API URLs, use environment variables
- [ ] Use HTTPS only in production

---

## 5. Database Migration & Setup

### 5.1 Initial Setup (First Deploy)
```bash
# Database auto-initializes from mysql/init/*.sql
# On first docker-compose up:
# 1. MySQL container starts
# 2. Runs 01-schema.sql (creates tables)
# 3. Runs 02-seed.sql (adds test data)
# 4. Runs 03-notifications.sql (creates notifications table)

# Verify tables created
docker-compose -f docker-compose.prod.yml exec mysql mysql \
  -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} \
  -e "SHOW TABLES;"

# Expected tables:
# - users
# - workouts
# - workout_plans
# - workout_schedule
# - exercises
# - notifications
```

### 5.2 Database Backup
```bash
# Backup before production changes
docker-compose -f docker-compose.prod.yml exec mysql mysqldump \
  -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} \
  > backup-$(date +%Y%m%d-%H%M%S).sql

# Verify backup
ls -lh backup-*.sql

# Store backup securely (AWS S3, Google Cloud Storage, etc.)
aws s3 cp backup-2026-07-20-120000.sql s3://your-bucket/backups/
```

### 5.3 Database Restore
```bash
# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T mysql mysql \
  -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} \
  < backup-2026-07-20-120000.sql

# Verify restore
docker-compose -f docker-compose.prod.yml exec mysql mysql \
  -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} \
  -e "SELECT COUNT(*) FROM users;"
```

### 5.4 Schema Updates
```bash
# For future schema changes, create migration file:
# migrations/001-add-column.sql

# Apply migration
docker-compose -f docker-compose.prod.yml exec mysql mysql \
  -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} \
  < migrations/001-add-column.sql

# Create backup after each schema change
```

---

## 6. SSL/HTTPS Configuration

### 6.1 Self-Signed Certificate (Testing Only)
```bash
# Generate self-signed cert (NOT FOR PRODUCTION)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Use in Nginx:
ssl_certificate /etc/nginx/ssl/cert.pem;
ssl_certificate_key /etc/nginx/ssl/key.pem;
```

### 6.2 Let's Encrypt (FREE, Recommended)
```bash
# Already configured in section 3.4
# Certbot auto-renews every 90 days

# Manual renewal
sudo certbot renew

# Verify certificate
openssl s_client -connect your-production-domain.com:443
```

### 6.3 Nginx HTTPS Config
```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name your-production-domain.com api.your-production-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name api.your-production-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-production-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-production-domain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

---

## 7. Monitoring & Logging

### 7.1 Docker Logs
```bash
# Real-time logs
docker-compose -f docker-compose.prod.yml logs -f

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# Logs are auto-rotated (max-size: 10m, max-file: 3)
```

### 7.2 Sentry Integration (Error Tracking)
```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Backend: Add to backend/server.js
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });
app.use(Sentry.Handlers.errorHandler());

# Frontend: Add to frontend/src/main.tsx
import * as Sentry from "@sentry/react";
Sentry.init({ dsn: process.env.VITE_SENTRY_DSN });

# Set environment variable
railway env set SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
```

### 7.3 Health Checks
```bash
# Backend health endpoint (configured in docker-compose.prod.yml)
curl https://api.your-production-domain.com/api/health

# Expected: { "status": "ok" }

# Frontend health (Nginx responds to root)
curl https://your-production-domain.com/

# Expected: HTML content (login page)
```

### 7.4 Performance Monitoring
```bash
# Check container resource usage
docker stats gymyamjamsai_backend_prod
docker stats gymyamjamsai_frontend_prod
docker stats gymyamjamsai_mysql_prod

# Expected:
# - Backend: < 200MB RAM
# - Frontend: < 50MB RAM (nginx)
# - MySQL: < 500MB RAM (depends on data)

# Monitor server
top  # CPU, RAM
df -h  # Disk space
```

---

## 8. Backup & Recovery

### 8.1 Automated Backups
```bash
# Create backup script: scripts/backup-daily.sh
#!/bin/bash
BACKUP_DIR="/backups"
mkdir -p $BACKUP_DIR

# Backup database
docker-compose -f docker-compose.prod.yml exec mysql mysqldump \
  -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} \
  | gzip > $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup-*.sql.gz" -mtime +30 -delete

# Schedule with cron (daily at 2 AM)
# 0 2 * * * /home/ubuntu/gym-yamjamsai/scripts/backup-daily.sh
```

### 8.2 Off-Site Backup
```bash
# Upload to AWS S3
aws s3 sync /backups/ s3://your-backup-bucket/gym-yamjamsai/

# Or use Railway backup service (auto-configured)
# Check Railway dashboard → MySQL service → Backups
```

### 8.3 Disaster Recovery
```bash
# If database corrupted or lost:

# 1. Stop services
docker-compose -f docker-compose.prod.yml down

# 2. Remove database volume
docker volume rm gymyamjamsai_mysql_data_prod

# 3. Start services (MySQL reinitializes)
docker-compose -f docker-compose.prod.yml up -d

# OR restore from backup:
docker-compose -f docker-compose.prod.yml exec mysql mysql \
  -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} \
  < backup-latest.sql

# 4. Verify data
docker-compose -f docker-compose.prod.yml exec mysql mysql \
  -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} \
  -e "SELECT COUNT(*) FROM users;"
```

---

## 9. Troubleshooting

### 9.1 Services Won't Start
```bash
# Check docker daemon
sudo systemctl status docker

# Check logs
docker-compose -f docker-compose.prod.yml logs

# Common issues:
# - Port already in use: lsof -i :5000
# - Out of disk space: df -h
# - Out of memory: free -h
```

### 9.2 Database Connection Fails
```bash
# Test MySQL connectivity
docker-compose -f docker-compose.prod.yml exec backend \
  nc -zv mysql 3306

# Check credentials
docker-compose -f docker-compose.prod.yml exec mysql mysql \
  -h mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} -e "SELECT 1;"

# Verify environment variables
docker-compose -f docker-compose.prod.yml exec backend \
  env | grep DB_
```

### 9.3 Frontend Can't Connect to API
```bash
# Check CORS configuration
curl -H "Origin: https://your-production-domain.com" \
  https://api.your-production-domain.com/api/health

# Check VITE_API_URL set correctly
docker-compose -f docker-compose.prod.yml exec frontend \
  env | grep VITE_API_URL

# Check Nginx reverse proxy
curl https://api.your-production-domain.com/api/health
```

### 9.4 Slow Performance
```bash
# Check resource usage
docker stats

# Check database queries (enable slow query log)
docker-compose -f docker-compose.prod.yml exec mysql mysql \
  -u${MYSQL_USER} -p${MYSQL_PASSWORD} -e \
  "SET GLOBAL slow_query_log = 'ON'; SET GLOBAL long_query_time = 2;"

# Check logs for errors
docker-compose -f docker-compose.prod.yml logs backend | grep -i error

# Check database indexes
docker-compose -f docker-compose.prod.yml exec mysql mysql \
  -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} \
  -e "SHOW INDEX FROM users;"
```

---

## 10. Post-Deployment Verification

### 10.1 Smoke Test Checklist
```bash
# API Health
curl https://api.your-production-domain.com/api/health
# Expected: {"status":"ok"}

# User Registration
curl -X POST https://api.your-production-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test@123",
    "firstName": "Test",
    "lastName": "User"
  }'
# Expected: 201, JWT token

# User Login
curl -X POST https://api.your-production-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "admin123"}'
# Expected: JWT token

# Frontend Access
open https://your-production-domain.com
# Expected: Login page loads

# Authenticated API Call
TOKEN="<jwt-from-login>"
curl https://api.your-production-domain.com/api/member/dashboard \
  -H "Authorization: Bearer $TOKEN"
# Expected: User dashboard data
```

### 10.2 Security Verification
```bash
# Check HTTPS
curl -I https://your-production-domain.com
# Expected: 200, Security headers present

# Check HSTS header
curl -I https://your-production-domain.com | grep Strict-Transport
# Expected: Strict-Transport-Security present

# Check Certificate validity
openssl s_client -connect your-production-domain.com:443 -showcerts
# Expected: Valid certificate, not self-signed
```

### 10.3 Monitoring Setup
- [ ] Sentry error tracking connected
- [ ] Prometheus/Grafana dashboards (optional)
- [ ] Log aggregation service (optional)
- [ ] Uptime monitoring (UptimeRobot, StatusCake)
- [ ] Email alerts configured
- [ ] On-call rotation established

### 10.4 Documentation
- [ ] Production domain documented
- [ ] Admin credentials stored in vault
- [ ] Runbook for common issues created
- [ ] Team trained on deployment process
- [ ] Backup schedule verified

---

## 11. Rollback Procedure

If critical issue discovered post-deployment:

```bash
# View release history
git log --oneline --graph

# Rollback to previous version
git checkout <commit-hash>

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Verify
curl https://api.your-production-domain.com/api/health
```

---

## 12. Maintenance Schedule

**Daily:**
- Monitor error logs (Sentry)
- Check server resource usage

**Weekly:**
- Review database performance
- Verify backup completion
- Check SSL certificate expiration

**Monthly:**
- Database optimization
- Security audit
- Dependency updates (if safe)

**Quarterly:**
- JWT_SECRET rotation
- SSL certificate renewal (should be auto)
- Load testing

**Annually:**
- Full infrastructure review
- Disaster recovery drill
- Security assessment

---

**Deployment Complete** ✅

Application ready for production traffic. Monitor logs and system health continuously.

For support, contact DevOps team or check troubleshooting section.
