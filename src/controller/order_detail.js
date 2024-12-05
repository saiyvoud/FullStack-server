import { UploadImageToCloud } from "../config/cloudinary.js";
import connected from "../config/db_mysql.js";
import { EMessage, SMessage } from "../service/message.js";
import { SendError, SendCreate, SendSuccess } from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import { v4 as uuidv4 } from "uuid";
import {
  FindOneOrder,
  FindOneProduct,
  FindOneTable,
} from "../service/service.js";

export default class OrderDetailController {
  static async SelectAll(req, res) {
    try {
   
    const select = `Select * from order_detail 
    INNER JOIN orders on order_detail.orderID COLLATE utf8mb4_general_ci = orders.orderID
    INNER JOIN tables on orders.tableID COLLATE utf8mb4_general_ci = tables.tableID
    INNER JOIN product on order_detail.productID COLLATE utf8mb4_general_ci = product.productID
    INNER JOIN category on product.categoryID COLLATE utf8mb4_general_ci = category.categoryID
    `;
      connected.query(select, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + " order_detail", err);
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
      const validate = await ValidateData({orderID,productID,amount});
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
}
