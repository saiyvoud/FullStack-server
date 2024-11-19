import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
const SECRET_KEY = process.env.SECRET_KEY;
const SECRET_KEY_REFRESH = process.env.SECRET_KEY_REFRESH;
const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const DATETIME = new Date()
.toISOString()
.replace(/T/, " ")
.replace(/\..+/, "");
export {
  PORT,
  DATABASE_URL,
  SECRET_KEY,
  SECRET_KEY_REFRESH,
  CLOUDINARY_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  DATETIME,
};
