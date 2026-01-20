# Atlas RC Deployment Guide

This guide covers deploying Atlas RC to various hosting platforms.

## Prerequisites

- Node.js 18+ installed locally
- Git repository connected to your hosting platform
- Supabase project configured with environment variables

## Environment Variables

Required environment variables for production:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Optional integrations:
```env
VITE_DOCUSEAL_API_KEY=your-docuseal-key
VITE_PLAID_CLIENT_ID=your-plaid-client-id
VITE_PLAID_SECRET=your-plaid-secret
```

## Option 1: Vercel (Recommended)

Vercel offers the fastest deployment with automatic previews.

### Quick Deploy

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub/GitLab repository

2. **Configure Environment Variables**
   - In project settings → Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - Set scope to Production, Preview, and Development

3. **Deploy**
   - Vercel auto-detects Vite framework
   - Click "Deploy"

### Configuration

The `vercel.json` file includes:
- SPA routing rewrites
- Security headers (X-Frame-Options, CSP basics)
- Asset caching (1 year for immutable assets)

### Custom Domain

1. Go to Project Settings → Domains
2. Add your domain (e.g., `app.atlasrc.com`)
3. Update DNS records as instructed
4. SSL is automatically provisioned

## Option 2: Netlify

Netlify offers excellent static site hosting with edge functions.

### Quick Deploy

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import existing project"
   - Connect to GitHub/GitLab

2. **Build Settings** (auto-detected from `netlify.toml`)
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   - Go to Site settings → Environment variables
   - Add Supabase credentials

4. **Deploy**
   - Click "Deploy site"

### Configuration

The `netlify.toml` file includes:
- SPA routing redirects
- Security headers
- Asset caching policies
- Context-specific builds (production, preview, branch)

### Custom Domain

1. Go to Domain settings
2. Add custom domain
3. Configure DNS (CNAME or A record)
4. Enable HTTPS

## Option 3: GitHub Pages

For simple static hosting (limited - no server-side features).

1. **Add Deploy Script**
   ```json
   // package.json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   ```

2. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Configure Base Path**
   ```js
   // vite.config.js
   export default {
     base: '/AtlasRC/'  // Your repo name
   }
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

## Option 4: Docker

For self-hosted or cloud container deployments.

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Build and Run

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://xxx.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=your-key \
  -t atlas-rc .

docker run -p 3000:80 atlas-rc
```

## CI/CD Pipeline

The `.github/workflows/ci.yml` handles:
- Linting on every push/PR
- Building with Node.js 18.x and 20.x
- Uploading build artifacts

### Extending for Auto-Deploy

To auto-deploy on merge to main, add to your workflow:

```yaml
deploy:
  needs: build-and-test
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  steps:
    - uses: actions/download-artifact@v4
      with:
        name: dist

    # Add platform-specific deploy steps
```

## Post-Deployment Checklist

- [ ] Verify environment variables are set
- [ ] Test Supabase connection (check browser console)
- [ ] Test authentication flow
- [ ] Verify SPA routing works (refresh on nested routes)
- [ ] Check security headers (use securityheaders.com)
- [ ] Test mobile responsiveness
- [ ] Configure custom domain and SSL
- [ ] Set up monitoring (optional: Sentry, LogRocket)

## Troubleshooting

### Blank page after deploy
- Check browser console for errors
- Verify base path configuration
- Ensure environment variables are set

### Supabase connection fails
- Verify `VITE_SUPABASE_URL` format (no trailing slash)
- Check API key is the "anon" public key
- Ensure RLS policies allow access

### 404 on page refresh
- SPA routing not configured
- Check `vercel.json` or `netlify.toml` rewrites

### Build fails
- Check Node.js version (requires 18+)
- Run `npm ci` instead of `npm install`
- Check for TypeScript errors: `npm run build`

## Performance Optimization

1. **Enable Compression** - Both Vercel and Netlify auto-gzip
2. **Image Optimization** - Consider using responsive images
3. **Code Splitting** - Vite handles this automatically
4. **Prefetching** - React Router supports route prefetching

## Security Recommendations

1. Never commit `.env` files
2. Use environment variables for all secrets
3. Enable 2FA on hosting accounts
4. Set up CORS properly in Supabase
5. Review RLS policies before production
