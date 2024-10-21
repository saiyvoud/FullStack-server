import express from "express";
import UserCotroller from "../controller/user.controller.js";
const router = express.Router();
// ------ auth ------
const user = "/user";
router.post(`${user}/login`, UserCotroller.Login);
router.post(`${user}/register`, UserCotroller.Register);
export default router;