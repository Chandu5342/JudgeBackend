import cloudinary from 'cloudinary';

// Configure Cloudinary with API credentials
// Get these from: https://dashboard.cloudinary.com/settings/api-keys
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary.v2;
