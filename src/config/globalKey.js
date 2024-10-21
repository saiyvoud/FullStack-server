import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
const SECRET_KEY = process.env.SECRET_KEY;
const SECRET_KEY_REFRESH = process.env.SECRET_KEY_REFRESH;
export { PORT, DATABASE_URL, SECRET_KEY, SECRET_KEY_REFRESH };
