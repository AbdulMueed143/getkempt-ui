# Deployment Guide

This guide covers deploying Get Kempt Frontend to **Cloudflare Pages** with multiple environments (Dev, UAT, Production).

## Why Cloudflare Pages?

| Feature | Cloudflare Pages (Free Tier) |
|---------|------------------------------|
| **Monthly Cost** | $0 |
| **Bandwidth** | Unlimited |
| **Builds/month** | 500 |
| **Preview Deployments** | Unlimited |
| **Custom Domains** | Unlimited |
| **SSL** | Automatic |
| **Global CDN** | 300+ edge locations |

## Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free)
- GitHub repository with your code
- (Optional) Custom domain

## Quick Setup (5 minutes)

### 1. Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create**
2. Select **Pages** → **Connect to Git**
3. Authorize Cloudflare to access your GitHub repository
4. Select the `getsquire/frontend` repository

### 2. Configure Build Settings

| Setting | Value |
|---------|-------|
| **Production branch** | `main` |
| **Build command** | `npm run build` |
| **Build output directory** | `out` |
| **Root directory** | `/` (leave empty) |

### 3. Set Environment Variables

Go to **Settings** → **Environment variables** and add:

| Variable | Production | UAT | Preview (Dev) |
|----------|------------|-----|---------------|
| `NEXT_PUBLIC_API_URL` | `https://api.getkempt.co` | `https://api-uat.getkempt.co` | `https://api-dev.getkempt.co` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `<prod-key>` | `<uat-key>` | `<dev-key>` |
| `NODE_VERSION` | `22` | `22` | `22` |

> **Note:** Set variables separately for "Production" and "Preview" environments in the dashboard.

### 4. Deploy

Click **Save and Deploy**. Your site will be live at:
- `https://getkempt-frontend.pages.dev`

## Environment Strategy

Cloudflare Pages automatically creates preview deployments for branches:

| Branch | Environment | Auto-deploy URL |
|--------|-------------|-----------------|
| `main` | Production | `getkempt-frontend.pages.dev` |
| `uat` | UAT | `uat.getkempt-frontend.pages.dev` |
| `dev` | Development | `dev.getkempt-frontend.pages.dev` |
| `feature/*` | Preview | `<commit-hash>.getkempt-frontend.pages.dev` |

### Setting Up Branch Aliases

1. Go to **Settings** → **Builds & deployments** → **Branch deployments**
2. Add branch aliases:
   - Branch: `uat` → Alias: `uat`
   - Branch: `dev` → Alias: `dev`

This gives you stable URLs:
- `https://uat.getkempt-frontend.pages.dev`
- `https://dev.getkempt-frontend.pages.dev`

## Custom Domains

### Adding a Custom Domain

1. Go to **Custom domains** → **Set up a custom domain**
2. Enter your domain (e.g., `app.getkempt.com`)
3. Cloudflare will automatically configure DNS if your domain is on Cloudflare

### Domain Setup for getkempt.co

| Domain | Environment | Branch |
|--------|-------------|--------|
| `getkempt.co` | Production | `main` |
| `www.getkempt.co` | Production (redirect) | `main` |
| `uat.getkempt.co` | UAT | `uat` |
| `dev.getkempt.co` | Development | `dev` |

Since the domain is on Cloudflare, DNS records are configured automatically when adding custom domains.

## Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your local settings
# NEXT_PUBLIC_API_URL=http://localhost:8080

# Start dev server
npm run dev
```

## CLI Deployment (Alternative)

For CI/CD or manual deployments using Wrangler:

```bash
# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy to production
npm run build
wrangler pages deploy out --project-name=getkempt-frontend

# Deploy to a specific branch/environment
wrangler pages deploy out --project-name=getkempt-frontend --branch=uat
```

## GitHub Actions (CI/CD)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main, uat, dev]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ vars.NEXT_PUBLIC_API_URL }}
          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: ${{ secrets.GOOGLE_MAPS_API_KEY }}

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy out --project-name=getkempt-frontend
```

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | API token with "Cloudflare Pages: Edit" permission |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key |

### Required GitHub Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL for the environment |

## Comparing Deployment Options

| Option | Cost | Complexity | Auto-deploy | Custom Domains |
|--------|------|------------|-------------|----------------|
| **Cloudflare Pages** | Free | Low | ✅ | ✅ |
| GitHub Pages | Free | Low | ✅ | ✅ |
| Vercel | Free* | Low | ✅ | ✅ |
| Docker + Cloud Run | ~$5/mo | Medium | Manual | ✅ |
| AWS S3 + CloudFront | ~$1/mo | High | Manual | ✅ |

*Vercel free tier has bandwidth limits

## Connecting to Your Java Backend

The frontend communicates with your Java backend via `NEXT_PUBLIC_API_URL`. Ensure:

1. **CORS is configured** on your Java backend to allow requests from your frontend domains
2. **Backend URLs** match your environment setup:
   - Production frontend → Production backend
   - UAT frontend → UAT backend
   - Dev frontend → Dev backend

Example CORS configuration for Spring Boot:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(
                "https://getkempt.co",
                "https://www.getkempt.co",
                "https://uat.getkempt.co",
                "https://dev.getkempt.co",
                "http://localhost:3000"
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
            .allowCredentials(true);
    }
}
```

## Troubleshooting

### Build Failures

1. **Check Node version**: Ensure `NODE_VERSION=22` is set in environment variables
2. **Check build logs**: Available in Cloudflare Dashboard → Deployments → View build log

### 404 on Page Refresh

The `out/_redirects` or nginx config handles client-side routing. If issues persist, add:

```
/* /index.html 200
```

to a `public/_redirects` file.

### Environment Variables Not Working

- `NEXT_PUBLIC_*` variables are baked in at build time
- Changes require a new deployment
- Verify they're set in the correct environment (Production vs Preview)
