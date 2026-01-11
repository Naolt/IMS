# Setting Up PostgreSQL Database on Render

## Step 1: Create a Render Account
1. Go to [Render.com](https://render.com)
2. Sign up for a free account or log in

## Step 2: Create a PostgreSQL Database
1. Click on **"New +"** button in the Render dashboard
2. Select **"PostgreSQL"**
3. Fill in the details:
   - **Name**: `ims-database` (or any name you prefer)
   - **Database**: `ims` (or any name)
   - **User**: Will be auto-generated
   - **Region**: Choose the closest region to you
   - **Plan**: Select **Free** (note: free tier has limitations)
4. Click **"Create Database"**

## Step 3: Get Your Database Connection String
1. After creation, click on your database in the Render dashboard
2. Scroll down to the **"Connections"** section
3. Copy the **"External Database URL"** (it looks like this):
   ```
   postgres://username:password@hostname:5432/database_name
   ```

## Step 4: Update Your Backend .env File
1. Open `/ims-backend/.env`
2. Replace the `DATABASE_URL` value with your Render database URL:
   ```
   DATABASE_URL="postgres://username:password@hostname:5432/database_name"
   ```
3. Save the file

## Step 5: Start Your Backend Server
```bash
cd ims-backend
npm run dev
```

The server will automatically:
- Connect to your Render PostgreSQL database
- Create all necessary tables (users, products, variants, sales)
- Be ready to accept API requests!

## Step 6: Test Your Setup
Once the server starts successfully, you should see:
```
✅ Database connection established successfully
🚀 Server is running on port 3001
📝 API: http://localhost:3001/api
💚 Health: http://localhost:3001/health
```

## Notes
- **Free Tier Limitations**:
  - Database expires after 90 days of inactivity
  - 256 MB RAM
  - 1 GB Storage
  - Shared CPU

- **TypeORM Auto-Sync**: In development mode, TypeORM will automatically create/update tables based on your entities. In production, you should use migrations instead.

- **SSL Connection**: TypeORM is configured to use SSL with `rejectUnauthorized: false` for cloud databases.

## Troubleshooting
If you encounter connection issues:
1. Make sure your DATABASE_URL is correctly formatted
2. Check that your Render database is active
3. Verify you're using the **External Database URL** (not Internal)
4. Check your internet connection

## Next Steps
Once your database is connected:
1. Test the signup endpoint
2. Test the signin endpoint
3. Implement remaining CRUD endpoints for Products, Variants, and Sales