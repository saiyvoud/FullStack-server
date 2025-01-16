import connected from "../config/db_mysql.js";
import { v4 as uuidv4 } from "uuid";
import { EMessage, Role, SMessage } from "../service/message.js";
import { SendCreate, SendError, SendSuccess } from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import { Decrypt, Encrypt, GenerateToken,VerifyRefreshToken } from "../service/service.js";
import { UploadImageToCloud } from "../config/cloudinary.js";
import { UploadImageToServer } from "../service/uploadImageToServer.js";
export default class UserCotroller {
  static async RefreshToken (req,res){
    try {
      const {refreshToken} = req.body;
      if(!refreshToken) return SendError(res,400,EMessage.BadRequest + " refreshToken");
      const verify = await VerifyRefreshToken(refreshToken); // ສ້າງ service
      if(!verify) return SendError(res,404,EMessage.NotFound);
      return SendSuccess(res,SMessage.Updated , verify);
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async SelectOne(req, res) {
    try {
      const userID = req.params.userID;
      const select = "Select * from user where userID=?";
      connected.query(select, userID, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + "user");
        const { password, ...data } = result[0];
        data.password = undefined;
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        return SendSuccess(res, SMessage.SelectOne, data);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async SelectAll(req, res) {
    try {
      const select =
        "Select userID,username,email,phoneNumber,role,profile,createdAt,updatedAt from user";
      connected.query(select, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + "user");
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        return SendSuccess(res, SMessage.SelectAll, result);
      });
    } catch (error) {
      console.log(error);
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async ForgetPassword(req, res) {
    try {
      const { email, password } = req.body;
      const validate = await ValidateData({ email, password });
      if (validate.length > 0) {
        return SendError(res, 400, EMessage.BadRequest + validate.join(","));
      }

      const checkEmail = "select * from user where email=?";
      connected.query(checkEmail, email, async (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound + "email");
        const update = "Update user set password=? where userID=?";
        const genPassword = await Encrypt(password);
        connected.query(update, [genPassword, result[0]["userID"]], (err2) => {
          if (err2) return SendError(res, 404, EMessage.Eupdate, err2);
          return SendSuccess(res, SMessage.Updated);
        });
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async ChangePassword(req, res) {
    try {
      const userID = req.user;
      const { newPassword, oldPassword } = req.body;
      const validate = await ValidateData({ newPassword, oldPassword });
      // validate
      if (validate.length > 0) {
        return SendError(res, 400, EMessage.BadRequest + validate.join(","));
      }
      // check User
      const checkUser = "Select * from user where userID=?";
      connected.query(checkUser, userID, async (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        const decryptPassword = await Decrypt(result[0]["password"]);
        if (decryptPassword !== oldPassword) {
          return SendError(res, 400, EMessage.IsMatch);
        }
        // update password
        const encryptPassword = await Encrypt(newPassword);
        const update = "Update user set password=? where userID=?";
        connected.query(update, [encryptPassword, userID], (isError) => {
          if (isError) return SendError(res, 404, EMessage.Eupdate, isError);
          return SendSuccess(res, SMessage.Updated);
        });
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async UpdateProfile(req,res){
    try {
      const userID = req.user;
      const data = req.files;
      if(!data || !data.profile){
        return SendError(res,400,EMessage.BadRequest + " profile")
      }
      const checkUser = "Select * from user where userID=?";
      connected.query(checkUser,userID, async(err,result)=>{
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        const imgUrl = 
        await UploadImageToServer(data.profile.data,data.profile.mimetype);
        if(!imgUrl) return SendError(res, 404, EMessage.NotFound,imgUrl);
        const update =
          "Update user set profile=? where userID=?";
        connected.query(update, [imgUrl, userID], (isError) => {
          if (isError) return SendError(res, 404, EMessage.Eupdate, isError);
          return SendSuccess(res, SMessage.Updated,imgUrl);
        });
      })
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async EditProfile(req, res) {
    try {
      const userID = req.user;
      const { username, phoneNumber } = req.body;
      const validate = await ValidateData({ username, phoneNumber });
      if (validate.length > 0) {
        return SendError(res, 400, EMessage.BadRequest + validate.join(","));
      }
      // check user
      const checkUser = "Select * from user where userID=?";
      connected.query(checkUser, userID, async (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        const update =
          "Update user set username=?,phoneNumber=? where userID=?";
        connected.query(update, [username, phoneNumber, userID], (isError) => {
          if (isError) return SendError(res, 404, EMessage.Eupdate, isError);
          return SendSuccess(res, SMessage.Updated);
        });
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async Login(req, res) {
    try {
      const { email, password } = req.body;
      const validate = await ValidateData({ email, password });
      if (validate.length > 0) {
        return SendError(res, 400, EMessage.BadRequest + validate.join(","));
      }
      const checkEmail = "select * from user where email=?";
      connected.query(checkEmail, email, async (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        const decryptPassword = await Decrypt(result[0]["password"]);
        if (decryptPassword !== password) {
          return SendError(res, 400, EMessage.IsMatch);
        }
        const token = await GenerateToken(result[0]["userID"]);
        if (!token) return SendError(res, 400, EMessage.EToken);
        return SendSuccess(res, SMessage.Login, token);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }

  static async Register(req, res) {
    try {
      // request body
      const { username, email, phoneNumber, password } = req.body;
      // validate data
      const validate = await ValidateData({
        username,
        email,
        phoneNumber,
        password,
      });
      if (validate.length > 0) {
        return SendError(res, 400, EMessage.BadRequest + validate.join(","));
      }
      const userID = uuidv4();
      const datetime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      //check email already
      const select = "select * from user where email=?";
      connected.query(select, email, async (error, isMatch) => {
        if (error) throw error;
        if (isMatch[0]) return SendError(res, 208, SMessage.EmailAlready);

        // insert mysql
        const insert = `Insert into user(userID,username,email,phoneNumber,password,role,createdAt,updatedAt)
       values (?,?,?,?,?,?,?,?)`;
        const genPassword = await Encrypt(password);
        const data = [
          userID,
          username,
          email,
          phoneNumber,
          genPassword,
          Role.user,
          datetime,
          datetime,
        ];
        connected.query(insert, data, (err) => {
          if (err) return SendError(res, 404, EMessage.ERegister, err);
          return SendCreate(res, SMessage.Register);
        });
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
}
