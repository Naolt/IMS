# Vercel Frontend Deployment Guide

## Pre-Deployment Checklist

- [x] Backend deployed to Render: https://ims-ugnq.onrender.com
- [x] Frontend builds successfully (18 pages generated)
- [x] Cloudinary configured
- [ ] Vercel project created
- [ ] Environment variables set in Vercel
- [ ] Frontend deployed and tested
- [ ] Backend CORS updated with frontend URL

## Vercel Deployment Steps

### 1. Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `ims-frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### 2. Environment Variables

Add these environment variables in Vercel:

```bash
# Backend API URL (Your Render deployment)
NEXT_PUBLIC_API_URL=https://ims-ugnq.onrender.com

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dv9zqzb3q
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ims_products
```

**How to add environment variables in Vercel:**
1. In your project settings, go to "Environment Variables"
2. Add each variable with its value
3. Select all environments (Production, Preview, Development)
4. Click "Save"

### 3. Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 2-3 minutes)
3. Once deployed, you'll get a URL like: `https://your-project.vercel.app`

### 4. Post-Deployment Steps

#### Update Backend CORS

After your frontend is deployed, update the backend environment variable on Render:

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your `ims-backend` service
3. Go to "Environment" section
4. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://your-project.vercel.app
   ```
5. Save changes (this will trigger a redeploy)

#### Test the Integration

1. Visit your Vercel URL
2. Test the login flow
3. Test product creation with image upload
4. Verify theme settings work correctly
5. Check that all API calls are successful

### 5. Custom Domain (Optional)

If you want to use a custom domain:

1. Go to project settings → "Domains"
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions
4. Update `FRONTEND_URL` on Render to your custom domain

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure root directory is set to `ims-frontend`

### API Calls Failing

- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser console for CORS errors
- Ensure backend `FRONTEND_URL` matches your Vercel URL

### Images Not Loading

- Verify Cloudinary environment variables
- Check that `next.config.ts` has Cloudinary in `remotePatterns`

### Theme Not Persisting

- Check browser localStorage is working
- Verify settings API endpoints are accessible

## Current Configuration

### Backend (Render)
- URL: https://ims-ugnq.onrender.com
- Health Check: https://ims-ugnq.onrender.com/health
- API Docs: https://ims-ugnq.onrender.com/api-docs
- Database: SQLite (DATABASE_TYPE=sqlite)

### Frontend (To Be Deployed)
- Framework: Next.js 15
- Root Directory: ims-frontend
- Environment Variables: Listed above

## Next Steps After Deployment

1. **Seed Production Database**
   - SSH into Render service
   - Run: `npm run seed`
   - This creates default admin user and settings

2. **Test Complete Flow**
   - Sign in with default credentials
   - Create a product with image
   - Test theme switching
   - Verify all dashboard features

3. **Monitor Performance**
   - Check Vercel Analytics
   - Monitor Render logs for backend errors
   - Set up error tracking if needed

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Render Docs**: https://render.com/docs
