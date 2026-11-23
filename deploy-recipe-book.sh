#!/usr/bin/env bash
set -Eeuo pipefail

REPO_URL="https://github.com/utkrista700/recipe-book.git"
APP_DIR="/opt/recipe-book"
PROJECT_DIR="$APP_DIR"
WEB_DIR="/var/www/recipe-book"
ENV_FILE="/etc/recipe-book.env"
SERVICE_NAME="recipe-book-api"
NGINX_CONFIG="/etc/nginx/conf.d/recipe-book.conf"
DEPLOY_USER="${SUDO_USER:-ec2-user}"

if [[ "$EUID" -ne 0 ]]; then
  echo "Run this script with sudo: sudo ./deploy-recipe-book.sh" >&2
  exit 1
fi

if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  echo "Deployment user '$DEPLOY_USER' does not exist." >&2
  exit 1
fi

read -rsp "Paste your MongoDB URI for the recipebook database: " MONGO_URI
echo
if [[ ! "$MONGO_URI" =~ ^mongodb(\+srv)?://[^/?#]+/recipebook(\?[^#]*)?$ ]]; then
  echo "Enter a MongoDB URI that selects the recipebook database, such as mongodb+srv://USER:PASS@HOST/recipebook?retryWrites=true&w=majority." >&2
  exit 1
fi

dnf update -y
dnf install -y nodejs npm git nginx rsync

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if (( NODE_MAJOR < 18 )); then
  echo "Node.js 18 or newer is required by this project; found $(node --version)." >&2
  exit 1
fi

DEPLOY_GROUP="$(id -gn "$DEPLOY_USER")"
install -d -o "$DEPLOY_USER" -g "$DEPLOY_GROUP" "$APP_DIR"

if [[ -d "$APP_DIR/.git" ]]; then
  runuser -u "$DEPLOY_USER" -- git -C "$APP_DIR" pull --ff-only origin main
else
  if [[ -n "$(find "$APP_DIR" -mindepth 1 -maxdepth 1 -print -quit)" ]]; then
    echo "$APP_DIR exists and is not an empty Git checkout; refusing to overwrite it." >&2
    exit 1
  fi
  runuser -u "$DEPLOY_USER" -- git clone --branch main --single-branch "$REPO_URL" "$APP_DIR"
fi

if [[ ! -f "$PROJECT_DIR/backend/package.json" || ! -f "$PROJECT_DIR/frontend/package.json" ]]; then
  echo "Expected frontend/ and backend/ under $PROJECT_DIR; check the repository layout." >&2
  exit 1
fi

runuser -u "$DEPLOY_USER" -- npm --prefix "$PROJECT_DIR/backend" ci
runuser -u "$DEPLOY_USER" -- npm --prefix "$PROJECT_DIR/frontend" ci
runuser -u "$DEPLOY_USER" -- npm --prefix "$PROJECT_DIR/frontend" run build

install -d -o root -g root -m 755 "$WEB_DIR"
rsync -a --delete "$PROJECT_DIR/frontend/dist/" "$WEB_DIR/"
chown -R root:root "$WEB_DIR"
find "$WEB_DIR" -type d -exec chmod 755 {} +
find "$WEB_DIR" -type f -exec chmod 644 {} +

escaped_uri="${MONGO_URI//\\/\\\\}"
escaped_uri="${escaped_uri//\"/\\\"}"
env_tmp="$(mktemp "${ENV_FILE}.XXXXXX")"
trap 'if [[ -n "${env_tmp:-}" ]]; then rm -f -- "$env_tmp"; fi' EXIT
printf 'PORT=5000\nMONGO_URI="%s"\n' "$escaped_uri" > "$env_tmp"
chown root:root "$env_tmp"
chmod 600 "$env_tmp"
mv -f "$env_tmp" "$ENV_FILE"
env_tmp=""
unset MONGO_URI escaped_uri

NPM_BIN="$(command -v npm)"
cat > "/etc/systemd/system/$SERVICE_NAME.service" <<UNIT
[Unit]
Description=Recipe Book API
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$DEPLOY_USER
WorkingDirectory=$PROJECT_DIR/backend
EnvironmentFile=$ENV_FILE
ExecStart=$NPM_BIN start
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
if systemctl is-active --quiet "$SERVICE_NAME"; then
  systemctl restart "$SERVICE_NAME"
else
  systemctl start "$SERVICE_NAME"
fi

cat > "$NGINX_CONFIG" <<'NGINX'
server {
    listen 80;
    server_name _;

    root /var/www/recipe-book;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX

if command -v setsebool >/dev/null 2>&1 && command -v getenforce >/dev/null 2>&1 && [[ "$(getenforce)" != "Disabled" ]]; then
  setsebool -P httpd_can_network_connect 1
fi

systemctl enable --now nginx
nginx -t
systemctl reload nginx
systemctl --no-pager --full status "$SERVICE_NAME"

echo
echo "Deployment complete. Open http://YOUR_PUBLIC_IP"
echo "Ensure the instance security group allows inbound HTTP (port 80)."
echo "Allow the EC2 public IP in MongoDB Atlas Network Access."
