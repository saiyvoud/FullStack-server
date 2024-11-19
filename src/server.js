import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { PORT } from "./config/globalKey.js";
import "./config/db_mysql.js"
import router from "./router/route.js";
import fileUpload from "express-fileupload";

const app = express();
app.use(fileUpload())
app.use("/api/v1/upload",express.static("asstes"));
app.use(cors())
app.use(bodyParser.json({extended: true,parameterLimit: 500,limit: "500mb"}));
app.use(bodyParser.urlencoded({extended: true,parameterLimit: 5000,limit: "500mb"}))
app.use("/api/v1",router);

app.listen(PORT,()=>{
    console.log(`http://localhost:${PORT}`);
  
});