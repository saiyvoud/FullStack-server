import { UploadImageToCloud } from "../config/cloudinary.js";
import connected from "../config/db_mysql.js";
import { EMessage, SMessage } from "../service/message.js";
import { SendError, SendCreate, SendSuccess } from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import { v4 as uuidv4 } from "uuid";
export default class CategoryController {
  static async SelectOne(req, res) {
    try {
      const categoryID = req.params.categoryID;
      const select = "Select * from category where categoryID=?";
      connected.query(select, categoryID, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + "category");
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        return SendSuccess(res, SMessage.SelectOne, result[0]);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async SelectAll(req, res) {
    try {
      const select = "Select * from category";
      connected.query(select, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + "category");
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
      const { categoryName } = req.body;
      if (!categoryName) {
        return SendError(res, 400, EMessage.BadRequest);
      }
      const categoryID = uuidv4();
      const inserted = `insert into category (categoryID,categoryName) values (?,?)`;
      connected.query(inserted, [categoryID, categoryName], (err) => {
        if (err) return SendError(res, 404, EMessage.NotFound);
        return SendCreate(res, SMessage.Insert);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async updateCategory(req, res) {
    try {
      const categoryID = req.params.categoryID;
      const { categoryName } = req.body;
      if (!categoryName) return SendError(res, 400, EMessage.BadRequest);
      const checkCategoryID = "Select * from category where categoryID=?";

      connected.query(checkCategoryID, categoryID, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        const datetime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
        const updated =
          "Update category set categoryName=? , updatedAt=? where categoryID=?";
        connected.query(updated, [categoryName, datetime], (errUpdate) => {
          if (errUpdate) return SendError(res, 404, EMessage.NotFound);
          return SendSuccess(res, SMessage.Updated);
        });
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async deletecategory(req, res) {
    try {
      const categoryID = req.params.categoryID;
      const checkCategoryID = "Select * from category where categoryID=?";
      connected.query(checkCategoryID, categoryID, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        const deleted = "delete from category where categoryID=?";
        connected.query(deleted, categoryID, (errDelete) => {
          if (errDelete)
            return SendError(res, 404, EMessage.NotFound, errDelete);
          return SendSuccess(res, SMessage.Delete, result[0]);
        });
      });
    } catch (error) {
      return SendError(res,500,EMessage.Eserver,error);
    }
  }
}
