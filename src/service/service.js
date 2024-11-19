import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import { SECRET_KEY, SECRET_KEY_REFRESH } from "../config/globalKey.js";
import connected from "../config/db_mysql.js";
import { EMessage } from "./message.js";
export const Decrypt = async (data) => {
  return CryptoJS.AES.decrypt(data, SECRET_KEY).toString(CryptoJS.enc.Utf8);
};
export const Encrypt = async (data) => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};
export const VerifyToken = async (token) => {
  return new Promise(async (resovle, reject) => {
    try {

      jwt.verify(token, SECRET_KEY.toString(), (err, decode) => {
        if (err)  reject(err);
      
        const checkUserID = "select * from user where userID=?";
        connected.query(checkUserID, decode['id'], (isErr, result) => {
          if (isErr) reject(isErr);
          console.log(result[0]['userID']);
          if (!result[0]) reject(EMessage.NotFound);
          resovle(result[0]["userID"]);
        });
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};
export const GenerateToken = async (data) => {
  return new Promise(async (resovle, reject) => {
    try {
      const payload = {
        id: data,
      };

      const token = jwt.sign(payload, SECRET_KEY.toString(), {
        expiresIn: "2h",
      });

      const refreshToken = jwt.sign(payload, SECRET_KEY_REFRESH.toString(), {
        expiresIn: "4h",
      });
      if (!token || !refreshToken) {
        reject("Error Generate Token");
      }
      resovle({ token, refreshToken });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};
