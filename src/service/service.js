import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import { SECRET_KEY, SECRET_KEY_REFRESH } from "../config/globalKey.js";
import connected from "../config/db_mysql.js";
import { EMessage } from "./message.js";
import QRCode from "qrcode";
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
        if (err) reject(err);

        const checkUserID = "select * from user where userID=?";
        connected.query(checkUserID, decode["id"], (isErr, result) => {
          if (isErr) reject(isErr);

          if (!result[0]) reject(EMessage.NotFound);
          resovle(result[0]["userID"]);
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};
export const GenerateQR = (data) => {
  return new Promise(async (resovle, reject) => {
    try {
      const stringdata = JSON.stringify(data);
   // ----- ສະແດງເປັນຮູບ
      // QRCode.toString(stringdata, { type: "terminal" }, (err, url) => {
      //   if (err) return console.log("error occurred");
      //   console.log(`=====>1${url}`);
      // });

      // Get the base64 url
      QRCode.toDataURL(stringdata, (err, url) => {
        if (err) reject(err);
       // console.log(`=====>2${url}`);
        resovle(url)
      });
    } catch (error) {
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
      reject(error);
    }
  });
};
export const FindOneTable = (tableID) => {
  return new Promise(async (resovle, reject) => {
    try {
      const check = "Select * From tables where tableID=?";
      connected.query(check, tableID, (err, result) => {
        if (err) reject(EMessage.NotFound + err);
        if (!result[0]) reject(EMessage.NotFound + "table");
        resovle(result[0]);
      });
    } catch (error) {
      reject(error);
    }
  });
};
export const FindCheckTable = (tableID) => {
  return new Promise(async (resovle, reject) => {
    try {
      const check = "Select * From tables where tableID=?";
      connected.query(check, tableID, (err, result) => {
        if (err) reject(EMessage.NotFound + err);
        if (!result[0]) reject(EMessage.NotFound + "table");
        resovle(result[0]);
      });
    } catch (error) {
      reject(error);
    }
  });
};
export const FindOneCategory = (categoryID) => {
  return new Promise(async (resovle, reject) => {
    try {
      const check = "Select * From category where categoryID=?";
      connected.query(check, categoryID, (err, result) => {
        if (err) reject(EMessage.NotFound + err);
        if (!result[0]) reject(EMessage.NotFound + "category");
        resovle(result[0]);
      });
    } catch (error) {
      reject(error);
    }
  });
};
export const FindOneUnit = (unitID) => {
  return new Promise(async (resovle, reject) => {
    try {
      const check = "Select * From unit where unitID=?";
      connected.query(check, unitID, (err, result) => {
        if (err) reject(EMessage.NotFound + err);
        if (!result[0]) reject(EMessage.NotFound + "unit");
        resovle(result[0]);
      });
    } catch (error) {
      reject(error);
    }
  });
};
export const FindOneProduct = (productID) => {
  return new Promise(async (resovle, reject) => {
    try {
      const check = "Select * From product where productID=?";
      connected.query(check, productID, (err, result) => {
        if (err) reject(EMessage.NotFound + err);
        if (!result[0]) reject(EMessage.NotFound + "product");
        resovle(result[0]);
      });
    } catch (error) {
      reject(error);
    }
  });
};
