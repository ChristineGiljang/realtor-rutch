import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(file: Buffer, fileName: string) {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        public_id: `properties/${fileName}`,
        folder: "realtor-site",
        quality: "auto:best",
        fetch_format: "auto",
        width: 1920,
        crop: "limit",
        effect: "improve",
      },
      (error, result) => {
        if (error) reject(error);
        resolve(result);
      },
    );

    upload.end(file);
  });
}
