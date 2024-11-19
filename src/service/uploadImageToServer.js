import { Jimp } from "jimp";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imagesDir = path.join(__dirname, "/../../", "assets", "images");

export const UploadImageToServer = async (files, type) => {
  try {
    const imgBase64 = Buffer.from(files, "base64");
    const imgName = "IMG-" + Date.now() + ".png";
    const imgPath = path.join(imagesDir, imgName);

    const pngBuffer = await sharp(imgBase64).toBuffer();
    const image = await Jimp.read(pngBuffer);

    if (!image) {
      return "Error Covert files";
    }

    await image.write(imgPath);
    return imgName;
  } catch (error) {
    console.log(error);
    return "";
  }
};