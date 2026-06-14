# Master Deployment & Operations Guide: F1 Stats Explorer

Welcome to the Formula 1 Stats Explorer deployment catalog! This guide details how to launch, host, and maintain this minimalist web dashboard in any operational context.

---

## Technical Architecture Overview

- **Framework**: React 19 (TypeScript)
- **Build Core**: Vite 6
- **Styling Architecture**: Tailwind CSS 4
- **Interface Layer**: Lucide icons + Motion (for seamless tab transitions)
- **API Connectivity**: Stateless client-side REST fetches to the Jolpi Ergast mirror (`https://api.jolpi.ca/ergast/`)
- **Resiliency Model**: Built-in mock data engine matching the 2026 pre-season simulation mockup, automatically resolving offline or slow API queries cleanly.

---

## 🚀 Scenario A: Local Development Machine

To run the application locally on your laptop or workstation (Windows, macOS, or Linux):

### 1. Prerequisites
- **Node.js**: Version 18.0.0 or higher is required (version 20+ recommended).
- **Package Manager**: NPM (comes bundled with Node) or Yarn/PNPM.

### 2. Setup Procedure
Extract the project files, open a command-line terminal in the root directory, and run:

```bash
# 1. Install all dependencies
npm install

# 2. Start the hot-reloading development server
npm run dev
```

### 3. Verification
By default, the Vite dev server is configured to bind to:
- **Port**: `3000`
- **Url**: `http://localhost:3000` or `http://127.0.0.1:3000`

---

## 🌐 Scenario B: Hosting on a Virtual Private Server (VPS)
If you are deploying to a VPS (DigitalOcean, Linus, AWS EC2, Hetzner, Vultr) running Ubuntu or Debian:

You can choose between **Static Build Hosting (Highly Recommended)** or a **Node Dev Process Proxy**.

### Method 1: Nginx Static Server (Best Performance, Recommended)
Since this is a client-side Single Page Application (SPA), compiling it into static HTML/CSS/JS files and serving them with Nginx is the most secure, responsive, and resource-efficient method.

#### Step 1: Build the Static Files
Locally or on the server, compile the application:
```bash
npm run build
```
This produces a compiled, optimized bundle inside the `/dist` directory.

#### Step 2: Install Nginx
On your Ubuntu/Debian server, run:
```bash
sudo apt update
sudo apt install nginx -y
```

#### Step 3: Copy Files to Web Root
Copy the contents of your `/dist` folder to `/var/www/f1-explorer`:
```bash
sudo mkdir -p /var/www/f1-explorer
sudo cp -r dist/* /var/www/f1-explorer/
sudo chown -R www-data:www-data /var/www/f1-explorer
```

#### Step 4: Configure Nginx Virtual Host
Create a new configuration block:
```bash
sudo nano /etc/nginx/sites-available/f1-explorer
```

Paste the following configuration:
```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com; # Replace with your Domain or IP

    root /var/www/f1-explorer;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable browser caching for static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|otf)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    error_log /var/log/nginx/f1-explorer_error.log;
    access_log /var/log/nginx/f1-explorer_access.log;
}
```

Enable the configuration and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/f1-explorer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Method 2: Systemd + Node Runner (Reverse Proxy)
If you must run the server as a dynamic background process inside Node on the VPS:

1. Install PM2 (Process Manager) globally on the VPS:
   ```bash
   sudo npm install -g pm2
   ```
2. Build the app:
   ```bash
   npm run build
   ```
3. Boot the Vite preview on Port `3000` using PM2:
   ```bash
   pm2 start "npm run dev" --name "f1-explorer"
   ```
4. Configure Nginx to proxy traffic from Port 80/443 to the Node process running on port `3000`:
   ```nginx
   server {
       listen 80;
       server_name your_domain.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 🐳 Scenario C: Running in a Docker Container
To deploy using containerization platforms (Kubernetes, AWS ECS, Portainer, VPS Docker Setup):

### 1. Create a `Dockerfile` at the root of the project:
```dockerfile
# Step 1: Build Phase
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Serve Phase (with superlight Nginx)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Build and Execute the Container:
```bash
# Build the Docker image
docker build -t f1-explorer .

# Spin up the container on local port 8080 or VPS port 3000
docker run -d -p 3000:80 --name f1-stats f1-explorer
```

---

## ☁️ Scenario D: Serverless Cloud Platforms (Vercel / Netlify / Cloud Run)

This client-only structure acts as a static React application, making hosting on serverless edge networks completely free and infinitely scalable:

### Vercel
1. Install the Vercel CLI or link your GitHub repo to the Vercel dashboard.
2. Select **Vite** as the framework template.
3. Keep the defaults: Build command `npm run build`, Output directory `dist`.
4. Click **Deploy**.

### Netlify
1. Log in to Netlify, drag and drop the compiled `/dist` folder.
2. Or link your GitHub repository, configure build command as `npm run build` and publish directory as `dist`.

---

## 🛠️ Performance & Tuning Tips

1. **API Rate Limiting**: The Jolpi Ergast API is a public voluntary mirror. Under extremely high user demand, requests may slow down. Our built-in local fallback engine gracefully handles timeouts and CORS exceptions by feeding high-contrast offline statistics for seasons (2024 to 2026).
2. **HTTPS Config**: Ensure your domain on VPS is secured with Let's Encrypt SSL. You can obtain a free certificate via Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d your_domain.com
   ```
