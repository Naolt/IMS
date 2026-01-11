# Cloudinary Setup Guide

This guide will help you set up Cloudinary for image uploads in your IMS application.

## Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a free account (no credit card required)
3. Verify your email address

## Step 2: Get Your Cloud Name

1. Log in to [https://console.cloudinary.com/](https://console.cloudinary.com/)
2. On the dashboard, you'll see your **Cloud Name** (e.g., `dxxxxxxxx`)
3. Copy this value

## Step 3: Create an Upload Preset

1. In the Cloudinary console, go to **Settings** (gear icon in the top right)
2. Click on the **Upload** tab
3. Scroll down to **Upload presets**
4. Click **Add upload preset**
5. Configure the preset:
   - **Preset name**: Choose a name (e.g., `ims_products`)
   - **Signing Mode**: Select **Unsigned** (important!)
   - **Folder**: (Optional) Enter a folder name like `ims/products`
   - **Access mode**: Public
   - **Allowed formats**: jpg, jpeg, png, webp, svg
   - **Max file size**: 2000000 (2MB)
6. Click **Save**
7. Copy the **preset name** you created

## Step 4: Update Environment Variables

1. Open `/ims-frontend/.env.local`
2. Replace the placeholder values:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name_here
```

Example with real values:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxyz12345
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ims_products
```

## Step 5: Restart the Frontend

After updating the environment variables, restart your Next.js development server:

```bash
cd ims-frontend
npm run dev
```

## Step 6: Test the Upload

1. Go to the **Add Inventory** page
2. You should see the image upload area
3. Click to upload or drag and drop an image
4. The Cloudinary upload widget should open
5. After uploading, the image URL will be saved with your product

## Troubleshooting

### "Cloudinary is not configured" Error

- Make sure you've updated the `.env.local` file
- Restart the Next.js development server
- Check that the environment variable names are exactly:
  - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
  - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

### Upload Widget Doesn't Open

- Check browser console for errors
- Make sure the upload preset is set to **Unsigned** mode
- Verify the preset name is correct

### "Invalid signature" Error

- Your upload preset must be **Unsigned**
- Go to Settings > Upload > Edit your preset
- Change **Signing Mode** to **Unsigned**

## Free Tier Limits

Cloudinary's free tier includes:
- **25 GB** storage
- **25 GB** bandwidth per month
- Unlimited transformations
- 10,000 transformations per month

This is more than enough for most small to medium-sized IMS applications.

## Next Steps

Once Cloudinary is set up, you can:
- Upload product images when adding new inventory
- Change product images when editing inventory
- Images are automatically optimized and delivered via CDN
- All image URLs are stored in your database

## Security Note

The upload preset is **unsigned**, which means anyone can upload to your Cloudinary account if they have the preset name. To secure it:

1. Enable **Upload Restrictions** in the preset settings
2. Add **Allowed Origins** (e.g., `http://localhost:3000`, your production domain)
3. For production, consider using **signed uploads** with a backend endpoint

For now, unsigned uploads are fine for development and small applications.
