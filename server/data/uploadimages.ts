// uploadImages.ts
// sends every product photo in a folder on your computer to cloudinary, into "quickcart/ poducts"
// A file called "smart-watch-u;tra-1.jpeg" becomes the photo "quickcart/proudcts/smart-watch-ultra-1"

//Step 11: Put the demo products on Cloudinary
// Run it from the server folder: npm run upload-images -- "C:/Users/user/Desktop/quickcart-product-photos"
// Everything after "--" is handed to this script processargv[2] is a folder.

//only these files types are photos; anything else in the folder (e.g desktop.ini) is skipped

const PHOTO_TYPES = [".jpg", ".jpeg", ".png", "webp"];

const uploadImages = () => {
  const folder = process.argv[2];

  //1.check we have everything before we start
  if (!folder) {
    console.error(
      'Say where the photos are: npm run upload-images "C:/path/to/photos"',
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

  //2. list the photo files in the folder
  const files = fs.readdirSync(folder).filter((file) => {
    PHOTO_TYPES.includes(path.extname(file).toLowerCase());
  });
  console.log(`Uploading ${files.length} photos to Cloudinary...`);

  //upload them one at a time (simple, and kind to to a slow connection)
  let uploaded = 0;
  let failed = 0;
};