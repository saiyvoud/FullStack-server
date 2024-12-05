import { UploadImageToCloud } from "../config/cloudinary.js";
import connected from "../config/db_mysql.js";
import { EMessage, SMessage } from "../service/message.js";
import {
  FindOneCategory,
  FindOneProduct,
  FindOneUnit,
} from "../service/service.js";
import { SendError, SendCreate, SendSuccess } from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import { v4 as uuidv4 } from "uuid";
export default class ProductController {
  static async SelectByCategory(req, res) {
    try {
      const categoryID = req.params.categoryID;
      const select = `Select productID,product.categoryID,category.categoryName,proName_la,
      proName_en,proDetail_la,proDetail_en,proPrice,proQty,product.image,proStatus,
      product.createdAt,product.updatedAt from product
      INNER JOIN category on product.categoryID COLLATE utf8mb4_general_ci = category.categoryID
      WHERE product.categoryID=?`;

      connected.query(select, categoryID, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + "product");
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        return SendSuccess(res, SMessage.SelectBy, result);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async SelectOne(req, res) {
    try {
      const productID = req.params.productID;
      const select = `Select productID,product.categoryID,category.categoryName,proName_la,
      proName_en,proDetail_la,proDetail_en,proPrice,proQty,product.image,proStatus,
      product.createdAt,product.updatedAt from product
      INNER JOIN category on product.categoryID COLLATE utf8mb4_general_ci = category.categoryID
      WHERE productID=?`;

      connected.query(select, productID, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + "product");
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        return SendSuccess(res, SMessage.SelectOne, result[0]);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async SelectAll(req, res) {
    try {
      const select = `Select productID,product.categoryID,category.categoryName,proName_la,
      proName_en,proDetail_la,proDetail_en,proPrice,proQty,product.image,proStatus,
      product.createdAt,product.updatedAt from product
      INNER JOIN category on product.categoryID COLLATE utf8mb4_general_ci = category.categoryID`;

      connected.query(select, (err, result) => {
        if (err)
          return SendError(res, 404, EMessage.NotFound + " product", err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        return SendSuccess(res, SMessage.SelectAll, result);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async insert(req, res) {
    try {
      const {
        categoryID,
        proName_la,
        proName_en,
        proDetail_la,
        proDetail_en,
        proPrice,
        proQty,
      } = req.body;
      const validate = await ValidateData({
        categoryID,
        proName_la,
        proName_en,
        proDetail_la,
        proDetail_en,
        proPrice,
        proQty,
      });
      if (validate.length > 0) {
        return SendError(res, 400, EMessage.BadRequest + validate.join(","));
      }
      const data = req.files;
      if (!data || !data.image) {
        return SendError(res, 400, EMessage.BadRequest);
      }
      const productID = uuidv4();
      const checkCategory = await FindOneCategory(categoryID); // ຕ້ອງສ້າງ module ຂື້ນມາໃນ service
      if (!checkCategory) {
        return SendError(res, 404, EMessage.NotFound + "category");
      }

      const img_url = await UploadImageToCloud(
        data.image.data,
        data.image.mimetype
      );
      if (!img_url) return SendError(res, 404, EMessage.EUpload);
      const inserted = `Insert into product 
      (productID,categoryID,proName_la,proName_en,proDetail_la,proDetail_en,proPrice,proQty,image)
      values (?,?,?,?,?,?,?,?,?)`;
      const newData = [
        productID,
        categoryID,
        proName_la,
        proName_en,
        proDetail_la,
        proDetail_en,
        proPrice,
        proQty,
        img_url,
      ];
      connected.query(inserted, newData, (err) => {
        if (err) return SendError(res, 404, EMessage.EInsert, err);
        return SendCreate(res, SMessage.Insert, newData);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }

  static async updateProduct(req, res) {
    try {
      const productID = req.params.productID;
      const checkProduct = await FindOneProduct(productID);
      if (!checkProduct) return SendError(res, EMessage.NotFound, checkProduct);
      const {
        categoryID,

        proName_la,
        proName_en,
        proDetail_la,
        proDetail_en,
        proPrice,
        proQty,
      } = req.body;
      const validate = await ValidateData({
        categoryID,

        proName_la,
        proName_en,
        proDetail_la,
        proDetail_en,
        proPrice,
        proQty,
      });
      if (validate.length > 0) {
        return SendError(res, 400, EMessage.BadRequest + validate.join(","));
      }
      const data = req.files;
      if (!data || !data.image) {
        return SendError(res, 400, EMessage.BadRequest);
      }
      const checkCategory = await FindOneCategory(categoryID); // ຕ້ອງສ້າງ module ຂື້ນມາໃນ service
      if (!checkCategory) {
        return SendError(res, 404, EMessage.NotFound + "category");
      }
     
      const img_url = await UploadImageToCloud(
        data.image.data,
        data.image.mimetype
      );
      if (!img_url) return SendError(res, 404, EMessage.EUpload);
      const updated = `Update product set 
      categoryID=?,proName_la=?,proName_en=?,
      proDetail_la=?,proDetail_en=?,proPrice=?,proQty=?,image=?
      where productID =?`;
      const newData = [
        categoryID,

        proName_la,
        proName_en,
        proDetail_la,
        proDetail_en,
        proPrice,
        proQty,
        img_url,
        productID,
      ];
      connected.query(updated, newData, (err) => {
        if (err) return SendError(res, 404, EMessage.Eupdate, err);
        return SendCreate(res, SMessage.Updated, newData);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async deleteProduct(req, res) {
    try {
      const productID = req.params.productID;
      const checkproductID = "Select * from product where productID=?";
      connected.query(checkproductID, productID, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        const deleted = "delete from product where productID=?";
        connected.query(deleted, productID, (errDelete) => {
          if (errDelete)
            return SendError(res, 404, EMessage.NotFound, errDelete);
          return SendSuccess(res, SMessage.Delete, result[0]);
        });
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async updateStatus(req, res) {
    try {
      const productID = req.params.productID;
      const { status } = req.body;
      if (!status) return SendError(res, 400, EMessage.BadRequest);
      const checkProduct = await FindOneProduct(productID);
      if (!checkProduct) return SendError(res, 404, EMessage.NotFound);
      const updated = "update product set proStatus=?  where productID=?";
      const newData = [status, productID];
      connected.query(updated, newData, (errUpdate) => {
        if (errUpdate) return SendError(res, 404, EMessage.NotFound, errUpdate);
        return SendSuccess(res, SMessage.UpdateStatus, newData);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
}
