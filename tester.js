import  QRCode  from "qrcode";
import  express  from "express";
let data = {
    name:"Employee Name",
    age:27,
    department:"Police",
    id:"aisuoiqu3234738jdhf100223"
}
let stringdata = JSON.stringify(data)

QRCode.toString(stringdata,{type:'terminal'}, function (err, url) {
    if(err) return console.log("error occurred")
    console.log(url)
  })

  // Get the base64 url
QRCode.toDataURL(stringdata, function (err, url) {
    if(err) return console.log("error occurred")
    console.log(url)
})
const app = express();
app.listen(5000,()=>{
    console.log(`http://localhost:5000`);
});