import express from "express";
import BannerController from "../controller/banner.js";
import CategoryController from "../controller/category.js";
import EmployeeController from "../controller/employee.js";
import UnitController from "../controller/unit.js";
import UserCotroller from "../controller/user.controller.js";
import {auth} from "../middleware/auth.js"

const router = express.Router();
// ------ auth ------
const user = "/user";
router.get(`${user}/getAll`,auth,UserCotroller.SelectAll);
router.get(`${user}/getOne/:userID`,auth,UserCotroller.SelectOne);
router.post(`${user}/login`, UserCotroller.Login);
router.post(`${user}/register`, UserCotroller.Register);
router.put(`${user}/forgot`,UserCotroller.ForgetPassword);
router.put(`${user}/changePassword`,auth,UserCotroller.ChangePassword);
router.put(`${user}/edit`,auth,UserCotroller.EditProfile);
router.put(`${user}/update`,auth,UserCotroller.UpdateProfile);
//-------- employee -----
const employee = "/employee";
router.get(`${employee}/getAll`,auth,EmployeeController.SelectAll);
router.get(`${employee}/getOne/:emplyID`,auth,EmployeeController.SelectOne);
router.post(`${employee}/insert`,auth,EmployeeController.insert)
router.put(`${employee}/update/:emplyID`,auth,EmployeeController.updateEmployee)
router.put(`${employee}/updateDocImage/:emplyID`,auth,EmployeeController.updateDocImage)
router.put(`${employee}/updateStatus/:emplyID`,auth,EmployeeController.updateStatusEmployee)
//------- category ----
const category = "/category";
router.get(`${category}/getAll`,auth,CategoryController.SelectAll);
router.get(`${category}/getOne/:categoryID`,auth,CategoryController.SelectOne);
router.post(`${category}/insert`,auth,CategoryController.insert);
router.put(`${category}/update/:categoryID`,auth,CategoryController.updateCategory);
router.delete(`${category}/delete/:categoryID`,auth,CategoryController.deletecategory);
// ------ unit ------
const unit = "/unit";
router.get(`${unit}/getAll`,auth,UnitController.SelectAll);
router.get(`${unit}/getOne/:categoryID`,auth,UnitController.SelectOne);
router.post(`${unit}/insert`,auth,UnitController.insert);
router.put(`${unit}/update/:categoryID`,auth,UnitController.updateunit);
router.delete(`${unit}/delete/:categoryID`,auth,UnitController.deleteunit);
//------- banner ------
const banner = "/banner";
router.get(`${banner}/getAll`,auth,BannerController.SelectAll);
router.get(`${banner}/getOne/:bannerID`,auth,BannerController.SelectOne);
router.post(`${banner}/insert`,auth,BannerController.insert);
router.put(`${banner}/update/:bannerID`,auth,BannerController.updatedBanner);
router.delete(`${banner}/delete/:bannerID`,auth,BannerController.deleteBanner);
export default router;