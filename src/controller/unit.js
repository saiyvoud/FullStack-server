import { UploadImageToCloud } from "../config/cloudinary.js";
import connected from "../config/db_mysql.js";
import { EMessage, SMessage } from "../service/message.js";
import { SendError, SendCreate, SendSuccess } from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import { v4 as uuidv4 } from "uuid";
export default class UnitController {
  static async SelectOne(req, res) {
    try {
      const unitID = req.params.unitID;
      const select = "Select * from unit where unitID=?";
      connected.query(select, unitID, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + "unit");
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        return SendSuccess(res, SMessage.SelectOne, result[0]);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async SelectAll(req, res) {
    try {
      const select = "Select * from unit";
      connected.query(select, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + "unit");
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
      const { unitName } = req.body;
      if (!unitName) {
        return SendError(res, 400, EMessage.BadRequest);
      }
      const unitID = uuidv4();
      const inserted = `insert into unit (unitID,unitName) values (?,?)`;
      connected.query(inserted, [unitID, unitName], (err) => {
        if (err) return SendError(res, 404, EMessage.NotFound);
        return SendCreate(res, SMessage.Insert);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async updateunit(req, res) {
    try {
      const unitID = req.params.unitID;
      const { unitName } = req.body;
      if (!unitName) return SendError(res, 400, EMessage.BadRequest);
      const checkunitID = "Select * from unit where unitID=?";

      connected.query(checkunitID, unitID, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        const datetime = new Date()
          .toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, "");
        const updated =
          "Update unit set unitName=? , updatedAt=? where unitID=?";
        connected.query(updated, [unitName, datetime], (errUpdate) => {
          if (errUpdate) return SendError(res, 404, EMessage.NotFound);
          return SendSuccess(res, SMessage.Updated);
        });
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async deleteunit(req, res) {
    try {
      const unitID = req.params.unitID;
      const checkunitID = "Select * from unit where unitID=?";
      connected.query(checkunitID, unitID, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        const deleted = "delete from unit where unitID=?";
        connected.query(deleted, unitID, (errDelete) => {
          if (errDelete)
            return SendError(res, 404, EMessage.NotFound, errDelete);
          return SendSuccess(res, SMessage.Delete, result[0]);
        });
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
}
