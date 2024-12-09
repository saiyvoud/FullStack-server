import mysql from "mysql";

const connected = mysql.createConnection({
  host: "mysql-188780-0.cloudclusters.net",
  port: "10056",
  user: "admin",
  password: "4VePakuO",
  database: "db_restaurant",
});
// const connected = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "db_restaurant",
// })
connected.connect((err) => {
  if (err) console.log(`Faild Connected Database` + err);
  console.log(`Connected Database`);
});

export default connected;
