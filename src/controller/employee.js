import { UploadImageToCloud } from "../config/cloudinary.js";
import connected from "../config/db_mysql.js";
import { EMessage, SMessage } from "../service/message.js";
import { SendCreate, SendError, SendSuccess } from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import { v4 as uuidv4 } from "uuid";
import { DATETIME } from "../config/globalKey.js";
export default class EmployeeController {
  static async SelectOne(req, res) {
    try {
      const emplyID = req.params.emplyID;
      const select = "Select * from employee where emplyID=?";
      connected.query(select, emplyID, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + "employee");
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        return SendSuccess(res, SMessage.SelectOne, result[0]);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async SelectAll(req, res) {
    try {
      const select = "Select * from employee";
      connected.query(select, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + "employee");
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        return SendSuccess(res, SMessage.SelectAll, result);
      });
    } catch (error) {
      console.log(error);
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async insert(req, res) {
    try {
      const { userID, firstname, lastname, phoneNumber, address, birthday } =
        req.body;
      const validate = await ValidateData({
        userID,
        firstname,
        lastname,
        phoneNumber,
        address,
        birthday,
      });

      if (validate.length > 0) {
        return SendError(res, 400, EMessage.BadRequest + validate.join(","));
      }
      const data = req.files;
      if (!data || !data.docImage) {
        return SendError(res, 400, EMessage.BadRequest + "docImage");
      }
      const checkUser = "select * from user where userID=?";
      const checkUserInEmployee = "select * from employee where userID=?";
      connected.query(checkUser, userID, async (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound, err);
        connected.query(
          checkUserInEmployee,
          userID,
          async (errEmply, employee) => {
            if (errEmply)
              return SendError(res, 404, EMessage.NotFound, errEmply);
            if (employee[0]) return SendError(res, 208, SMessage.UserAlready);
            const img_url = await UploadImageToCloud(
              data.docImage.data, // buffer ແມ່ນພາບທີ່ແຕກເປັນ pixel ຕ່າງໆແລ້ວລວມກັນ
              data.docImage.mimetype // ນາມສະກຸໄຟ
            );
            const insertEmpl = `Insert Into employee 
          (emplyID,userID,firstname,lastname, phoneNumber,address,
          birthday,docImage) values (?,?,?,?,?,?,?,?)`;
            const emplyID = uuidv4();
            connected.query(
              insertEmpl,
              [
                emplyID,
                userID,
                firstname,
                lastname,
                phoneNumber,
                address,
                birthday,
                img_url,
              ],
              (errInsert) => {
                if (errInsert)
                  return SendError(res, 400, EMessage.BadRequest, errInsert);
                return SendCreate(res, SMessage.Insert);
              }
            );
          }
        );
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async updateEmployee(req, res) {
    try {
      const emplyID = req.params.emplyID;
      const { firstname, lastname, phoneNumber, address, birthday } = req.body;
      const validate = await ValidateData({
        firstname,
        lastname,
        phoneNumber,
        address,
        birthday,
      });
      if (validate.length > 0) {
        return SendError(res, 400, EMessage.BadRequest);
      }
      const checkEmply = "select * from employee where emplyID=?";
      connected.query(checkEmply, emplyID, (err, resul) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        if (!resul[0]) return SendError(res, 404, EMessage.NotFound);
        const update = `Update employee set 
        firstname=?,lastname=?,phoneNumber=?,address=?,birthday=? 
        where emplyID=?`;
        const data = [
          firstname,
          lastname,
          phoneNumber,
          address,
          birthday,
          emplyID,
        ];
        connected.query(update, data, (errUpdate) => {
          if (errUpdate)
            return SendError(res, 404, EMessage.Eupdate, errUpdate);
          return SendSuccess(res, SMessage.Updated, data);
        });
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async updateDocImage(req, res) {
    try {
      const emplyID = req.params.emplyID;
      // const oldDocImage = req.body;
      // if (!oldDocImage) return SendError(res, 400, EMessage.BadRequest);

      const newDocImage = req.files;
      if (!newDocImage || !newDocImage.newDocImage) {
        return SendError(res, 400, EMessage.BadRequest);
      }
   
      const checkEmply = "select * from employee where emplyID=?";
      connected.query(checkEmply, emplyID, async (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        const img_url = await UploadImageToCloud(
          newDocImage.newDocImage.data,
          newDocImage.newDocImage.mimetype,
          // oldDocImage
        );
        if (!img_url) {
          return SendError(res, 404, EMessage.EUpload, img_url);
        }

        const updated = `Update employee set docImage=?,updatedAt=? where emplyID=?`;
        connected.query(updated, [img_url, DATETIME, emplyID], (errUpdate) => {
          if (errUpdate)
            return SendError(res, 404, EMessage.NotFound, errUpdate);
          return SendSuccess(res, SMessage.Updated, img_url);
        });
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async updateStatusEmployee(req, res) {
    try {
      const emplyID = req.params.emplyID;
      const { status } = req.body;
      if (!status) return SendError(res, 400, EMessage.BadRequest);
      const checkEmply = "select * from employee where emplyID=?";
      connected.query(checkEmply, emplyID, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        const updated = `Update employee set isActive=?, updatedAt=? where emplyID=?`;
        connected.query(updated, [status,DATETIME,emplyID], (errUpdate) => {
          if (errUpdate) return SendError(res, 404, EMessage.NotFound,errUpdate);
          return SendSuccess(res, SMessage.Updated, status);
        });
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
}
