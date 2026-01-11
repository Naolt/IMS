# Deploying IMS with SQLite

This guide explains how to deploy the Inventory Management System (IMS) using SQLite as the database instead of PostgreSQL.

## Why SQLite for Production?

- **No external database required**: SQLite stores everything in a single file (`data/local.db`)
- **Zero cost**: No need for a paid PostgreSQL database
- **Simple setup**: No connection strings or database credentials to manage
- **Sufficient for small to medium workloads**: Perfect for single-user or small team usage

## Database Configuration

The application automatically uses SQLite when the `DATABASE_URL` environment variable is **NOT** set, regardless of whether you're in development or production mode.

**Logic:**
```typescript
// If DATABASE_URL is set AND in production → Use PostgreSQL
// Otherwise → Use SQLite
```

## Deployment Steps for Render

### 1. Backend Deployment

1. **Create a new Web Service** on Render
   - Connect your GitHub repository
   - Root directory: `ims-backend`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

2. **Environment Variables** (in Render Dashboard)
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your-secret-key-here
   GEMINI_API_KEY=your-gemini-api-key
   FRONTEND_URL=https://your-frontend-url.onrender.com

   # DO NOT SET DATABASE_URL - this will use SQLite
   ```

3. **Persistent Storage** (IMPORTANT!)
   - SQLite data must persist across deployments
   - In Render Dashboard → Service → Settings → "Disks"
   - Add a persistent disk:
     - **Mount Path**: `/opt/render/project/src/data`
     - **Size**: 1 GB (adjust based on your needs)

   This ensures your database file survives deployments and restarts.

### 2. Frontend Deployment

1. **Create a Static Site** on Render
   - Connect your GitHub repository
   - Root directory: `ims-frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `out`

2. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset
   ```

3. **Build Settings**
   - Framework: Next.js (Static)
   - Node version: 18 or later

## Database Files Structure

```
ims-backend/
└── data/
    ├── local.db              # Main SQLite database
    ├── local.db-shm         # Shared memory file (auto-generated)
    ├── local.db-wal         # Write-ahead log (auto-generated)
    ├── checkpoints.db       # AI conversation history
    ├── checkpoints.db-shm   # Shared memory file (auto-generated)
    └── checkpoints.db-wal   # Write-ahead log (auto-generated)
```

## Initial Data Setup

After deploying, you need to seed the database:

### Option 1: SSH into Render and Run Seed Script

```bash
# SSH into your Render service (available in Dashboard → Shell)
cd /opt/render/project/src
npm run seed
```

### Option 2: Temporary Local Seeding (Not Recommended)

1. Download the empty database from Render
2. Seed it locally
3. Upload it back to Render's persistent disk

## Limitations of SQLite in Production

⚠️ **Be aware of these limitations:**

1. **No concurrent writes**: SQLite locks the entire database during writes
   - Fine for small teams (< 10 concurrent users)
   - May slow down with heavy concurrent traffic

2. **Single server only**: Cannot scale horizontally
   - You can't run multiple backend instances sharing the same database

3. **Manual backups required**:
   - Regularly download the `data/` folder from Render
   - Or use Render's disk snapshot feature

4. **File size limits**:
   - SQLite can handle databases up to 281 TB
   - Render's free tier limits disk size (usually 1-10 GB)

## When to Switch to PostgreSQL

Consider migrating to PostgreSQL when:
- You have more than 10 concurrent users
- You need to scale to multiple backend instances
- Your database grows beyond a few GB
- You need advanced PostgreSQL features

To migrate to PostgreSQL later:
1. Set up a PostgreSQL database (Render, Supabase, etc.)
2. Add `DATABASE_URL` environment variable to Render
3. The app will automatically switch to PostgreSQL
4. Export data from SQLite and import to PostgreSQL

## Monitoring

**Check database size:**
```bash
# SSH into Render
du -sh /opt/render/project/src/data/local.db
```

**Check if SQLite is being used:**
Check your backend logs on Render. On startup, you should see:
```
✅ Database connection established successfully
```

If PostgreSQL was being used, you'd see connection errors about DATABASE_URL.

## Backup Strategy

**Manual backup (recommended):**
1. SSH into Render service
2. Copy the database file:
   ```bash
   cp /opt/render/project/src/data/local.db /tmp/backup-$(date +%Y%m%d).db
   ```
3. Download from Render dashboard or use `scp`

**Automated backup:**
Consider setting up a cron job or GitHub Action to periodically:
1. SSH into Render
2. Download the database
3. Store it in S3, GitHub, or another backup location

## Troubleshooting

### Database file not found error
- Ensure persistent disk is mounted to `/opt/render/project/src/data`
- Check that the `data/` directory exists in your repository

### Permission denied errors
- Render should automatically give write permissions to the disk
- If not, contact Render support

### Database locked errors
- Too many concurrent requests
- Consider upgrading to PostgreSQL

### Lost data after deployment
- You forgot to set up persistent storage
- Add a persistent disk immediately and restore from backup

## Cost Comparison

**SQLite on Render:**
- Web Service: $7/month (Starter plan) or Free (with limitations)
- Persistent Disk: $0.25/GB/month
- **Total**: ~$7.25/month

**PostgreSQL on Render:**
- Web Service: $7/month (Starter plan) or Free
- PostgreSQL Database: $7/month (minimum)
- **Total**: ~$14/month

**Savings**: ~50% by using SQLite!
