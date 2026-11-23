# 1. Install Node.js, Git, and Nginx
sudo dnf update -y
sudo dnf install -y nodejs git nginx
sudo systemctl enable --now nginx

# 2. Clone Repository
sudo git config --global --add safe.directory /usr/share/nginx/html
sudo rm -rf /usr/share/nginx/html
sudo git clone https://github.com/utkristaa/final.git /usr/share/nginx/html

# 3. Build Frontend
cd /usr/share/nginx/html/frontend
sudo npm install
sudo npm run build
sudo mv dist/* /usr/share/nginx/html/

# 4. Start Backend
cd /usr/share/nginx/html/backend
sudo npm install
sudo npm install -g pm2
sudo pm2 start server.js --name "backend"
sudo pm2 save

# 5. Configure Nginx Proxy
sudo rm -f /etc/nginx/conf.d/default.conf
sudo tee /etc/nginx/conf.d/react-app.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location /articles {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# 6. Fix Permissions & Restart
sudo chown -R nginx:nginx /usr/share/nginx/html
sudo systemctl restart nginx

echo "======================================================"
echo "DEPLOYMENT COMPLETE! Go to http://YOUR_PUBLIC_IP"
echo "======================================================"