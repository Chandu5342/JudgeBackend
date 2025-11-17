// test_cloudinary.js
import 'dotenv/config';
import cloudinary from './config/cloudinary.js';

(async () => {
  try {
    // small public file to test upload (replace with a tiny file/url if you prefer)
    const testUrl = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png';
    console.log('Uploading test URL to Cloudinary...');
    const res = await cloudinary.uploader.upload(testUrl, { resource_type: 'auto' });
    console.log('Upload success:', { secure_url: res.secure_url, public_id: res.public_id });
  } catch (err) {
    console.error('Upload failed:', err.message);
    if (err.http_code) console.error('HTTP code:', err.http_code);
    if (err.http_body) console.error('HTTP body:', err.http_body);
    process.exit(1);
  }
  process.exit(0);
})();