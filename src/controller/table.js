import { UploadImageToCloud } from "../config/cloudinary.js";
import connected from "../config/db_mysql.js";
import { EMessage, SMessage } from "../service/message.js";
import { SendError, SendCreate, SendSuccess } from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import { v4 as uuidv4 } from "uuid";
import { DATETIME } from "../config/globalKey.js";
import QRCode from "qrcode";
import { FindCheckTable, FindOneTable, GenerateQR } from "../service/service.js";
export default class TableController {
  static async SelectOne(req, res) {
    try {
      const tableID = req.params.tableID;
      const select = "Select * from tables where tableID=?";
      connected.query(select, tableID, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + "table");
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        return SendSuccess(res, SMessage.SelectOne, result[0]);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async SelectAll(req, res) {
    try {
      const select = "Select * from tables";
      connected.query(select, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + "table");
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        return SendSuccess(res, SMessage.SelectAll, result);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async insert(req, res) {
    try {
      const { tableName } = req.body;
      if (!tableName) {
        return SendError(res, 400, EMessage.BadRequest);
      }
      const tableID = uuidv4();
      const data = {
        tableID: tableID,
        tableName: tableName,
      };
      const generateQR = await GenerateQR(data);
      const inserted = `insert into tables (tableID,tableName,qrcode) values (?,?,?)`;
      connected.query(inserted, [tableID, tableName, generateQR], (err) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        return SendCreate(res, SMessage.Insert);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async OpenTable(req, res) {
    try {
      const tableID = req.params.tableID;
      if (!tableID) return SendError(res, 400, EMessage.BadRequest + "tableID");
      const checkTableID = await FindOneTable(tableID);
      if (!checkTableID) return SendError(res, 404, EMessage.NotFound);
      const { status } = req.body;
      // if (!status) return SendError(res, 400, EMessage.BadRequest);
      
      if(status !== "1" ){
        return SendError(res, 400, EMessage.BadRequest);
      }
      if(status === `${checkTableID.status}`){
        return SendError(res, 208, "Already Open Table");
      }
    
      const update = "Update tables set tableStatus=? where tableID=?";
      connected.query(update, [status, tableID], (err) => {
        if (err) return SendError(res, 404, EMessage.Eupdate, err);
        return SendSuccess(res, SMessage.UpdateStatus);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async CloseTable(req, res) {
    try {
      const tableID = req.params.tableID;
      if (!tableID) return SendError(res, 400, EMessage.BadRequest + "tableID");
      const checkTableID = await FindOneTable(tableID);
      if (!checkTableID) return SendError(res, 404, EMessage.NotFound);
      const { status } = req.body;
      if (!status) return SendError(res, 400, EMessage.BadRequest);
      if(status !== "0" ){
        return SendError(res, 400, EMessage.BadRequest);
      }
      if(status === `${checkTableID.status}`){
        return SendError(res, 208, "Already close Table");
      }
      const update = "Update tables set tableStatus=? where tableID=?";
      connected.query(update, [status, tableID], (err) => {
        if (err) return SendError(res, 404, EMessage.Eupdate, err);
        return SendSuccess(res, SMessage.UpdateStatus);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async DeleteTable(req, res) {
    try {
      const tableID = req.params.tableID;
      if (!tableID) return SendError(res, 400, EMessage.BadRequest + "tableID");
      const checkTableID = await FindOneTable(tableID);
      if (!checkTableID) return SendError(res, 404, EMessage.NotFound);
      const deleted = "delete from tables where tableID=?";
      connected.query(deleted, tableID, (err) => {
        if (err) return SendError(res, 404, EMessage.Edelet, err);
        return SendSuccess(res, SMessage.Delete);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
}
