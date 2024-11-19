import cloudinary from "cloudinary";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_NAME,
} from "./globalKey.js";

cloudinary.v2.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export const UploadImageToCloud = async (files, type, oldImg) => {
  try {
    // if (oldImg) {
    //   // const spliturl = oldImg.split("/");
    //   // const img_id = spliturl[spliturl.length - 1].split(".")[0];
    //   // await cloudinary.v2.uploader.destroy(img_id);
    //   const spliturl = oldImg.split("/");
    //   const img_id = spliturl[spliturl.length - 1].split(".")[0];
    //   await cloudinary.uploader.destroy(img_id);
    // }
    const base64 = files.toString("base64");
    const imgPath = `data:${type};base64,${base64}`;
    const cloudinaryUpload = await cloudinary.v2.uploader.upload(imgPath, {
      //   public_id: `IMG_${Date.now()}`,
      folder: "images1",
      resource_type: "image",
    });
    return cloudinaryUpload.url;
  } catch (error) {
    console.log(error);
    return "";
  }
};
