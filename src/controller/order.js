import { UploadImageToCloud } from "../config/cloudinary.js";
import connected from "../config/db_mysql.js";
import { EMessage, SMessage } from "../service/message.js";
import { SendError, SendCreate, SendSuccess } from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import { v4 as uuidv4 } from "uuid";
import { CheckStatusOrder, FindOneOrder, FindOneTable } from "../service/service.js";

export default class OrderController {
 
  static async SelectAll(req, res) {
    try {
      const select = `Select orderID,paymentType,priceTotal,orders.tableID,tables.tableName,orders.orderStatus,orders.createdAt,orders.updatedAt from orders
          INNER JOIN tables on orders.tableID COLLATE utf8mb4_general_ci = tables.tableID`;
      connected.query(select, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + " order", err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        return SendSuccess(res, SMessage.SelectAll, result);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async SelectOne(req, res) {
    try {
      const orderID = req.params.orderID;
      if (!orderID) {
        return SendError(res, 400, EMessage.BadRequest);
      }
      const checkOrder = await FindOneOrder(orderID);
      if (!checkOrder) {
        return SendError(res, 404, EMessage.NotFound + "orderID");
      }
      const select = `Select orderID,paymentType,priceTotal,orders.tableID,tables.tableName,orders.orderStatus,orders.createdAt,orders.updatedAt from orders
          INNER JOIN tables on orders.tableID COLLATE utf8mb4_general_ci = tables.tableID
          WHERE orderID=?`;
      connected.query(select, orderID, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + " order", err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        return SendSuccess(res, SMessage.SelectAll, result[0]);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async SelectByStatus(req, res) {
    try {
      const status = req.params.status;
      if (!status) {
        return SendError(res, 400, EMessage.BadRequest);
      }
      const checkOrder = await CheckStatusOrder(status);
      if (!checkOrder) {
        return SendError(res, 404, EMessage.NotFound + "status");
      }
      const select = `Select orderID,paymentType,priceTotal,orders.tableID,tables.tableName,orders.orderStatus,orders.createdAt,orders.updatedAt from orders
          INNER JOIN tables on orders.tableID COLLATE utf8mb4_general_ci = tables.tableID
          WHERE orders.orderStatus=?`;
      connected.query(select, status, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + " order", err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        return SendSuccess(res, SMessage.SelectBy, result);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async insert(req, res) {
    try {
      const { tableID } = req.body;
      const validate = await ValidateData({tableID});
      if (validate.length > 0) {
        return SendError(res, 400, EMessage.BadRequest + validate.join(","));
      }
      const orderID = uuidv4();
      const checkTableID = await FindOneTable(tableID);
      if (!checkTableID) return SendError(res, 404, EMessage.NotFound);
      const insert = `Insert into orders (orderID,tableID) 
      values(?,?)`;
      connected.query(insert, [orderID, tableID], (err) => {
        if (err) return SendError(res, 404, EMessage.EInsert, err);
        return SendCreate(res, SMessage.Insert,orderID);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async updateStatus(req, res) {
    try {
      const orderID = req.params.orderID;
      if (!orderID) {
        return SendError(res, 400, EMessage.BadRequest);
      }
      const checkOrder = await FindOneOrder(orderID);
      if (!checkOrder) {
        return SendError(res, 404, EMessage.NotFound + "orderID");
      }
      const { paymentType, priceTotal } = req.body;
      const validate = await ValidateData({paymentType,priceTotal});
      if (validate.length > 0) {
        return SendError(res, 400, EMessage.BadRequest + validate.join(","));
      }
      const status = 1; // fix status ໃຫ້ success ເປັນປະຫວັດ
      const updated = `Update orders set paymentType=?,priceTotal=?,orderStatus=? where orderID=?`;
      connected.query(
        updated,
        [paymentType, priceTotal, status, orderID],
        (err) => {
          if (err) return SendError(res, 404, EMessage.Eupdate, err);
          return SendSuccess(res, SMessage.Updated);
        }
      );
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async DeleteOrders(req, res) {
    try {
      const orderID = req.params.orderID;
      if (!orderID) {
        return SendError(res, 400, EMessage.BadRequest);
      }
      const checkOrder = await FindOneOrder(orderID);
      if (!checkOrder) {
        return SendError(res, 404, EMessage.NotFound + "orderID");
      }
      const deleted = "Delete from orders where orderID=?";
      connected.query(deleted, orderID, (err) => {
        if (err) return SendError(res, 404, EMessage.Edelet, err);
        return SendSuccess(res, SMessage.Delete);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
}
