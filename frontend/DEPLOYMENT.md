# Samudra Alert - Frontend Deployment

## 🚀 Vercel Deployment Setup

This frontend is configured for deployment on Vercel with the following optimizations:

### 📁 Files Structure

```
frontend/
├── vercel.json          # Vercel deployment configuration
├── .env.example         # Environment variables template
├── public/
│   ├── robots.txt       # SEO robots configuration
│   ├── sitemap.xml      # SEO sitemap
│   ├── manifest.json    # PWA manifest
│   └── _headers         # Security and caching headers
└── ...
```

### 🔧 Deployment Configuration

#### vercel.json

- Configured for Vite build system
- SPA routing support with fallback to index.html
- Security headers for production
- Optimized caching strategies

#### Environment Variables

Copy `.env.example` to `.env` and configure:

- `VITE_API_URL`: Backend API URL
- `VITE_MAP_DEFAULT_LAT/LNG`: Default map coordinates
- Other configuration variables

### 🛠 Build Scripts

- `npm run build:prod`: Production build with type checking and linting
- `npm run preview`: Preview production build locally
- `npm run type-check`: TypeScript validation
- `npm run lint`: Code linting

### 📱 PWA Features

- Progressive Web App manifest
- Service Worker ready configuration
- Mobile-friendly design
- Offline capability support

### 🔒 Security Features

- Content Security Policy headers
- XSS protection
- Frame protection
- Secure referrer policy

### 🎯 SEO Optimization

- Meta tags for social media sharing
- Structured data ready
- Sitemap for search engines
- Robots.txt configuration

## 🚀 Deployment Steps

1. **Fork/Clone the repository**
2. **Install dependencies**: `npm install`
3. **Configure environment variables** using `.env.example`
4. **Connect to Vercel**:
   - Import project in Vercel dashboard
   - Connect to GitHub repository
   - Configure environment variables in Vercel dashboard
5. **Deploy**: Automatic deployment on push to main branch

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build:prod

# Preview production build
npm run preview
```

## 📊 Performance Optimizations

- Code splitting for vendor libraries
- Optimized asset bundling
- Compressed builds with Terser
- Tree shaking for unused code
- Optimized image loading
- Lazy loading components

## 🌐 Domain Configuration

Update the following files with your domain:

- `vercel.json`: Update domain references
- `public/sitemap.xml`: Update URLs
- `.env`: Update VITE_ALLOWED_ORIGINS
- `index.html`: Update og:url and twitter:url

## 📈 Monitoring

The app is ready for:

- Vercel Analytics
- Web Vitals monitoring
- Error tracking with Sentry (configure VITE_SENTRY_DSN)
- Performance monitoring

## 🔍 Troubleshooting

### Common Issues:

1. **Build Fails**: Check TypeScript errors with `npm run type-check`
2. **API Connection**: Verify VITE_API_URL in environment variables
3. **Routing Issues**: Ensure vercel.json has proper SPA fallback
4. **Missing Assets**: Check public folder structure

### Environment Variables in Vercel:

Add these in Vercel Dashboard > Settings > Environment Variables:

- VITE_API_URL
- VITE_APP_NAME
- VITE_ENVIRONMENT=production
- Other variables from .env.example

## 📞 Support

For deployment issues, check:

- Vercel deployment logs
- Browser console for errors
- Network tab for API calls
- Vercel functions logs if using API routes
