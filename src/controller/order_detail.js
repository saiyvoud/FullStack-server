import { UploadImageToCloud } from "../config/cloudinary.js";
import connected from "../config/db_mysql.js";
import { EMessage, SMessage } from "../service/message.js";
import { SendError, SendCreate, SendSuccess } from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import { v4 as uuidv4 } from "uuid";
import {
  CheckOrderDetail,
  FindOneOrder,
  FindOneProduct,
  FindOneTable,
} from "../service/service.js";

export default class OrderDetailController {
  static async SelectBy(req, res) {
    try {
      const orderID = req.params.orderID;
      if (!orderID) return SendError(res, 400, EMessage.BadRequest);
      const select = `Select * from order_detail 
    INNER JOIN orders on order_detail.orderID COLLATE utf8mb4_general_ci = orders.orderID
    INNER JOIN tables on orders.tableID COLLATE utf8mb4_general_ci = tables.tableID
    INNER JOIN product on order_detail.productID COLLATE utf8mb4_general_ci = product.productID
    INNER JOIN category on product.categoryID COLLATE utf8mb4_general_ci = category.categoryID
    WHERE order_detail.orderID=?
    `;
      connected.query(select, orderID, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + " orders", err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        return SendSuccess(res, SMessage.SelectAll, result);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async SelectOne(req, res) {
    try {
      const order_detail_ID = req.params.order_detail_ID;
      if (!order_detail_ID) return SendError(res, 400, EMessage.BadRequest);
      const select = `Select * from order_detail 
    INNER JOIN orders on order_detail.orderID COLLATE utf8mb4_general_ci = orders.orderID
    INNER JOIN tables on orders.tableID COLLATE utf8mb4_general_ci = tables.tableID
    INNER JOIN product on order_detail.productID COLLATE utf8mb4_general_ci = product.productID
    INNER JOIN category on product.categoryID COLLATE utf8mb4_general_ci = category.categoryID
    WHERE order_detail_ID=?
    `;
      connected.query(select, order_detail_ID, (err, result) => {
        if (err)
          return SendError(res, 404, EMessage.NotFound + " order_detail", err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        return SendSuccess(res, SMessage.SelectAll, result[0]);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async SelectAll(req, res) {
    try {
      const select = `Select * from order_detail 
    INNER JOIN orders on order_detail.orderID COLLATE utf8mb4_general_ci = orders.orderID
    INNER JOIN tables on orders.tableID COLLATE utf8mb4_general_ci = tables.tableID
    INNER JOIN product on order_detail.productID COLLATE utf8mb4_general_ci = product.productID
    INNER JOIN category on product.categoryID COLLATE utf8mb4_general_ci = category.categoryID
    `;
      connected.query(select, (err, result) => {
        if (err)
          return SendError(res, 404, EMessage.NotFound + " order_detail", err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        return SendSuccess(res, SMessage.SelectAll, result);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }

  static async Insert(req, res) {
    try {
      const { orderID, productID, amount } = req.body;
      const validate = await ValidateData({ orderID, productID, amount });
      if (validate.length > 0) {
        return SendError(res, 400, EMessage.BadRequest + validate.join(","));
      }
      const checkOrderID = await FindOneOrder(orderID);
      if (!checkOrderID) {
        return SendError(res, 404, EMessage.NotFound + "order");
      }
      const checkProduct = await FindOneProduct(productID);
      if (!checkProduct) {
        return SendError(res, 404, EMessage.BadRequest + "product");
      }
      const order_detail_ID = uuidv4();
      const inserted = `insert into order_detail (order_detail_ID,orderID,productID,amount) 
      values (?,?,?,?)`;
      connected.query(
        inserted,
        [order_detail_ID, orderID, productID, amount],
        (err) => {
          if (err) return SendError(res, 404, EMessage.EInsert, err);
          return SendCreate(res, SMessage.Insert);
        }
      );
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async UpdateOrderDetail(req, res) {
    try {
      const order_detail_ID = req.params.order_detail_ID;
      if (!order_detail_ID) return SendError(res, 400, EMessage.BadRequest);
      const checkOrderDetail = await CheckOrderDetail(order_detail_ID);
      if (!checkOrderDetail) return SendError(res, 404, EMessage.NotFound);
      const { amount } = req.body;
      if (!amount) {
        return SendError(res, 400, EMessage.BadRequest);
      }
      const updated =
        "Update order_detail set amount=? where order_detail_ID=?";
      connected.query(updated, [amount, order_detail_ID], (err) => {
        if (err) return SendError(res, 404, EMessage.Eupdate, err);
        return SendSuccess(res, SMessage.Updated);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async DeleteOrderDetail(req, res) {
    try {
      const order_detail_ID = req.params.order_detail_ID;
      if (!order_detail_ID) return SendError(res, 400, EMessage.BadRequest);
      const checkOrderDetail = await CheckOrderDetail(order_detail_ID);
      if (!checkOrderDetail) return SendError(res, 404, EMessage.NotFound);
      const deleted = "Delete from order_detail where order_detail_ID=?";
      connected.query(deleted, order_detail_ID, (err) => {
        if (err) return SendError(res, 404, EMessage.Edelet, err);
        return SendSuccess(res, SMessage.Delete);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
}
