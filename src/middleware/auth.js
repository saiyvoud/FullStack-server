import { EMessage } from "../service/message.js";
import { SendError } from "../service/response.js";
import { VerifyToken } from "../service/service.js";

export const auth = async (req, res, next) => {
  try {
    const authorization = req.headers["authorization"];
    if (!authorization) {
      return SendError(res, 401, EMessage.Uaunthorizate);
    }
    const token = authorization.replace("Bearer ", "");
    if (!token) return SendError(res, 401, EMessage.Uaunthorizate);
    const verify = await VerifyToken(token); //Must be Create Function Module
    if (!verify) return SendError(res, 401, EMessage.Uaunthorizate);

    req.user = verify;

    next();
  } catch (error) {
   
    return SendError(res, 500, EMessage.Uaunthorizate, error);
  }
};
