import { UploadImageToCloud } from "../config/cloudinary.js";
import connected from "../config/db_mysql.js";
import { EMessage, SMessage } from "../service/message.js";
import { SendError, SendCreate, SendSuccess } from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import { v4 as uuidv4 } from "uuid";
export default class BannerController {
  static async SelectOne(req, res) {
    try {
      const bannerID = req.params.bannerID;
      const select = "Select * from banner where bannerID=?";
      connected.query(select, bannerID, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + "banner");
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        return SendSuccess(res, SMessage.SelectOne, result[0]);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async SelectAll(req, res) {
    try {
      const select = "Select * from banner";
      connected.query(select, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + "banner");
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
      const { title } = req.body;
      if (!title) return SendError(res, 400, EMessage.BadRequest);
      const data = req.files;
      if (!data || !data.image) {
        return SendError(res, 400, EMessage.BadRequest);
      }
      const img_url = await UploadImageToCloud(
        data.image.data,
        data,
        image.mimetype
      );
      const bannerID = uuidv4();
      if (!img_url) return SendError(res, 404, EMessage.NotFound);
      const insert = "Insert into banner (bannerID,title,image) values(?,?,?)";
      connected.query(insert, [bannerID, title, img_url], (err) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        return SendCreate(res, SMessage.Insert);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async updatedBanner(req, res) {
    try {
      const bannerID = req.params.bannerID;
      const { title, oldImage } = req.body;
      const validate = await ValidateData({ title, oldImage });
      if (validate.length > 0) {
        return SendError(res, 400, EMessage.BadRequest);
      }
      const data = req.files;
      if (!data || !data.image) {
        return SendError(res, 400, EMessage.BadRequest);
      }

      const checkbannerID = "Select * from banner where bannerID=?";
      connected.query(checkbannerID, bannerID, async (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        if (!result[0]) return SendError(res, 400, EMessage.NotFound);
        const img_url = await UploadImageToCloud(
          data.image.data,
          data,
          image.mimetype,
          oldImage
        );
        if (!img_url) return SendError(res, 404, EMessage.NotFound);
        const datetime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
        const updated = `Update banner set title=?,image=?,updatedAt=? where bannerID=?`;
        connected.query(
          updated,
          [title, img_url, datetime, bannerID],
          (errUpdate) => {
            if (errUpdate) return SendError(res, 404, EMessage.NotFound, err);
            return SendSuccess(res, SMessage.Updated);
          }
        );
      });
    } catch (error) {
      return SendError(res, 500, EMessage.Eserver, error);
    }
  }
  static async deleteBanner(req, res) {
    try {
      const bannerID = req.params.bannerID;
      const checkbannerID = "Select * from banner where bannerID=?";
      connected.query(checkbannerID, bannerID, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound);
        const deleted = "delete from banner where bannerID=?";
        connected.query(deleted, bannerID, (errDelete) => {
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
