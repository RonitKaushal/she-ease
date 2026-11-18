#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/var/www/sheease
DOMAIN="${1:-sheease.arcticbase.tech}"
PUBLIC_URL="${2:-http://13.140.187.9}"

export DEBIAN_FRONTEND=noninteractive

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

apt-get update -y
apt-get install -y nginx

npm install -g pm2 2>/dev/null || true

mkdir -p "$APP_DIR" /var/www/sheease/public/uploads
cd "$APP_DIR"

if [ -f /tmp/sheease-web.tar.gz ]; then
  tar -xzf /tmp/sheease-web.tar.gz -C "$APP_DIR"
fi

# Prefer .env.production if present
if [ -f .env.production ]; then
  cp .env.production .env.local
fi

# Install deps and build
npm install --legacy-peer-deps --omit=dev
npm install --legacy-peer-deps dotenv tsx --no-save
npm run build

# PM2
pm2 delete sheease 2>/dev/null || true
PORT=3000 NODE_ENV=production HOSTNAME=0.0.0.0 pm2 start server.js --name sheease
pm2 save
pm2 startup systemd -u root --hp /root >/tmp/pm2-startup.txt 2>&1 || true
bash /tmp/pm2-startup.txt 2>/dev/null || true

# Nginx
cp /tmp/nginx-sheease.conf /etc/nginx/sites-available/sheease
sed -i "s/sheease.arcticbase.tech/$DOMAIN/g" /etc/nginx/sites-available/sheease || true
ln -sfn /etc/nginx/sites-available/sheease /etc/nginx/sites-enabled/sheease
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# Open firewall if ufw exists
if command -v ufw >/dev/null 2>&1; then
  ufw allow 80/tcp || true
  ufw allow 443/tcp || true
  ufw allow 22/tcp || true
fi

echo "DEPLOY_OK $PUBLIC_URL"
curl -sI "http://127.0.0.1:3000" | head -5 || true
