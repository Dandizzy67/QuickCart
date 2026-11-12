// uploadimages
// Sends every product photo in a folder on your computer to Cloudinary, into "quickcart/products"
// A file called "smart-watch-ultra-1.jpeg" becomes the photo "quickcart/products/smart-watch-ultra-1"

import {
  CLOUDINARY_MISSING,
  PHOTO_FOLDER,
  isCloudinaryReady,
  uploadPhoto,
} from "../src/config/cloudinary";
import fs from "fs";
import path from "path";

// STEP 11: put the demo products on Cloudinary
// Run it from the server folder: npm run upload-images -- "C:/Users/hp/OneDrive/Desktop/quickcart-product-photos"
// Everything after "--" is handled by this script; process.argv[2] is the folder.

// Only these file types are photos; anything else in the folder (for example desktop.ini) is skipped.
const PHOTO_TYPES = [".jpg", ".jpeg", ".png", ".webp"];

const uploadImages = async () => {
  const folder = process.argv[2];

  if (!folder) {
    console.error(
      'Say where the photos are: npm run upload-images -- "C:/path/to/photos"',
    );
    process.exit(1);
  }

  if (!isCloudinaryReady) {
    console.error(CLOUDINARY_MISSING);
    process.exit(1);
  }

  if (!fs.existsSync(folder)) {
    console.error(`Folder not found: ${folder}`);
    process.exit(1);
  }

  const files = fs.readdirSync(folder).filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return PHOTO_TYPES.includes(ext);
  });

  console.log(`Uploading ${files.length} photos to Cloudinary...`);

  let uploaded = 0;
  let failed = 0;

  for (const file of files) {
    const name = path.parse(file).name.trim().toLowerCase();
    const filePath = path.join(folder, file);
    const bytes = fs.readFileSync(filePath);

    try {
      const publicId = await uploadPhoto(bytes, `${PHOTO_FOLDER}/${name}`);
      uploaded++;
      console.log(`Uploaded ${uploaded}/${files.length}: ${publicId}`);
    } catch (error) {
      failed++;
      console.error(`Failed to upload ${file}:`, error);
    }
  }

  console.log(`Done. Uploaded ${uploaded} file(s); failed ${failed}.`);
};

uploadImages();
